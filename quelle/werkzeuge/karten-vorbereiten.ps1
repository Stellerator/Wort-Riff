# Bereitet die Kartenpakete für das Repo vor: PNG-Pakete werden in WebP umgewandelt (etwa 1/10 der Größe), WebP-Pakete werden unverändert übernommen.
# Quelle: ..\..\ausgabe\*.zip (die Ergebnisse des Kartenbaus, bleiben unverändert), Ziel: ..\repo-karten\
# Aufruf (PowerShell):  .\werkzeuge\karten-vorbereiten.ps1 Englisch_Unit01 Franzoesisch_Lektion01 ...
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Namen)
$ErrorActionPreference = 'Stop'
$app = Split-Path -Parent $PSScriptRoot
$vk = Split-Path -Parent $app
$ausgabe = Join-Path $vk 'ausgabe'
$ziel = Join-Path $app 'repo-karten'
$arbeit = Join-Path $ziel '_arbeit'
New-Item -ItemType Directory -Force $ziel | Out-Null
Add-Type -AssemblyName System.IO.Compression.FileSystem
foreach ($n in $Namen) {
  $quelle = Join-Path $ausgabe "$n.zip"
  if (-not (Test-Path $quelle)) { Write-Output "FEHLT: $quelle"; continue }
  $z = [System.IO.Compression.ZipFile]::OpenRead($quelle)
  $nPng = ($z.Entries | Where-Object { $_.FullName -match '\.png$' }).Count
  $z.Dispose()
  if ($nPng -eq 0) { Copy-Item $quelle (Join-Path $ziel "$n.zip") -Force; Write-Output "$n : schon WebP, kopiert"; continue }
  $tmp = Join-Path $arbeit $n
  if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
  New-Item -ItemType Directory -Force $tmp | Out-Null
  [System.IO.Compression.ZipFile]::ExtractToDirectory($quelle, $tmp)
  # den Ordner finden, der lektion.json enthält (alte Pakete haben einen doppelten Lektionsordner)
  $json = Get-ChildItem $tmp -Recurse -Filter 'lektion.json' | Select-Object -First 1
  $wurzel = $json.Directory.FullName
  python -I (Join-Path $vk 'webp.py') $wurzel
  $out = Join-Path $ziel "$n.zip"
  if (Test-Path $out) { Remove-Item $out -Force }
  python -I (Join-Path $vk 'zip.py') $wurzel $out
  Remove-Item $tmp -Recurse -Force
}
if (Test-Path $arbeit) { Remove-Item $arbeit -Recurse -Force -ErrorAction SilentlyContinue }
Get-ChildItem $ziel -Filter *.zip | Select-Object Name, @{n='MB';e={[math]::Round($_.Length/1MB,2)}} | Format-Table -AutoSize | Out-String
