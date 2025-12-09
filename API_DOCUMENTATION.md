# Slot Sim API Documentation

## Base URL
`http://localhost:8080`

## Endpoints

### Public Endpoints

#### 1. Register
Create a new user account.
- **URL**: `/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "testuser",
    "password": "password123"
  }
  ```
- **Response**: `200 OK`

#### 2. Login
Authenticate and receive a bearer token.
- **URL**: `/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "testuser",
    "password": "password123"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "token": "eyJhbGciOiJIUzI1Ni..."
  }
  ```

### Protected Endpoints
Require `Authorization: Bearer <token>` header.

#### 3. Get Profile
Get current user details.
- **URL**: `/user/me`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  {
    "username": "testuser",
    "balance": 1000,
    "role": "user"
  }
  ```

#### 4. Play Slot
Play a round of the slot simulation.
- **URL**: `/user/play-slot`
- **Method**: `POST`
- **Response**: `200 OK`
  ```json
  {
    "outcome": "win",
    "balance_change": 100,
    "current_balance": 1100
  }
  ```

#### 5. Get History
Get game history for the user.
- **URL**: `/user/history`
- **Method**: `GET`
- **Response**: `200 OK` (Array of logs)

---

## Running Tests

### Using the provided script
We have provided a script to automate these tests.

**Windows (Batch):**
Run `test_api.bat` in your terminal. Note: You need `curl` installed and available in your PATH.

**Linux/Mac/Git Bash:**
Run `./test_api.sh`

### Manual Curl Commands

**Register:**
```bash
curl -X POST http://localhost:8080/register -H "Content-Type: application/json" -d "{\"username\":\"player1\", \"password\":\"pass123\"}"
```

**Login:**
```bash
curl -X POST http://localhost:8080/login -H "Content-Type: application/json" -d "{\"username\":\"player1\", \"password\":\"pass123\"}"
```
*Copy the token from the response.*

**Get Profile:**
```bash
curl -X GET http://localhost:8080/user/me -H "Authorization: Bearer <YOUR_TOKEN>"
```

**Play Slot:**
```bash
curl -X POST http://localhost:8080/user/play-slot -H "Authorization: Bearer <YOUR_TOKEN>"
```

---

## Wallet Endpoints

#### 6. Request Top Up
Submit a top up request (requires admin approval).
- **URL**: `/api/wallet/topup`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "amount": 100000,
    "bank_name": "BCA",
    "bank_account": "1234567890",
    "account_name": "John Doe"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "message": "Top up request submitted",
    "transaction": {
      "id": 1,
      "user_id": 1,
      "type": "deposit",
      "amount": 100000,
      "status": "pending",
      "bank_name": "BCA",
      "bank_account": "1234567890",
      "account_name": "John Doe"
    }
  }
  ```

#### 7. Request Withdraw
Submit a withdraw request (balance deducted immediately, refunded if rejected).
- **URL**: `/api/wallet/withdraw`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "amount": 50000,
    "bank_name": "BCA",
    "bank_account": "1234567890",
    "account_name": "John Doe"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "message": "Withdraw request submitted",
    "transaction": {...},
    "new_balance": 950000
  }
  ```

#### 8. Get Wallet History
Get transaction history for current user.
- **URL**: `/api/wallet/history`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`
  ```json
  {
    "transactions": [
      {
        "id": 1,
        "user_id": 1,
        "type": "deposit",
        "amount": 100000,
        "status": "approved",
        "bank_name": "BCA",
        "bank_account": "1234567890",
        "account_name": "John Doe",
        "created_at": "2024-01-01T10:00:00Z"
      }
    ]
  }
  ```

---

## Admin Endpoints
Require admin role.

#### 9. Get All Transactions
Get all transactions with optional status filter.
- **URL**: `/api/admin/transactions?status=pending`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Query Params**: 
  - `status` (optional): `pending`, `approved`, or `rejected`
- **Response**: `200 OK`
  ```json
  {
    "transactions": [...]
  }
  ```

#### 10. Process Transaction
Approve or reject a transaction.
- **URL**: `/api/admin/transactions/:id/process`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Body**:
  ```json
  {
    "action": "approve"
  }
  ```
  or
  ```json
  {
    "action": "reject"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "message": "Transaction processed successfully",
    "transaction": {...}
  }
  ```

#### 11. Get Dashboard Stats
Get admin dashboard statistics.
- **URL**: `/api/admin/dashboard`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Response**: `200 OK`
  ```json
  {
    "total_users": 10,
    "pending_deposits": 3,
    "pending_withdraws": 2,
    "total_deposits": 1000000,
    "total_withdraws": 500000
  }
  ```
