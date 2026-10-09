@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
title Forpost - installer
set "PACK=https://raw.githubusercontent.com/Badyaa/forpost-pack/main/pack.toml"
set "BOOT=https://github.com/packwiz/packwiz-installer-bootstrap/releases/latest/download/packwiz-installer-bootstrap.jar"
set "JREURL=https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jre/hotspot/normal/eclipse"
set "HOMEDIR=%LOCALAPPDATA%\Forpost"
if not exist "%HOMEDIR%" mkdir "%HOMEDIR%"

echo ==============================================
echo   Forpost 1.0 - установка / обновление сборки
echo ==============================================
echo.
echo Сейчас откроется окно выбора папки игры.
echo Для TLauncher это обычно  %APPDATA%\.minecraft
echo (Forge 1.20.1 должен быть уже запущен один раз до главного меню.)
echo.

rem --- предыдущая папка как подсказка
set "DEFDIR=%APPDATA%\.minecraft"
if exist "%HOMEDIR%\lastdir.txt" set /p DEFDIR=<"%HOMEDIR%\lastdir.txt"

set "GAMEDIR="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -STA -Command "Add-Type -AssemblyName System.Windows.Forms; $d=New-Object System.Windows.Forms.FolderBrowserDialog; $d.Description='Select Minecraft game folder (Forpost will be installed here)'; $d.SelectedPath='%DEFDIR%'; $d.ShowNewFolderButton=$true; if($d.ShowDialog() -eq 'OK'){$d.SelectedPath}"`) do set "GAMEDIR=%%I"
if "%GAMEDIR%"=="" (
  echo Папка не выбрана. Выход.
  pause
  exit /b 1
)
if not exist "%GAMEDIR%" mkdir "%GAMEDIR%"
> "%HOMEDIR%\lastdir.txt" echo %GAMEDIR%
echo Папка игры: %GAMEDIR%
echo.

rem --- предупреждение, если Forge ещё не ставился
if exist "%GAMEDIR%\versions" (
  dir /b /ad "%GAMEDIR%\versions" | findstr /i forge >nul || echo ВНИМАНИЕ: в этой папке не видно Forge. Сначала запусти Forge 1.20.1 в TLauncher один раз.
) else (
  echo ВНИМАНИЕ: в этой папке нет versions. Сначала запусти Forge 1.20.1 в TLauncher один раз.
)
if exist "%GAMEDIR%\mods\*.jar" echo ВНИМАНИЕ: в папке mods уже есть файлы. Установщик чужие моды не удаляет - лишнее убери вручную.
echo.

rem --- Java 17+: системная или своя портативная
set "JAVA="
where java >nul 2>nul && for /f "usebackq delims=" %%V in (`powershell -NoProfile -Command "$m=(& java -version 2>&1 | Select-String 'version \"(\d+)' ).Matches.Groups[1].Value; $m"`) do set "JV=%%V"
if defined JV if %JV% GEQ 17 set "JAVA=java"
if not defined JAVA (
  for /f "delims=" %%J in ('dir /b /s "%HOMEDIR%\jre\java.exe" 2^>nul') do set "JAVA=%%J"
)
if not defined JAVA (
  echo Java 17 не найдена. Скачиваю портативную Java 17 ^(~50 МБ^)...
  powershell -NoProfile -Command "Invoke-WebRequest -UseBasicParsing '%JREURL%' -OutFile '%HOMEDIR%\jre.zip'; Expand-Archive -Force '%HOMEDIR%\jre.zip' '%HOMEDIR%\jre'; Remove-Item '%HOMEDIR%\jre.zip'"
  for /f "delims=" %%J in ('dir /b /s "%HOMEDIR%\jre\java.exe" 2^>nul') do set "JAVA=%%J"
)
if not defined JAVA (
  echo ОШИБКА: не удалось получить Java 17. Поставь вручную: https://adoptium.net/temurin/releases/?version=17
  pause
  exit /b 1
)
echo Java: %JAVA%

rem --- установщик packwiz
cd /d "%GAMEDIR%"
if not exist packwiz-installer-bootstrap.jar (
  echo Скачиваю установщик...
  powershell -NoProfile -Command "Invoke-WebRequest -UseBasicParsing '%BOOT%' -OutFile 'packwiz-installer-bootstrap.jar'"
)
if not exist packwiz-installer-bootstrap.jar (
  echo ОШИБКА: установщик не скачался. Проверь интернет.
  pause
  exit /b 1
)

echo.
echo Устанавливаю сборку. Первый раз ~25-30 минут ^(~650 МБ^), дальше - только обновления.
echo Не закрывай окно, пока не появится надпись о завершении.
echo.
"%JAVA%" -jar packwiz-installer-bootstrap.jar %PACK%
if errorlevel 1 (
  echo.
  echo ОШИБКА установки. Скопируй текст выше и пришли администратору.
  pause
  exit /b 1
)
echo.
echo ГОТОВО. Запускай Forge 1.20.1 из TLauncher (память: 8 ГБ).
echo Сервер "Forpost" появится в списке "Сетевая игра".
pause
