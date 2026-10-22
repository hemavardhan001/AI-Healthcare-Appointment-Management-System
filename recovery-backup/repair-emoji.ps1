$files = @(
  "frontend\src\components\Dashboard\BookAppointment.jsx",
  "frontend\src\components\Dashboard\Profile.jsx"
)

foreach ($file in $files) {
  $content = Get-Content $file -Raw
  $content = $content.Replace("ðŸ“…", "📅")
  $content = $content.Replace("ðŸ‘¤", "👤")
  $content = $content.Replace("â†", "←")
  Set-Content $file $content -Encoding utf8
}

Write-Host "Targeted emoji text repair applied." -ForegroundColor Green
