Add-Type -AssemblyName System.Drawing

$assets = Join-Path $PSScriptRoot '..\assets'
$forest = [Drawing.ColorTranslator]::FromHtml('#31533E')
$cream = [Drawing.ColorTranslator]::FromHtml('#F7F5F0')
$sage = [Drawing.ColorTranslator]::FromHtml('#BFE0C7')
$coral = [Drawing.ColorTranslator]::FromHtml('#B84332')

function New-Canvas([bool]$transparent) {
  $bitmap = New-Object Drawing.Bitmap 1024, 1024
  $graphics = [Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = 'AntiAlias'
  if ($transparent) { $graphics.Clear([Drawing.Color]::Transparent) }
  return @($bitmap, $graphics)
}

function Draw-Mark($graphics, [int]$offset, [int]$size, $outerColor, $innerColor) {
  $outer = New-Object Drawing.Pen($outerColor, ($size * 0.09))
  $outer.StartCap = 'Round'; $outer.EndCap = 'Round'
  $inner = New-Object Drawing.Pen($innerColor, ($size * 0.055))
  $inner.StartCap = 'Round'; $inner.EndCap = 'Round'
  $graphics.DrawArc($outer, $offset + ($size * 0.18), $offset + ($size * 0.18), ($size * 0.64), ($size * 0.64), 34, 292)
  $graphics.DrawArc($inner, $offset + ($size * 0.31), $offset + ($size * 0.31), ($size * 0.39), ($size * 0.39), 48, 286)
  $graphics.FillEllipse((New-Object Drawing.SolidBrush($coral)), $offset + ($size * 0.72), $offset + ($size * 0.24), ($size * 0.095), ($size * 0.095))
  $inner.Dispose(); $outer.Dispose()
}

function Save-Png($bitmap, $graphics, [string]$name) {
  $bitmap.Save((Join-Path $assets $name), [Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose(); $bitmap.Dispose()
}

# Launcher icon: opaque tile.
$bitmap, $graphics = New-Canvas $false
$graphics.Clear($forest)
Draw-Mark $graphics 0 1024 $cream $sage
Save-Png $bitmap $graphics 'app-icon.png'

# Adaptive foreground: transparent, with Android safe-area padding.
$bitmap, $graphics = New-Canvas $true
Draw-Mark $graphics 160 704 $cream $sage
Save-Png $bitmap $graphics 'android-icon-foreground.png'

# Splash marks: transparent and intentionally smaller than launcher icon.
$bitmap, $graphics = New-Canvas $true
Draw-Mark $graphics 242 540 $forest $sage
Save-Png $bitmap $graphics 'splash-icon.png'

$bitmap, $graphics = New-Canvas $true
Draw-Mark $graphics 242 540 $cream $sage
Save-Png $bitmap $graphics 'splash-icon-dark.png'
