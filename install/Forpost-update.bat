@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === Forpost: update modpack ===
if not exist packwiz-installer-bootstrap.jar (
  echo Downloading installer...
  curl -L -o packwiz-installer-bootstrap.jar https://github.com/packwiz/packwiz-installer-bootstrap/releases/latest/download/packwiz-installer-bootstrap.jar
)
java -jar packwiz-installer-bootstrap.jar https://raw.githubusercontent.com/Badyaa/forpost-pack/main/pack.toml
if errorlevel 1 (echo. & echo ERROR: see message above. Is Java 17 installed? & pause & exit /b 1)
echo.
echo Done. You can start the game.
pause
