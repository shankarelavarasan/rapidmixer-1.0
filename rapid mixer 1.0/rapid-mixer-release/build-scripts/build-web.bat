@echo off
echo Building Rapid Mixer Web App...

cd /d "%~dp0..\frontend"

echo Cleaning previous builds...
flutter clean

echo Getting dependencies...
flutter pub get

echo Building web release...
flutter build web --release --web-renderer html

echo Build complete!
echo Web app location: build\web\
echo.
echo You can now deploy the contents of build\web\ to any web server

pause