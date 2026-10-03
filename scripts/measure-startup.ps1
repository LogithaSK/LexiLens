<#
.SYNOPSIS
    Measures backend startup time across JVM configurations.

.DESCRIPTION
    Boots the packaged jar once per configuration on a scratch port and records
    wall-clock time until the HTTP port accepts connections. Runs each config
    -Runs times and reports the best and median.

    TCP-readiness is used rather than scraping the log because it includes JVM
    launch and Spring initialisation, whereas the "Started ... in N seconds"
    line Spring prints excludes JVM startup.

.EXAMPLE
    .\scripts\measure-startup.ps1
    .\scripts\measure-startup.ps1 -Runs 5
#>
[CmdletBinding()]
param(
    [string] $BackendPath = (Join-Path $PSScriptRoot '..\backend'),
    [string] $JarName = 'lexilens-ai-1.0.0.jar',
    [int] $Runs = 3,
    [int] $Port = 8099,
    [int] $TimeoutSeconds = 180
)

$ErrorActionPreference = 'Stop'

$jar = Join-Path $BackendPath "target\$JarName"
if (-not (Test-Path -LiteralPath $jar)) {
    Write-Error "Jar not found at $jar. Run: mvn package -DskipTests"
    exit 2
}

$java = 'C:\Program Files\Java\jdk-21.0.11\bin\java.exe'
if (-not (Test-Path -LiteralPath $java)) { Write-Error 'JDK 21 not found'; exit 2 }

$configs = [ordered]@{
    'default'       = ''
    'tiered1-sgc'   = '-XX:TieredStopAtLevel=1 -XX:+UseSerialGC -Xss512k -Xms256m'
    'tiered1-only'  = '-XX:TieredStopAtLevel=1'
    'aot-lite'      = '-XX:TieredStopAtLevel=1 -XX:+UseSerialGC -Xshare:auto -XX:+UseStringDeduplication -Djava.security.egd=file:/dev/./urandom'
}

$results = @{}

function Stop-Stray {
    Get-Process -Name java -ErrorAction SilentlyContinue |
        Where-Object { $_.Path -eq $java } |
        ForEach-Object { try { $_.Kill(); $_.WaitForExit(10000) } catch { } }
    Start-Sleep -Seconds 2
}

foreach ($name in $configs.Keys) {
    $results[$name] = @()
    for ($i = 1; $i -le $Runs; $i++) {
        Stop-Stray
        $flags = $configs[$name]
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = $java
        $psi.Arguments = "$flags -jar `"$jar`" --server.port=$Port"
        $psi.WorkingDirectory = $BackendPath
        $psi.UseShellExecute = $false
        $psi.RedirectStandardOutput = $true
        $psi.RedirectStandardError = $true
        $p = [System.Diagnostics.Process]::Start($psi)

        # Drain the pipes so a chatty app cannot block on a full buffer.
        $sink = New-Object System.Text.StringBuilder
        Register-ObjectEvent -InputObject $p -EventName OutputDataReceived -Action { } | Out-Null
        $p.BeginOutputReadLine()

        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        $ready = $false
        while ($sw.Elapsed.TotalSeconds -lt $TimeoutSeconds) {
            Start-Sleep -Milliseconds 250
            if ($p.HasExited) { break }
            if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) {
                $ready = $true
                break
            }
        }
        $sw.Stop()
        try { $p.Kill(); $p.WaitForExit(10000) } catch { }

        if ($ready) {
            $results[$name] += [math]::Round($sw.Elapsed.TotalSeconds, 2)
            Write-Host ("  [{0}] run {1}/{2}: {3}s" -f $name, $i, $Runs, [math]::Round($sw.Elapsed.TotalSeconds, 2)) -ForegroundColor DarkGray
        } else {
            Write-Host ("  [{0}] run {1}/{2}: FAILED to become ready" -f $name, $i, $Runs) -ForegroundColor Red
        }
    }
}

Stop-Stray

Write-Host ''
Write-Host 'STARTUP RESULTS (wall clock to accepting connections)' -ForegroundColor Cyan
Write-Host ('-' * 62)
$base = $null
foreach ($name in $configs.Keys) {
    $r = @($results[$name] | Sort-Object)
    if ($r.Count -eq 0) { Write-Host ("{0,-16} no successful runs" -f $name) -ForegroundColor Red; continue }
    $best = $r[0]
    $median = $r[[math]::Floor(($r.Count - 1) / 2)]
    if ($null -eq $base) { $base = $median }
    $delta = if ($base -gt 0) { [math]::Round((($median - $base) / $base) * 100, 1) } else { 0 }
    $sign = if ($delta -gt 0) { "+$delta%" } else { "$delta%" }
    Write-Host ("{0,-16} best={1,6}s  median={2,6}s  {3,8}  runs={4}" -f $name, $best, $median, $sign, ($r -join ', '))
}
Write-Host ('-' * 62)
Write-Host 'First configuration listed is the baseline for the delta column.'
exit 0
