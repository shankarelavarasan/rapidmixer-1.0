@echo off
echo Setting up Rapid Mixer Frontend...

cd /d "%~dp0..\frontend"

echo Getting Flutter dependencies...
flutter pub get

echo Running Flutter doctor...
flutter doctor

echo Setup complete!
echo.
echo To run the app:
echo   flutter run -d chrome     (web)
echo   flutter run -d android    (android)
echo   flutter run -d ios        (ios)

pause