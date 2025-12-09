# Quick Start - Wallet & Admin Panel

## 🚀 Setup Cepat (5 Menit)

### 1. Start Backend
```bash
start_backend.bat
```

### 2. Buat Admin User
```bash
# Jalankan script ini
create_admin.bat

# Atau manual dengan curl:
curl -X POST http://localhost:8080/register -H "Content-Type: application/json" -d "{\"username\":\"admin\", \"password\":\"admin123\"}"
```

### 3. Update Role ke Admin
Buka database `test.db` dengan SQLite browser atau CLI, lalu jalankan:
```sql
UPDATE users SET role = 'admin' WHERE username = 'admin';
```

### 4. Start Frontend
```bash
cd frontend
npm run dev
```

### 5. Login & Test
1. Buka browser: `http://localhost:5173`
2. Login dengan:
   - Username: `admin`
   - Password: `admin123`
3. Klik button "👑 Admin" di navbar untuk akses Admin Panel
4. Klik button "💳 Wallet" untuk akses Wallet

---

## 📋 Fitur yang Sudah Dibuat

### Backend (Go)
✅ `controllers/admin.go` - Admin controller untuk manage transaksi
✅ `middleware/admin.go` - Middleware untuk proteksi admin routes
✅ `routes/routes.go` - Routes untuk wallet & admin
✅ `handlers/wallet_handler.go` - Handler untuk top up & withdraw (sudah ada)
✅ `models/transaction.go` - Model transaksi (sudah ada)

### Frontend (React)
✅ `frontend/src/pages/Wallet.jsx` - Halaman wallet user
✅ `frontend/src/pages/AdminPanel.jsx` - Halaman admin panel
✅ `frontend/src/api.js` - API functions untuk wallet & admin
✅ `frontend/src/App.jsx` - Routing untuk wallet & admin
✅ `frontend/src/pages/Home.jsx` - Tambah button Wallet & Admin

### Documentation
✅ `API_DOCUMENTATION.md` - Updated dengan wallet & admin endpoints
✅ `WALLET_ADMIN_GUIDE.md` - Panduan lengkap wallet & admin
✅ `WALLET_SETUP_QUICK_START.md` - Quick start guide (file ini)

---

## 🎯 Flow Transaksi

### Top Up (Deposit)
1. User submit request → Status: `pending`
2. Admin approve → Balance user **+amount**
3. Admin reject → Tidak ada perubahan

### Withdraw
1. User submit request → Balance user **-amount** (langsung dikurangi)
2. Admin approve → Selesai (balance sudah dikurangi)
3. Admin reject → Balance user **+amount** (dikembalikan)

---

## 🧪 Test Endpoints

### User Wallet
```bash
# Login
curl -X POST http://localhost:8080/login -H "Content-Type: application/json" -d "{\"username\":\"testuser\", \"password\":\"pass123\"}"

# Top Up Request
curl -X POST http://localhost:8080/api/wallet/topup -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d "{\"amount\":100000, \"bank_name\":\"BCA\", \"bank_account\":\"1234567890\", \"account_name\":\"Test User\"}"

# Withdraw Request
curl -X POST http://localhost:8080/api/wallet/withdraw -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d "{\"amount\":50000, \"bank_name\":\"BCA\", \"bank_account\":\"1234567890\", \"account_name\":\"Test User\"}"
```

### Admin Panel
```bash
# Login as Admin
curl -X POST http://localhost:8080/login -H "Content-Type: application/json" -d "{\"username\":\"admin\", \"password\":\"admin123\"}"

# Get Pending Transactions
curl -X GET http://localhost:8080/api/admin/transactions?status=pending -H "Authorization: Bearer <ADMIN_TOKEN>"

# Approve Transaction ID 1
curl -X POST http://localhost:8080/api/admin/transactions/1/process -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d "{\"action\":\"approve\"}"
```

---

## 📱 UI Features

### Wallet Page (`/wallet`)
- Tab Top Up & Withdraw
- Form input: Amount, Bank Name, Account Number, Account Name
- Transaction History dengan status color-coded
- Real-time balance display

### Admin Panel (`/admin`)
- Dashboard dengan statistics:
  - Total Users
  - Pending Deposits/Withdraws
  - Total Approved Deposits/Withdraws
- Transaction table dengan filter (Pending/Approved/Rejected/All)
- Approve/Reject buttons untuk pending transactions
- Detail lengkap setiap transaksi

---

## ⚠️ Important Notes

1. **Admin Button**: Hanya muncul jika user role = 'admin'
2. **Withdraw**: Balance langsung dikurangi saat request (bukan saat approve)
3. **Security**: Admin routes dilindungi dengan middleware
4. **Database**: Menggunakan transaction untuk atomicity

---

## 🐛 Troubleshooting

**Button Admin tidak muncul?**
→ Pastikan role sudah di-update ke 'admin' di database

**Error "Insufficient balance"?**
→ User tidak punya cukup balance untuk withdraw

**Error "Admin access required"?**
→ User bukan admin atau token tidak valid

**Frontend tidak connect ke backend?**
→ Pastikan backend running di port 8080

---

## 📞 Support

Jika ada masalah, cek:
1. Backend logs di terminal
2. Browser console untuk frontend errors
3. Database `test.db` untuk verify data
4. API_DOCUMENTATION.md untuk endpoint details
