$extensions = @("*.tsx", "*.ts")
$dir = "E:\Port\Property Management System\one-platform-many-smiles\src"

Get-ChildItem -Path $dir -Include $extensions -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $changed = $false

    if ($content -match "\bSAR\b") {
        $content = $content -replace "\bSAR\b", "USD"
        $changed = $true
    }
    if ($content -match "Kinan") {
        # Logo string might be different, but let's replace "Kinan Portal" and "Kinan Staff" and "About Kinan"
        $content = $content -replace "Kinan", "ZYNO Property Management"
        $changed = $true
    }

    if ($changed) {
        Set-Content -Path $_.FullName -Value $content -NoNewline
        Write-Host "Updated $($_.FullName)"
    }
}
