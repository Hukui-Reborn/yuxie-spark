@echo off
cd /d "%~dp0"
call sync-web-assets.cmd

if exist "gradlew.bat" (
  call gradlew.bat assembleDebug
) else (
  gradle assembleDebug
)

if exist "app\build\outputs\apk\debug\app-debug.apk" (
  echo APK created: app\build\outputs\apk\debug\app-debug.apk
) else (
  echo APK was not created. Open this folder in Android Studio and choose Build APK.
)

pause
