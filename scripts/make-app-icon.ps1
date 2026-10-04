Add-Type -AssemblyName System.Drawing

$bitmap = New-Object Drawing.Bitmap 1024, 1024
$graphics = [Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = 'AntiAlias'
$graphics.Clear([Drawing.ColorTranslator]::FromHtml('#31533E'))

$cream = [Drawing.ColorTranslator]::FromHtml('#F7F5F0')
$sage = [Drawing.ColorTranslator]::FromHtml('#BFE0C7')
$coral = [Drawing.ColorTranslator]::FromHtml('#B84332')

$outer = New-Object Drawing.Pen($cream, 88)
$outer.StartCap = 'Round'
$outer.EndCap = 'Round'
$graphics.DrawArc($outer, 190, 190, 644, 644, 34, 292)

$inner = New-Object Drawing.Pen($sage, 56)
$inner.StartCap = 'Round'
$inner.EndCap = 'Round'
$graphics.DrawArc($inner, 314, 314, 396, 396, 48, 286)

$graphics.FillEllipse((New-Object Drawing.SolidBrush($coral)), 724, 244, 96, 96)
$bitmap.Save((Join-Path $PSScriptRoot '..\assets\app-icon.png'), [Drawing.Imaging.ImageFormat]::Png)

$inner.Dispose()
$outer.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
