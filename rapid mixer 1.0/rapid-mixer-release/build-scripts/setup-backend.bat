@echo off
echo Setting up Rapid Mixer Backend...

cd /d "%~dp0..\backend"

echo Installing Node.js dependencies...
npm install

echo Installing Python dependencies...
pip install -r requirements.txt

echo Creating necessary directories...
if not exist "uploads" mkdir uploads
if not exist "uploads\stems" mkdir uploads\stems
if not exist "uploads\processed" mkdir uploads\processed
if not exist "uploads\exports" mkdir uploads\exports

echo Copying environment file...
if not exist ".env" (
    copy ".env.example" ".env"
    echo Please edit .env file with your configuration
)

echo Setup complete!
echo.
echo To start the backend server:
echo   npm run dev    (development)
echo   npm start      (production)

pause