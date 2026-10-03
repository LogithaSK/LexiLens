<#
.SYNOPSIS
    Boots the LexiLens backend and reports startup time and health.

.DESCRIPTION
    Runs the packaged jar and polls until the context reports Started, then hits
    the OpenAPI and Swagger endpoints.

    Startup is dominated by classpath scanning and JIT warm-up, so this script
    pins a consistent JVM and measures from process launch rather than relying on
    the in-process Spring timer, which excludes JVM start and Maven overhead.

    -Profile dev  (default) adds -XX:TieredStopAtLevel=1, -XX:+UseSerialGC and
                   lazy bean initialization for a fast cold start.
    -Profile prod  drops the startup-only JIT/GC flags and disables lazy
                   initialization so wiring errors fail at boot.

.EXAMPLE
    .\scripts\run-backend.ps1
    .\scripts\run-backend.ps1 -Profile prod -Port 8080
    .\scripts\run-backend.ps1 -Foreground   # logs stream to the console
#>
[CmdletBinding()]
param(
    [string] $BackendPath = (Join-Path $PSScriptRoot '..\backend'),
    [ValidateSet('dev', 'prod')]
    [string] $Profile = 'dev',
    [int] $Port = 8080,
    [int] $TimeoutSeconds = 180,
    [switch] $Foreground
)

$ErrorActionPreference = 'Stop'

function Get-JdkMajor([string] $javaHome) {
    $exe = Join-Path $javaHome 'bin\java.exe'
    if (-not (Test-Path -LiteralPath $exe)) { return 0 }
    # java -version writes to stderr; capture both streams without tripping
    # PowerShell's NativeCommandError on that stderr output.
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $exe
    $psi.Arguments = '-version'
    $psi.UseShellExecute = $false
    $psi.RedirectStandardError = $true
    $psi.RedirectStandardOutput = $true
    $p = [System.Diagnostics.Process]::Start($psi)
    $out = $p.StandardOutput.ReadToEnd() + $p.StandardError.ReadToEnd()
    $p.WaitForExit()
    if ($out -match 'version "(\d+)') { return [int]$Matches[1] }
    return 0
}

function Resolve-Jdk21 {
    if ($env:JAVA_HOME -and (Get-JdkMajor $env:JAVA_HOME) -eq 21) { return $env:JAVA_HOME }
    $guesses = @(
        'C:\Program Files\Java\jdk-21.0.11',
        'C:\Program Files\Java\jdk-21',
        'C:\Program Files\Eclipse Adoptium\jdk-21'
    ) + @(Get-ChildItem 'C:\Program Files\Java' -Directory -ErrorAction SilentlyContinue |
        Where-Object Name -match '^jdk-21' | Select-Object -ExpandProperty FullName)
    foreach ($g in $guesses) {
        if (Test-Path -LiteralPath (Join-Path $g 'bin\java.exe')) { return $g }
    }
    return $null
}

$jdk = Resolve-Jdk21
if (-not $jdk) {
    Write-Error 'No JDK 21 found. This build requires JDK 21 (see pom.xml enforcer rule).'
    exit 2
}
Write-Host "Using JDK 21 at $jdk" -ForegroundColor DarkGray

$jar = Join-Path $BackendPath 'target\lexilens-ai-1.0.0.jar'
$javaExe = Join-Path $jdk 'bin\java.exe'

# Dev favours startup over peak throughput, which suits a short local loop.
$jvmArgs = @(
    '-Xss512k',
    '-Xms256m',
    '-Dfile.encoding=UTF-8'
)

if ($Profile -eq 'dev') {
    $jvmArgs = @('-XX:TieredStopAtLevel=1', '-XX:+UseSerialGC') + $jvmArgs
    $appArgsLazy = @('--spring.main.lazy-initialization=true')
}
else {
    # Prod keeps full tiered JIT so steady-state throughput is not sacrificed.
    $appArgsLazy = @('--spring.main.lazy-initialization=false')
}

