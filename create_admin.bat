@echo off
echo Creating admin user...
curl -X POST http://localhost:8080/register -H "Content-Type: application/json" -d "{\"username\":\"admin\", \"password\":\"admin123\"}"
echo.
echo.
echo Admin user created! Username: admin, Password: admin123
echo Note: You need to manually update the role to 'admin' in the database
echo.
pause
