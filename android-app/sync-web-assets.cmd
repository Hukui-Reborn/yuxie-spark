@echo off
cd /d "%~dp0"

copy /Y "..\index.html" "app\src\main\assets\index.html" >nul
copy /Y "..\styles.css" "app\src\main\assets\styles.css" >nul
copy /Y "..\app.js" "app\src\main\assets\app.js" >nul
copy /Y "..\saved-prompts.json" "app\src\main\assets\saved-prompts.json" >nul

echo Android assets updated.
