<# : 2>nul
@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$sb=[scriptblock]::Create((Get-Content '%~f0' -Encoding UTF8|Out-String)); & $sb @args" -- %*
exit /b
#>

$Paths = $args

if ($Paths.Count -eq 0) {
    Write-Host "使用法: AEPファイルをこのバッチファイルにドラッグ＆ドロップしてください。" -ForegroundColor Yellow
    exit
}

Write-Host "=============== AEP Version Checker ===============" -ForegroundColor Cyan
Write-Host "Checking files..."
Write-Host ""

foreach ($path in $Paths) {
    if (-not (Test-Path $path)) {
        Write-Host "[Error] File not found: $path" -ForegroundColor Red
        continue
    }

    $extension = [System.IO.Path]::GetExtension($path)
    if ($extension -ne ".aep") {
        Write-Host "[Skip] Not an AEP file: $path" -ForegroundColor DarkGray
        continue
    }

    try {
        $stream = [System.IO.File]::OpenRead($path)
        $bytes = New-Object byte[] 50
        $count = $stream.Read($bytes, 0, 50)
        $stream.Close()

        if ($count -lt 40) {
             Write-Host "[Error] File too small: $path" -ForegroundColor Red
             continue
        }

        $strVersion = ""
        
        if ($bytes[0x18] -ne 0x68) {
            # CS5以前
            $verMajor = (($bytes[0x18] -shl 1) -band 0xF8) + (($bytes[0x19] -shr 3) -band 0x07)
            $verMinor = (($bytes[0x19] -shl 1) -band 0x0E) + ($bytes[0x1A] -shr 7)
            $verPatch = ($bytes[0x1A] -shr 3) -band 0x0F
            $strVersion = "$verMajor.$verMinor.$verPatch"
        } else {
            # CS6以降
            $verMajor = (($bytes[0x24] -shl 1) -band 0xF8) + (($bytes[0x25] -shr 3) -band 0x07)
            $verMinor = (($bytes[0x25] -shl 1) -band 0x0E) + ($bytes[0x26] -shr 7)
            $verPatch = (($bytes[0x26] -shr 3) -band 0x0F)
            $verBuild = $bytes[0x27]
            $strVersion = "$verMajor.$verMinor.$verPatch.$verBuild"

            # Host Version
            $hostMajor = (($bytes[0x14] -shl 1) -band 0xF8) + (($bytes[0x15] -shr 3) -band 0x07)
            $hostMinor = (($bytes[0x15] -shl 1) -band 0x0E) + ($bytes[0x16] -shr 7)
            $hostPatch = (($bytes[0x16] -shr 3) -band 0x0F)
            $hostBuild = $bytes[0x17]
            $strHostVersion = "$hostMajor.$hostMinor.$hostPatch.$hostBuild"

            $addInfo = ""
            if (($bytes[0x25] -band 0x40) -eq 0) {
                $addInfo += " (Win)"
            } else {
                $addInfo += " (Mac)"
            }

            if ($strVersion -ne $strHostVersion) {
                $addInfo += " [HostVersion:$strHostVersion]"
            }
            $strVersion += $addInfo
        }
        
        Write-Host "[AEP] $([System.IO.Path]::GetFileName($path))" -ForegroundColor Green
        Write-Host "      Version: $strVersion" -ForegroundColor White
        Write-Host ""

    } catch {
        Write-Host "[Error] Failed to read file: $path" -ForegroundColor Red
        Write-Host "        $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "Done." -ForegroundColor Cyan
if ($Host.Name -eq "ConsoleHost") {
    Read-Host "Press Enter to exit"
}
