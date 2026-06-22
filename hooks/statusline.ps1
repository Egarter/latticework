$ClaudeDir = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $HOME ".claude" }
$Flag = Join-Path $ClaudeDir ".latticework-active"
if (-not (Test-Path $Flag)) { exit 0 }
$Mode = ""
try {
    $Mode = (Get-Content $Flag -ErrorAction Stop | Select-Object -First 1).Trim()
} catch { exit 0 }
if ([string]::IsNullOrEmpty($Mode) -or $Mode -eq "full") {
    Write-Host "[LATTICE]" -NoNewline
} else {
    Write-Host "[LATTICE:$($Mode.ToUpperInvariant())]" -NoNewline
}
