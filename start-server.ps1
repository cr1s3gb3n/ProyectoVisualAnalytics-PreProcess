# Dashboard Server Launcher
# Este script inicia un servidor local para el dashboard

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Dashboard de Calidad del Aire" -ForegroundColor Yellow
Write-Host " Iniciando servidor local..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$url = "http://localhost:8000"

# Verifica si Python está instalado
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python encontrado: $pythonVersion" -ForegroundColor Green
    Write-Host ""
    Write-Host "El dashboard se abrirá en: $url" -ForegroundColor Yellow
    Write-Host "Para detener el servidor, presiona Ctrl+C" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Espera 2 segundos antes de abrir el navegador
    Start-Sleep -Seconds 2
    
    # Abre el navegador
    Start-Process $url
    
    # Inicia el servidor
    python -m http.server 8000
}
catch {
    Write-Host "✗ Python no encontrado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor instala Python o usa una alternativa:" -ForegroundColor Yellow
    Write-Host "  1. Instala Python desde: https://python.org" -ForegroundColor White
    Write-Host "  2. Usa VS Code con la extensión 'Live Server'" -ForegroundColor White
    Write-Host "  3. Usa Node.js: npx http-server -p 8000" -ForegroundColor White
    Write-Host ""
    
    # Pregunta si quiere abrir el archivo directamente
    $response = Read-Host "¿Deseas abrir index.html directamente? (Puede tener limitaciones) [s/n]"
    if ($response -eq 's' -or $response -eq 'S') {
        Start-Process "index.html"
    }
}

Write-Host ""
Write-Host "Presiona cualquier tecla para salir..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
