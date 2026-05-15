$fixed = 0
Get-ChildItem C:\base44site\content\articles -Filter "*.json" | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8)
    $newContent = $content
    $newContent = $newContent.Replace([char]0x00e2 + [char]0x0086 + [char]0x0092, [char]0x2192)  # â†' -> →
    $newContent = $newContent.Replace([char]0x00e2 + [char]0x0080 + [char]0x0094, [char]0x2014)  # â€" -> —
    $newContent = $newContent.Replace([char]0x00e2 + [char]0x0080 + [char]0x0099, [char]0x2019)  # â€™ -> '
    $newContent = $newContent.Replace([char]0x00e2 + [char]0x0080 + [char]0x009c, [char]0x201c)  # â€œ -> "
    $newContent = $newContent.Replace([char]0x00e2 + [char]0x0080 + [char]0x009d, [char]0x201d)  # â€ -> "
    if ($newContent -ne $content) {
        [System.IO.File]::WriteAllText($_.FullName, $newContent, (New-Object System.Text.UTF8Encoding $false))
        $fixed++
    }
}
Write-Host "Fixed $fixed files"
