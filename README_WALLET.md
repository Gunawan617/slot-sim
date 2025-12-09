# 💳 Wallet & Admin Panel - Slot Simulator

## 🎯 Overview

Sistem wallet dan admin panel untuk mengelola top up dan withdraw dengan approval admin.

### Fitur Utama
- 💰 **Top Up**: User request deposit, admin approve untuk tambah balance
- 💸 **Withdraw**: User request penarikan, balance langsung dikurangi, admin approve/reject
- 📊 **Admin Panel**: Dashboard dan management transaksi
- 📜 **History**: Riwayat transaksi lengkap dengan status

---

## 🚀 Quick Start (3 Langkah)

### 1️⃣ Start Backend
```bash
start_backend.bat
```

### 2️⃣ Buat & Setup Admin
```bash
# Buat admin user
create_admin.bat

# Update role di database (gunakan SQLite browser atau CLI)
# Buka test.db dan jalankan:
UPDATE users SET role = 'admin' WHERE username = 'admin';
```

### 3️⃣ Start Frontend
```bash
cd frontend
npm run dev
```

**Done!** Buka browser di `http://localhost:5173`

---

## 📱 Cara Menggunakan

### Untuk User

#### Top Up
1. Login ke aplikasi
2. Klik button **"💳 Wallet"** di navbar
3. Pilih tab **"Top Up"**
4. Isi form:
   - Amount (Rp)
   - Bank Name (contoh: BCA, Mandiri)
   - Bank Account Number
   - Account Name
5. Klik **"Submit Top Up"**
6. Tunggu admin approve

#### Withdraw
1. Klik button **"💳 Wallet"** di navbar
2. Pilih tab **"Withdraw"**
3. Isi form (sama seperti top up)
4. Klik **"Submit Withdraw"**
5. **Balance langsung dikurangi**
6. Tunggu admin approve (jika reject, balance dikembalikan)

#### Cek History
- Scroll ke bawah di halaman Wallet
- Lihat semua transaksi dengan status:
  - 🟡 **Pending**: Menunggu admin
  - 🟢 **Approved**: Disetujui
  - 🔴 **Rejected**: Ditolak

---

### Untuk Admin

#### Akses Admin Panel
1. Login dengan user yang role-nya 'admin'
2. Klik button **"👑 Admin"** di navbar
3. Lihat dashboard statistics

#### Approve/Reject Transaksi
1. Klik tab **"Pending"** untuk lihat transaksi yang menunggu
2. Lihat detail transaksi (User ID, Amount, Bank Info)
3. Klik **"Approve"** untuk setujui
4. Klik **"Reject"** untuk tolak

#### Filter Transaksi
- **Pending**: Transaksi yang menunggu
- **Approved**: Transaksi yang disetujui
- **Rejected**: Transaksi yang ditolak
- **All**: Semua transaksi

---

## 🔐 Login Credentials

### Admin (setelah setup)
- Username: `admin`
- Password: `admin123`

### Test User (buat sendiri)
- Register di halaman register
- Login dengan credentials yang dibuat

---

## 🧪 Testing

### Test dengan Script
```bash
test_wallet_admin.bat
```

### Test Manual (API)
Lihat file `API_DOCUMENTATION.md` untuk curl commands lengkap.

---

## 📚 Dokumentasi Lengkap

- 📖 **Quick Start**: `WALLET_SETUP_QUICK_START.md`
- 📘 **Full Guide**: `WALLET_ADMIN_GUIDE.md`
- 📙 **API Documentation**: `API_DOCUMENTATION.md`
- 📗 **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`

---

## ⚠️ Important Notes

### Withdraw Logic
- Balance **langsung dikurangi** saat user submit request
- Jika admin **approve**: Transaksi selesai
- Jika admin **reject**: Balance **dikembalikan** ke user

### Admin Access
- Button "👑 Admin" hanya muncul untuk user dengan role 'admin'
- Non-admin tidak bisa akses `/admin` endpoint (403 Forbidden)

### Security
- Semua endpoint dilindungi dengan JWT authentication
- Admin endpoint dilindungi dengan role check
- Database transaction untuk atomicity

---

## 🎨 Screenshots

### Wallet Page
```
┌─────────────────────────────────────┐
│  Wallet                             │
│  Balance: Rp 1,000,000              │
├─────────────────────────────────────┤
│  [Top Up] [Withdraw]                │
│                                     │
│  Amount: [_________]                │
│  Bank Name: [_________]             │
│  Bank Account: [_________]          │
│  Account Name: [_________]          │
│                                     │
│  [Submit Top Up]                    │
├─────────────────────────────────────┤
│  Transaction History                │
│  • +Rp 100,000 - PENDING            │
│  • -Rp 50,000 - APPROVED            │
└─────────────────────────────────────┘
```

### Admin Panel
```
┌─────────────────────────────────────┐
│  Admin Panel                        │
├─────────────────────────────────────┤
│  [10 Users] [3 Pending Deposits]    │
│  [2 Pending Withdraws]              │
├─────────────────────────────────────┤
│  [Pending] [Approved] [Rejected]    │
├─────────────────────────────────────┤
│  ID | User | Type | Amount | Status │
│  1  | 5    | dep  | 100k   | [✓][✗]│
│  2  | 3    | with | 50k    | [✓][✗]│
└─────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Button Admin tidak muncul
**Solusi**: Update role di database
```sql
UPDATE users SET role = 'admin' WHERE username = 'admin';
```

### Error "Insufficient balance"
**Solusi**: User tidak punya cukup balance untuk withdraw

### Error "Admin access required"
**Solusi**: User bukan admin atau belum login

### Frontend tidak connect
**Solusi**: Pastikan backend running di port 8080

---

## 🎯 Flow Diagram

### Top Up Flow
```
User Submit Request
        ↓
   Status: PENDING
        ↓
   Admin Review
        ↓
    ┌───┴───┐
    ↓       ↓
 APPROVE  REJECT
    ↓       ↓
Balance+  No Change
```

### Withdraw Flow
```
User Submit Request
        ↓
   Balance - Amount
        ↓
   Status: PENDING
        ↓
   Admin Review
        ↓
    ┌───┴───┐
    ↓       ↓
 APPROVE  REJECT
    ↓       ↓
  Done   Balance+
```

---

## 📊 Database Schema

### Transactions
```sql
id          INTEGER PRIMARY KEY
user_id     INTEGER
type        TEXT (deposit/withdraw)
amount      REAL
status      TEXT (pending/approved/rejected)
bank_name   TEXT
bank_account TEXT
account_name TEXT
created_at  DATETIME
updated_at  DATETIME
```

---

## 🚀 Next Steps

Setelah setup selesai, Anda bisa:
1. ✅ Test top up dan withdraw
2. ✅ Test admin approve/reject
3. ✅ Customize UI sesuai kebutuhan
4. ✅ Add more features (email notification, payment proof, etc.)

---

## 📞 Need Help?

Cek dokumentasi lengkap di:
- `WALLET_ADMIN_GUIDE.md` - Panduan lengkap
- `API_DOCUMENTATION.md` - API reference
- `IMPLEMENTATION_SUMMARY.md` - Technical details

---

**Happy Coding! 🎉**
