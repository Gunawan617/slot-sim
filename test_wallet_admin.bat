@echo off
echo ========================================
echo Testing Wallet and Admin Features
echo ========================================
echo.

echo [1] Creating test user...
curl -X POST http://localhost:8080/register -H "Content-Type: application/json" -d "{\"username\":\"testuser\", \"password\":\"pass123\"}"
echo.
echo.

echo [2] Creating admin user...
curl -X POST http://localhost:8080/register -H "Content-Type: application/json" -d "{\"username\":\"admin\", \"password\":\"admin123\"}"
echo.
echo.
echo NOTE: Please update admin role in database manually:
echo UPDATE users SET role = 'admin' WHERE username = 'admin';
echo.
pause

echo [3] Login as test user...
curl -X POST http://localhost:8080/login -H "Content-Type: application/json" -d "{\"username\":\"testuser\", \"password\":\"pass123\"}" > temp_user_token.txt
type temp_user_token.txt
echo.
echo.
echo Copy the token above and paste it when prompted
echo.
set /p USER_TOKEN="Enter USER TOKEN: "
echo.

echo [4] Get user profile...
curl -X GET http://localhost:8080/user/me -H "Authorization: Bearer %USER_TOKEN%"
echo.
echo.

echo [5] Request Top Up (100000)...
curl -X POST http://localhost:8080/api/wallet/topup -H "Authorization: Bearer %USER_TOKEN%" -H "Content-Type: application/json" -d "{\"amount\":100000, \"bank_name\":\"BCA\", \"bank_account\":\"1234567890\", \"account_name\":\"Test User\"}"
echo.
echo.

echo [6] Request Withdraw (50000)...
curl -X POST http://localhost:8080/api/wallet/withdraw -H "Authorization: Bearer %USER_TOKEN%" -H "Content-Type: application/json" -d "{\"amount\":50000, \"bank_name\":\"BCA\", \"bank_account\":\"9876543210\", \"account_name\":\"Test User\"}"
echo.
echo.

echo [7] Get wallet history...
curl -X GET http://localhost:8080/api/wallet/history -H "Authorization: Bearer %USER_TOKEN%"
echo.
echo.

echo [8] Login as admin...
curl -X POST http://localhost:8080/login -H "Content-Type: application/json" -d "{\"username\":\"admin\", \"password\":\"admin123\"}" > temp_admin_token.txt
type temp_admin_token.txt
echo.
echo.
echo Copy the token above and paste it when prompted
echo.
set /p ADMIN_TOKEN="Enter ADMIN TOKEN: "
echo.

echo [9] Get admin dashboard stats...
curl -X GET http://localhost:8080/api/admin/dashboard -H "Authorization: Bearer %ADMIN_TOKEN%"
echo.
echo.

echo [10] Get pending transactions...
curl -X GET "http://localhost:8080/api/admin/transactions?status=pending" -H "Authorization: Bearer %ADMIN_TOKEN%"
echo.
echo.

echo [11] Get all transactions...
curl -X GET http://localhost:8080/api/admin/transactions -H "Authorization: Bearer %ADMIN_TOKEN%"
echo.
echo.

echo ========================================
echo To approve/reject transactions, use:
echo curl -X POST http://localhost:8080/api/admin/transactions/[ID]/process -H "Authorization: Bearer %ADMIN_TOKEN%" -H "Content-Type: application/json" -d "{\"action\":\"approve\"}"
echo.
echo Replace [ID] with transaction ID
echo Replace "approve" with "reject" to reject
echo ========================================
echo.

del temp_user_token.txt
del temp_admin_token.txt

pause
