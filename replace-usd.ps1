$extensions = @("*.tsx", "*.ts")
$dir = "E:\Port\Property Management System\one-platform-many-smiles\src"

Get-ChildItem -Path $dir -Include $extensions -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $changed = $false

    if ($content -match "USD\s") {
        $content = $content.Replace("USD ", "$")
        $changed = $true
    }
    if ($content -match "\(USD\)") {
        $content = $content.Replace("(USD)", "($)")
        $changed = $true
    }

    if ($changed) {
        Set-Content -Path $_.FullName -Value $content -NoNewline
        Write-Host "Updated $($_.FullName)"
    }
}
