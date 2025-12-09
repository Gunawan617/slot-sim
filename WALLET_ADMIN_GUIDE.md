# Wallet & Admin Panel Guide

## Fitur Wallet

### Top Up (Deposit)
1. User mengisi form top up dengan:
   - Jumlah (Rp)
   - Nama Bank
   - Nomor Rekening
   - Nama Pemilik Rekening
2. Request masuk ke database dengan status `pending`
3. Admin melihat request di Admin Panel
4. Jika approved: Balance user bertambah
5. Jika rejected: Request ditolak

### Withdraw (Penarikan)
1. User mengisi form withdraw dengan:
   - Jumlah (Rp) - tidak boleh melebihi balance
   - Nama Bank
   - Nomor Rekening
   - Nama Pemilik Rekening
2. **Balance langsung dikurangi** saat request dibuat
3. Request masuk ke database dengan status `pending`
4. Admin melihat request di Admin Panel
5. Jika approved: Transaksi selesai (balance sudah dikurangi)
6. Jika rejected: **Balance dikembalikan** ke user

### Transaction History
User dapat melihat semua transaksi mereka dengan status:
- `pending` - Menunggu approval admin
- `approved` - Disetujui admin
- `rejected` - Ditolak admin

---

## Admin Panel

### Dashboard Statistics
Admin dapat melihat:
- Total Users
- Pending Deposits (Top Up yang menunggu)
- Pending Withdraws (Withdraw yang menunggu)
- Total Deposits (Approved)
- Total Withdraws (Approved)

### Transaction Management
Admin dapat:
1. Filter transaksi berdasarkan status (Pending/Approved/Rejected/All)
2. Melihat detail setiap transaksi:
   - User ID
   - Type (deposit/withdraw)
   - Amount
   - Bank Info (Bank Name, Account Number, Account Name)
   - Status
   - Date
3. Approve atau Reject transaksi pending

### Approve/Reject Logic

**Deposit (Top Up):**
- Approve: Balance user bertambah
- Reject: Tidak ada perubahan balance

**Withdraw:**
- Approve: Tidak ada perubahan (balance sudah dikurangi saat request)
- Reject: Balance dikembalikan ke user

---

## Setup Admin User

### Cara 1: Menggunakan Script (Recommended)
1. Jalankan backend: `start_backend.bat`
2. Jalankan: `create_admin.bat`
3. Buka database `test.db` dengan SQLite browser
4. Jalankan query:
   ```sql
   UPDATE users SET role = 'admin' WHERE username = 'admin';
   ```

### Cara 2: Manual
1. Register user baru dengan username `admin`
2. Buka database `test.db`
3. Update role:
   ```sql
   UPDATE users SET role = 'admin' WHERE username = 'admin';
   ```

### Cara 3: Menggunakan SQL File
1. Buka database dengan SQLite CLI:
   ```bash
   sqlite3 test.db
   ```
2. Jalankan:
   ```sql
   .read update_user_to_admin.sql
   ```

---

## Testing

### Test Wallet (User)
```bash
# Login sebagai user
curl -X POST http://localhost:8080/login -H "Content-Type: application/json" -d "{\"username\":\"testuser\", \"password\":\"pass123\"}"

# Request Top Up
curl -X POST http://localhost:8080/api/wallet/topup -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d "{\"amount\":100000, \"bank_name\":\"BCA\", \"bank_account\":\"1234567890\", \"account_name\":\"Test User\"}"

# Request Withdraw
curl -X POST http://localhost:8080/api/wallet/withdraw -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d "{\"amount\":50000, \"bank_name\":\"BCA\", \"bank_account\":\"1234567890\", \"account_name\":\"Test User\"}"

# Get History
curl -X GET http://localhost:8080/api/wallet/history -H "Authorization: Bearer <TOKEN>"
```

### Test Admin Panel
```bash
# Login sebagai admin
curl -X POST http://localhost:8080/login -H "Content-Type: application/json" -d "{\"username\":\"admin\", \"password\":\"admin123\"}"

# Get Dashboard Stats
curl -X GET http://localhost:8080/api/admin/dashboard -H "Authorization: Bearer <ADMIN_TOKEN>"

# Get Pending Transactions
curl -X GET http://localhost:8080/api/admin/transactions?status=pending -H "Authorization: Bearer <ADMIN_TOKEN>"

# Approve Transaction
curl -X POST http://localhost:8080/api/admin/transactions/1/process -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d "{\"action\":\"approve\"}"

# Reject Transaction
curl -X POST http://localhost:8080/api/admin/transactions/1/process -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d "{\"action\":\"reject\"}"
```

---

## Frontend Routes

### User Routes
- `/wallet` - Wallet page (Top Up, Withdraw, History)

### Admin Routes
- `/admin` - Admin Panel (Dashboard, Transaction Management)

### Akses Admin Panel
- Button "👑 Admin" akan muncul di navbar jika user memiliki role `admin`
- Jika non-admin mencoba akses `/admin`, akan mendapat error 403 Forbidden

---

## Database Schema

### Transaction Table
```sql
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'deposit' or 'withdraw'
    amount REAL NOT NULL,
    status TEXT NOT NULL, -- 'pending', 'approved', 'rejected'
    bank_name TEXT NOT NULL,
    bank_account TEXT NOT NULL,
    account_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Security Notes

1. **Withdraw Protection**: Balance dikurangi saat request untuk mencegah user withdraw lebih dari balance mereka
2. **Admin Middleware**: Endpoint admin dilindungi dengan middleware yang cek role
3. **Transaction Lock**: Menggunakan database transaction untuk memastikan atomicity
4. **Validation**: Semua input divalidasi (amount > 0, required fields, dll)

---

## Troubleshooting

### Error: "Admin access required"
- Pastikan user sudah di-update role-nya menjadi 'admin' di database

### Error: "Insufficient balance"
- User tidak memiliki cukup balance untuk withdraw
- Cek balance dengan endpoint `/user/me`

### Error: "Transaction already processed"
- Transaksi sudah di-approve atau reject sebelumnya
- Tidak bisa diproses ulang

### Balance tidak update setelah approve deposit
- Cek apakah transaksi benar-benar approved
- Refresh halaman atau fetch balance lagi
