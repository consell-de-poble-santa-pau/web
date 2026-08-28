# Instal·la l'agenda al web del Consell de Poble de Santa Pau.
#
# Ús: obre PowerShell a l'arrel del repositori i executa
#     powershell -ExecutionPolicy Bypass -File .\agenda\instal-la-agenda.ps1
#
# Escriu els fitxers nous i retoca tres que ja hi són: content.config.ts,
# Base.astro i public\admin\config.yml. No en substitueix cap sencer: hi
# insereix el que falta. Es pot tornar a executar sense duplicar res.

param(
  [string]$Repositori = (Get-Location).Path
)

$ErrorActionPreference = 'Stop'
$origen = $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding($false)

function Escriu($ruta, $text) {
  $carpeta = Split-Path $ruta -Parent
  if (-not (Test-Path $carpeta)) { New-Item -ItemType Directory -Force -Path $carpeta | Out-Null }
  [System.IO.File]::WriteAllText($ruta, $text, $utf8)
}
function Llegeix($ruta) { [System.IO.File]::ReadAllText($ruta) }
function Desa($ruta) {
  # Una sola copia de seguretat: mai no en sobreescriu una d'existent.
  if ((Test-Path $ruta) -and -not (Test-Path "$ruta.bak")) { Copy-Item $ruta "$ruta.bak" }
}

$base = Join-Path $Repositori 'src\layouts\Base.astro'
$cms  = Join-Path $Repositori 'public\admin\config.yml'
$cfg  = Join-Path $Repositori 'src\content.config.ts'

if (-not (Test-Path $base)) {
  Write-Host "No trobo src\layouts\Base.astro. Executa l'script des de l'arrel del repositori." -ForegroundColor Red
  exit 1
}

# --- 1. Fitxers nous ----------------------------------------------------
$fitxers = @(
  'src\components\EsdevenimentAgenda.astro',
  'src\pages\agenda\index.astro',
  'src\pages\agenda.ics.ts',
  'src\content\agenda\2026-07-21-coordinacio.md',
  'src\content\agenda\2026-09-15-cercle-aigua.md',
  'src\content\agenda\2026-10-03-passejada-fonts.md'
)
foreach ($f in $fitxers) {
  Escriu (Join-Path $Repositori $f) (Llegeix (Join-Path $origen $f))
  Write-Host "  escrit   $f"
}

# --- 2. content.config.ts -----------------------------------------------
if (-not (Test-Path $cfg)) {
  Write-Host "  esquema  no trobo src\content.config.ts" -ForegroundColor Yellow
} else {
  $text = Llegeix $cfg

  # Si hi ha quedat la versio sencera d'una execucio anterior, recupera la teva.
  if ($text -match 'const CERCLES =' -and (Test-Path "$cfg.bak")) {
    $text = Llegeix "$cfg.bak"
    Escriu $cfg $text
    Write-Host "  esquema  recuperada la teva versio des de content.config.ts.bak" -ForegroundColor Cyan
  }

  if ($text -match '(?m)^const agenda = defineCollection') {
    Write-Host "  esquema  la col·leccio agenda ja hi era" -ForegroundColor DarkGray
  } else {
    Desa $cfg
    $ok = $true

    # a) importar reference
    $mi = [regex]::Match($text, "import\s*\{([^}]*)\}\s*from\s*'astro:content';")
    if (-not $mi.Success) { $ok = $false }
    elseif ($mi.Groups[1].Value -notmatch '\breference\b') {
      $dins = $mi.Groups[1].Value.TrimEnd().TrimEnd(',')
      $text = $text.Substring(0, $mi.Groups[1].Index) + $dins + ', reference ' +
              $text.Substring($mi.Groups[1].Index + $mi.Groups[1].Length)
    }

    # b) el bloc, just abans de l'exportacio
    $i = $text.IndexOf('export const collections')
    if ($i -lt 0) { $ok = $false }
    else { $text = $text.Substring(0, $i) + (Llegeix (Join-Path $origen 'agenda-collection.ts.txt')) + $text.Substring($i) }

    # c) afegir-la a l'exportacio
    $me = [regex]::Match($text, "export\s+const\s+collections\s*=\s*\{([^}]*)\}")
    if (-not $me.Success) { $ok = $false }
    elseif ($me.Groups[1].Value -notmatch '\bagenda\b') {
      $dins = $me.Groups[1].Value.TrimEnd().TrimEnd(',')
      $text = $text.Substring(0, $me.Groups[1].Index) + $dins + ', agenda ' +
              $text.Substring($me.Groups[1].Index + $me.Groups[1].Length)
    }

    if ($ok) {
      Escriu $cfg $text
      Write-Host "  esquema  col·leccio agenda inserida a content.config.ts"
    } else {
      Write-Host "  esquema  NO he sabut on inserir-la a content.config.ts." -ForegroundColor Yellow
      Write-Host "           Enganxa-hi agenda\agenda-collection.ts.txt abans de l'export," -ForegroundColor Yellow
      Write-Host "           importa 'reference' i afegeix agenda a collections." -ForegroundColor Yellow
    }
  }
}

# --- 3. Enllac al menu --------------------------------------------------
$textBase = Llegeix $base
if ($textBase -match "href:\s*'/agenda/'") {
  Write-Host "  menu     ja hi era" -ForegroundColor DarkGray
} elseif ($textBase -match "(?m)^(\s*)\{\s*href:\s*'/reunions/'") {
  $nova = $Matches[1] + "{ href: '/agenda/', text: 'Agenda' },`r`n"
  Desa $base
  $mb = [regex]::Match($textBase, "(?m)^\s*\{\s*href:\s*'/reunions/'")
  Escriu $base ($textBase.Substring(0, $mb.Index) + $nova + $textBase.Substring($mb.Index))
  Write-Host "  menu     Agenda afegida abans de Reunions"
} else {
  Write-Host "  menu     NO hi trobo la linia de /reunions/ a Base.astro." -ForegroundColor Yellow
  Write-Host "           Afegeix-hi a ma:  { href: '/agenda/', text: 'Agenda' }," -ForegroundColor Yellow
}

# --- 4. Col·leccio al CMS -----------------------------------------------
if (-not (Test-Path $cms)) {
  Write-Host "  CMS      no hi ha public\admin\config.yml; no hi toco res." -ForegroundColor DarkGray
} elseif ((Llegeix $cms) -match "(?m)^\s*-\s*name:\s*agenda\s*$") {
  Write-Host "  CMS      la col·leccio ja hi era" -ForegroundColor DarkGray
} else {
  $textCms = Llegeix $cms
  $mc = [regex]::Match($textCms, "(?m)^\s*-\s*name:\s*noticies\s*$")
  if ($mc.Success) {
    Desa $cms
    $bloc = Llegeix (Join-Path $origen 'admin-agenda.yml')
    Escriu $cms ($textCms.Substring(0, $mc.Index) + $bloc + $textCms.Substring($mc.Index))
    Write-Host "  CMS      col·leccio Agenda afegida abans de Noticies"
  } else {
    Write-Host "  CMS      NO hi trobo la col·leccio noticies a config.yml." -ForegroundColor Yellow
    Write-Host "           Enganxa-hi el contingut d'agenda\admin-agenda.yml dins de collections:" -ForegroundColor Yellow
  }
}

Write-Host ""
Write-Host "Fet. Ara:  npm run dev   i obre http://localhost:4321/agenda/" -ForegroundColor Green