if ($Foreground) {
    $args = @()
    if ($Profile -eq 'prod') { $args += '--spring.profiles.active=prod' }
    $args += $appArgsLazy
    $args += "--server.port=$Port"
    $args += "-jar"
    $args += $jar
    & $javaExe @jvmArgs @args
    exit $LASTEXITCODE
}

$logDir = Join-Path $env:TEMP 'lexilens-run'
New-Item -ItemType Directory -Path $logDir -Force | Out-Null
$stdout = Join-Path $logDir 'backend.out.log'
$stderr = Join-Path $logDir 'backend.err.log'
Remove-Item -LiteralPath $stdout, $stderr -Force -ErrorAction SilentlyContinue

if (-not (Test-Path -LiteralPath $jar)) {
    Write-Error "Jar not found at $jar. Run: mvn package -DskipTests"
    exit 2
}

$appArgs = @()
if ($Profile -eq 'prod') { $appArgs += '--spring.profiles.active=prod' }
$appArgs += $appArgsLazy
$appArgs += "--server.port=$Port"

# Order matters: JVM flags, then -jar <path>, then application arguments.
# Start-Process splits ArgumentList on whitespace and does not re-quote elements,
# so a jar path containing spaces has to be pre-quoted here.
$argList = $jvmArgs + @('-jar', ('"{0}"' -f $jar)) + $appArgs

Write-Host "Launching backend on port $Port..." -ForegroundColor Cyan
$sw = [System.Diagnostics.Stopwatch]::StartNew()
$proc = Start-Process -FilePath $javaExe -ArgumentList $argList `
    -WorkingDirectory $BackendPath -RedirectStandardOutput $stdout -RedirectStandardError $stderr `
    -WindowStyle Hidden -PassThru

$ready = $false
$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
while ((Get-Date) -lt $deadline) {
    Start-Sleep -Milliseconds 500
    if ($proc.HasExited) { break }
    if (Test-Path -LiteralPath $stdout) {
        $content = Get-Content -LiteralPath $stdout -Raw -ErrorAction SilentlyContinue
        if ($content -match 'Started LexiLensApplication in ([0-9.]+) seconds') {
            Write-Host ("Spring reports {0}s; wall clock to ready {1}s" -f $Matches[1], [math]::Round($sw.Elapsed.TotalSeconds, 1)) -ForegroundColor DarkGray
            $ready = $true
            break
        }
        if ($content -match 'APPLICATION FAILED TO START') {
            Write-Host 'Application failed to start. Last 40 log lines:' -ForegroundColor Red
            Get-Content -LiteralPath $stdout -Tail 40 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkRed }
            try { $proc.Kill() } catch { }
            exit 1
        }
    }
}

if (-not $ready) {
    if ($proc.HasExited) {
        Write-Host "Process exited with code $($proc.ExitCode). Last 40 log lines:" -ForegroundColor Red
        if (Test-Path -LiteralPath $stdout) { Get-Content -LiteralPath $stdout -Tail 40 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkRed } }
        exit 1
    }
    Write-Host "Timed out after $TimeoutSeconds s waiting for startup." -ForegroundColor Red
    try { $proc.Kill() } catch { }
    exit 1
}

$sw.Stop()
Write-Host ("Ready in {0}s (pid {1})." -f [math]::Round($sw.Elapsed.TotalSeconds, 1), $proc.Id) -ForegroundColor Green

foreach ($u in @("http://localhost:$Port/api-docs", "http://localhost:$Port/swagger-ui/index.html")) {
    try {
        $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 20
        Write-Host ("  {0} -> {1} ({2} bytes)" -f $u, $r.StatusCode, $r.RawContentLength) -ForegroundColor DarkGray
    } catch {
        Write-Host ("  {0} -> {1}" -f $u, $_.Exception.Message) -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Logs:  $stdout" -ForegroundColor DarkGray
Write-Host "Stop:  Stop-Process -Id $($proc.Id)" -ForegroundColor DarkGray
exit 0
