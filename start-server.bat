@echo off
echo ========================================
echo  Dashboard de Calidad del Aire
echo  Iniciando servidor local...
echo ========================================
echo.
echo El dashboard se abrirá en tu navegador en:
echo http://localhost:8000
echo.
echo Para detener el servidor, presiona Ctrl+C
echo.
echo ========================================
echo.

REM Intenta con Python 3
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Iniciando con Python...
    start http://localhost:8000
    python -m http.server 8000
    goto :end
)

REM Si Python no está disponible, muestra instrucciones
echo Python no encontrado. Por favor instala Python o usa otro método.
echo.
echo Alternativas:
echo 1. Instala Python desde python.org
echo 2. Usa VS Code con la extension Live Server
echo 3. Usa Node.js: npx http-server -p 8000
echo.
pause

:end
