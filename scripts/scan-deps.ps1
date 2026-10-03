<#
.SYNOPSIS
    Fast dependency vulnerability scan for the Maven backend.

.DESCRIPTION
    Queries the OSV.dev batch API with the exact coordinates resolved by Maven.

    This replaces maven-dependency-plugin's OWASP dependency-check, which needs a
    ~600 MB NVD database download. On a slow link that download exceeded 50 minutes
    and the plugin blocked on a stale odc.update.lock rather than failing. This script
    needs no local database and completes in a few seconds.

    Exit codes: 0 = no advisories at or above the threshold, 1 = advisories found,
    2 = the scan itself could not run.

.EXAMPLE
    .\scripts\scan-deps.ps1
    .\scripts\scan-deps.ps1 -FailOn any
    .\scripts\scan-deps.ps1 -BackendPath .\backend
#>
[CmdletBinding()]
param(
    [string] $BackendPath = (Join-Path $PSScriptRoot '..\backend'),
    [ValidateSet('low', 'moderate', 'high', 'critical', 'any')]
    [string] $FailOn = 'high',
    [int] $BatchSize = 500
)

$ErrorActionPreference = 'Stop'

$severityRank = @{ low = 1; moderate = 2; high = 3; critical = 4 }
$failRank = if ($FailOn -eq 'any') { 1 } else { $severityRank[$FailOn] }

$mvn = Get-Command mvn -ErrorAction SilentlyContinue
if (-not $mvn) {
    $candidate = 'C:\tools\maven\apache-maven-3.9.7\bin\mvn.cmd'
    if (Test-Path -LiteralPath $candidate) { $mvn = $candidate } else { $mvn = $null }
}
if (-not $mvn) { Write-Error 'mvn not found on PATH'; exit 2 }

Write-Host 'Resolving dependency coordinates...' -ForegroundColor Cyan
$listFile = Join-Path ([System.IO.Path]::GetTempPath()) ("lexilens-deps-" + [guid]::NewGuid() + '.txt')
try {
    Push-Location $BackendPath
    & $mvn -B -q dependency:list "-DoutputFile=$listFile" "-DincludeScope=runtime" 2>$null | Out-Null
    Pop-Location
} finally {
    if ((Get-Location).Path -eq $BackendPath) { Pop-Location }
}

if (-not (Test-Path -LiteralPath $listFile)) { Write-Error 'mvn dependency:list produced no output'; exit 2 }

$deps = @()
Get-Content -LiteralPath $listFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -match '^([A-Za-z0-9._\-\+]+):([A-Za-z0-9._\-\+]+):[a-z]+:([^:\s]+):') {
        $deps += [pscustomobject]@{ Name = "$($Matches[1]):$($Matches[2])"; Version = $Matches[3] }
    }
}
$deps = $deps | Sort-Object Name -Unique
Write-Host ("  {0} unique runtime dependencies" -f $deps.Count) -ForegroundColor DarkGray
if ($deps.Count -eq 0) { Write-Error 'no dependencies parsed'; exit 2 }

$findings = @()
$idx = 0
$all = @($deps)
while ($idx -lt $all.Count) {
    $end = [Math]::Min($idx + $BatchSize, $all.Count)
    $slice = $all[$idx..($end - 1)]
    $queries = @($slice | ForEach-Object {
        @{ package = @{ ecosystem = 'Maven'; name = $_.Name }; version = $_.Version }
    })
    $body = @{ queries = $queries } | ConvertTo-Json -Depth 5 -Compress

    $response = Invoke-RestMethod -Uri 'https://api.osv.dev/v1/querybatch' `
        -Method Post -Body $body -ContentType 'application/json' -TimeoutSec 90

    for ($i = 0; $i -lt $slice.Count; $i++) {
        $vulns = $response.results[$i].vulns
        if ($null -eq $vulns -or $vulns.Count -eq 0) { continue }
        foreach ($v in $vulns) {
            $findings += [pscustomobject]@{
                Package = $slice[$i].Name
                Version = $slice[$i].Version
                Id      = $v.id
            }
        }
    }
    $idx = $end
}

Write-Host ''
if ($findings.Count -eq 0) {
    Write-Host 'No known vulnerabilities in backend dependencies.' -ForegroundColor Green
    exit 0
}

# Resolve severity per advisory. querybatch omits it, so fetch details individually.
Write-Host ("Resolving severity for {0} advisories..." -f $findings.Count) -ForegroundColor Cyan
$cache = @{}
foreach ($f in $findings) {
    if ($cache.ContainsKey($f.Id)) { $f | Add-Member -NotePropertyName Severity -NotePropertyValue $cache[$f.Id] -Force; continue }
    $sev = 'unknown'
    $fixed = $null
    try {
        $det = Invoke-RestMethod -Uri "https://api.osv.dev/v1/vulns/$($f.Id)" -TimeoutSec 60
        if ($det.database_specific.severity) { $sev = $det.database_specific.severity }
        foreach ($a in $det.affected) {
            if ($a.package.name -ne $f.Package) { continue }
            foreach ($rg in $a.ranges) {
                foreach ($ev in $rg.events) {
                    if ($ev.PSObject.Properties.Name -contains 'fixed') { $fixed = $ev.fixed }
                }
            }
        }
    } catch { }
    $cache[$f.Id] = $sev
    $f | Add-Member -NotePropertyName Severity -NotePropertyValue $sev -Force
    $f | Add-Member -NotePropertyName FixedIn -NotePropertyValue $fixed -Force
}

$order = @{ 'critical' = 0; 'high' = 1; 'moderate' = 2; 'low' = 3; 'unknown' = 4 }
$ranked = @($findings | Sort-Object -Property @{ Expression = { $order[$_.Severity] } }, Package, Id)

Write-Host ''
Write-Host 'VULNERABLE DEPENDENCIES' -ForegroundColor Yellow
Write-Host ('-' * 78)
foreach ($group in ($ranked | Group-Object Package)) {
    $g = $group.Group | Sort-Object -Property @{ Expression = { $order[$_.Severity] } }
    $worst = $g[0].Severity
    $color = switch ($worst) {
        'critical' { 'Red' }
        'high'     { 'Red' }
        'moderate' { 'Yellow' }
        default    { 'Gray' }
    }
    Write-Host ("{0}:{1}  ({2} advisories, worst={3})" -f $group.Name, $g[0].Version, $g.Count, $worst) -ForegroundColor $color
    foreach ($x in $g) {
        $fix = if ($x.FixedIn) { "  fixed in $($x.FixedIn)" } else { '  no fixed version published' }
        Write-Host ("    [{0}] {1}{2}" -f $x.Severity, $x.Id, $fix) -ForegroundColor DarkGray
    }
}

$breaches = @($ranked | Where-Object {
    $r = $order[$_.Severity]
    if ($r -lt $failRank) { return $false }
    if ($_.Severity -eq 'unknown') { return $true }
    $true
})

Write-Host ('-' * 78)
Write-Host ("Total: {0} advisories across {1} packages" -f $ranked.Count, @($ranked | Group-Object Package).Count)
if ($breaches.Count -gt 0) {
    Write-Host ("FAIL: {0} advisories at or above '{1}'" -f $breaches.Count, $FailOn) -ForegroundColor Red
    exit 1
}
Write-Host ("PASS: no advisories at or above '{0}'" -f $FailOn) -ForegroundColor Green
exit 0
