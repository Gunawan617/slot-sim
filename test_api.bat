@echo off
setlocal

set BASE_URL=http://localhost:8080
set USERNAME=testUser%RANDOM%
set PASSWORD=secretPassword

echo ==========================================
echo Testing Slot Sim API
echo ==========================================
echo.

echo [1/5] Registering new user: %USERNAME%
curl -s -X POST %BASE_URL%/register -H "Content-Type: application/json" -d "{\"username\": \"%USERNAME%\", \"password\": \"%PASSWORD%\"}"
echo.
echo.

echo [2/5] Logging in...
for /f "tokens=*" %%i in ('curl -s -X POST %BASE_URL%/login -H "Content-Type: application/json" -d "{\"username\": \"%USERNAME%\", \"password\": \"%PASSWORD%\"}"') do set RESPONSE=%%i

echo Response: %RESPONSE%

:: Simple hack to extract token (requires a proper json parser ideally, but this works for simple testing)
:: Assuming response is {"token":"..."}
set "TOKEN=%RESPONSE:*token":"=%"
set "TOKEN=%TOKEN:"=%"
set "TOKEN=%TOKEN:}=%"

echo.
echo Extracted Token: %TOKEN%
echo.

if "%TOKEN%"=="" (
    echo Failed to get token. Exiting.
    exit /b 1
)

echo [3/5] Getting Profile...
curl -s -X GET %BASE_URL%/user/me -H "Authorization: Bearer %TOKEN%"
echo.
echo.

echo [4/5] Playing Slot...
curl -s -X POST %BASE_URL%/user/play-slot -H "Authorization: Bearer %TOKEN%"
echo.
echo.

echo [5/5] Getting History...
curl -s -X GET %BASE_URL%/user/history -H "Authorization: Bearer %TOKEN%"
echo.
echo.

echo ==========================================
echo Tests Completed
echo ==========================================
endlocal
pause
