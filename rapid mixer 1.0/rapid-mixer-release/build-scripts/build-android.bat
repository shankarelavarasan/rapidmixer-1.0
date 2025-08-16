@echo off
echo Building Rapid Mixer Android APK...

cd /d "%~dp0..\frontend"

echo Cleaning previous builds...
flutter clean

echo Getting dependencies...
flutter pub get

echo Building release APK...
flutter build apk --release --split-per-abi

echo Build complete!
echo APK location: build\app\outputs\flutter-apk\
echo.
echo Files created:
dir build\app\outputs\flutter-apk\*.apk

pause