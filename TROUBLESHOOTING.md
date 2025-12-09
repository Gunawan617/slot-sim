# 🔧 Troubleshooting Guide - Wallet & Admin Panel

## 🚨 Common Issues & Solutions

---

## Backend Issues

### 1. Backend Won't Start

#### Error: "failed to connect database"
**Cause**: Database file tidak bisa diakses atau corrupt

**Solution**:
```bash
# Backup database lama
copy test.db test.db.backup

# Hapus dan biarkan auto-create
del test.db

# Start backend lagi
start_backend.bat
```

#### Error: "port 8080 already in use"
**Cause**: Port sudah digunakan aplikasi lain

**Solution**:
```bash
# Cari process yang menggunakan port 8080
netstat -ano | findstr :8080

# Kill process (ganti PID dengan hasil di atas)
taskkill /PID <PID> /F

# Atau ubah port di main.go
# r.Run(":8081")  // Ganti ke port lain
```

#### Error: "package not found"
**Cause**: Dependencies belum di-install

**Solution**:
```bash
go mod download
go mod tidy
```

---

### 2. Authentication Issues

#### Error: "Invalid token"
**Cause**: Token expired atau tidak valid

**Solution**:
- Login ulang untuk mendapatkan token baru
- Pastikan token di-copy dengan benar (tanpa spasi)
- Check token expiration di `utils/jwt.go`

#### Error: "Missing token"
**Cause**: Header Authorization tidak ada

**Solution**:
```bash
# Pastikan format header benar
curl -H "Authorization: Bearer <TOKEN>" ...

# Bukan:
curl -H "Authorization: <TOKEN>" ...  # ❌ Salah
```

---

### 3. Admin Access Issues

#### Error: "Admin access required"
**Cause**: User bukan admin atau role belum di-update

**Solution**:
```sql
-- Cek role user
SELECT id, username, role FROM users WHERE username = 'admin';

-- Update role jika masih 'user'
UPDATE users SET role = 'admin' WHERE username = 'admin';

-- Verify
SELECT id, username, role FROM users WHERE username = 'admin';
```

#### Admin Button Tidak Muncul
**Cause**: Frontend tidak detect role admin

**Solution**:
1. Logout dan login ulang
2. Check browser console untuk errors
3. Verify API response dari `/user/me` include role
4. Clear browser cache

---

### 4. Transaction Issues

#### Error: "Insufficient balance"
**Cause**: User tidak punya cukup balance untuk withdraw

**Solution**:
```bash
# Check balance user
curl -X GET http://localhost:8080/user/me -H "Authorization: Bearer <TOKEN>"

# Atau top up dulu sebelum withdraw
```

#### Error: "Transaction already processed"
**Cause**: Transaksi sudah di-approve atau reject sebelumnya

**Solution**:
- Tidak bisa diproses ulang
- Buat transaksi baru jika perlu

#### Balance Tidak Update Setelah Approve
**Cause**: Cache atau tidak refresh

**Solution**:
1. Refresh halaman (F5)
2. Logout dan login ulang
3. Check database langsung:
```sql
SELECT id, username, balance FROM users WHERE id = <USER_ID>;
```

---

## Frontend Issues

### 1. Frontend Won't Start

#### Error: "Cannot find module"
**Cause**: Dependencies belum di-install

**Solution**:
```bash
cd frontend
npm install
npm run dev
```

#### Error: "Port 5173 already in use"
**Cause**: Vite dev server sudah running

**Solution**:
```bash
# Kill process atau ubah port
# Edit vite.config.js:
export default defineConfig({
  server: {
    port: 5174  // Ganti port
  }
})
```

---

### 2. API Connection Issues

#### Error: "Network Error" atau "Failed to fetch"
**Cause**: Backend tidak running atau CORS issue

**Solution**:
1. Pastikan backend running di port 8080
2. Check CORS middleware di backend
3. Verify API base URL di `frontend/src/api.js`:
```javascript
const api = axios.create({
    baseURL: 'http://localhost:8080',  // Pastikan benar
});
```

#### Error: "401 Unauthorized"
**Cause**: Token tidak valid atau expired

**Solution**:
- Logout dan login ulang
- Check localStorage untuk token:
```javascript
// Di browser console
localStorage.getItem('token')
```

---

### 3. UI/Display Issues

#### Balance Tidak Muncul
**Cause**: API call gagal atau data tidak ada

**Solution**:
1. Check browser console untuk errors
2. Verify API response:
```bash
curl -X GET http://localhost:8080/user/me -H "Authorization: Bearer <TOKEN>"
```
3. Check AuthContext state

#### Transaction History Kosong
**Cause**: Belum ada transaksi atau API call gagal

**Solution**:
1. Buat transaksi test dulu
2. Check API response:
```bash
curl -X GET http://localhost:8080/api/wallet/history -H "Authorization: Bearer <TOKEN>"
```
3. Check browser console

#### Admin Panel Tidak Load
**Cause**: User bukan admin atau route tidak configured

**Solution**:
1. Verify user role = 'admin'
2. Check route di `App.jsx`
3. Check browser console untuk errors
4. Try akses langsung: `http://localhost:5173/admin`

---

## Database Issues

### 1. Database Corrupt

#### Error: "database disk image is malformed"
**Cause**: Database file corrupt

**Solution**:
```bash
# Backup database
copy test.db test.db.backup

# Try repair
sqlite3 test.db "PRAGMA integrity_check;"

# Jika tidak bisa, restore dari backup atau create new
del test.db
# Start backend untuk auto-create
```

---

### 2. Migration Issues

#### Error: "table already exists"
**Cause**: Manual table creation conflict dengan auto-migrate

**Solution**:
```bash
# Drop tables dan biarkan auto-migrate
sqlite3 test.db
> DROP TABLE IF EXISTS transactions;
> DROP TABLE IF EXISTS users;
> .quit

# Start backend untuk auto-migrate
```

---

### 3. Data Inconsistency

#### Balance Tidak Match dengan Transaksi
**Cause**: Manual update atau bug

**Solution**:
```sql
-- Recalculate balance
SELECT 
    u.id,
    u.username,
    u.balance as current_balance,
    COALESCE(SUM(CASE 
        WHEN t.type = 'deposit' AND t.status = 'approved' THEN t.amount
        WHEN t.type = 'withdraw' AND t.status = 'approved' THEN -t.amount
        ELSE 0 
    END), 0) as calculated_balance
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.id;

-- Manual fix jika perlu
UPDATE users SET balance = <CORRECT_AMOUNT> WHERE id = <USER_ID>;
```

---

## Testing Issues

### 1. Test Script Fails

#### Error: "curl: command not found"
**Cause**: curl tidak installed

**Solution**:
```bash
# Install curl atau gunakan Postman/Insomnia
# Atau test langsung di frontend
```

#### Token Tidak Ter-copy
**Cause**: Script issue atau manual copy

**Solution**:
- Copy token manual dari response
- Atau gunakan Postman untuk save token

---

### 2. API Test Fails

#### 404 Not Found
**Cause**: Route tidak ada atau typo

**Solution**:
- Check route di `routes/routes.go`
- Verify endpoint URL
- Check HTTP method (GET/POST)

#### 500 Internal Server Error
**Cause**: Backend error

**Solution**:
1. Check backend logs di terminal
2. Check database connection
3. Verify request body format

---

## Performance Issues

### 1. Slow Response

#### API Response Lambat
**Cause**: Database query tidak optimal

**Solution**:
```sql
-- Add indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
```

#### Frontend Lambat
**Cause**: Too many re-renders atau large data

**Solution**:
- Implement pagination
- Use React.memo untuk components
- Add loading states
- Optimize images

---

### 2. Memory Issues

#### Backend Memory Leak
**Cause**: Database connections tidak di-close

**Solution**:
- GORM handles this automatically
- Check for goroutine leaks
- Monitor with `pprof`

---

## Security Issues

### 1. JWT Issues

#### Token Expired Too Fast
**Cause**: Short expiration time

**Solution**:
```go
// Edit utils/jwt.go
expirationTime := time.Now().Add(24 * time.Hour)  // Increase time
```

#### Token Tidak Secure
**Cause**: Weak secret key

**Solution**:
```bash
# Generate strong secret
# Edit .env
JWT_SECRET=<STRONG_RANDOM_STRING>
```

---

### 2. CORS Issues

#### CORS Error di Browser
**Cause**: CORS not configured properly

**Solution**:
```go
// Check middleware/cors.go
c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
```

---

## Development Issues

### 1. Hot Reload Not Working

#### Frontend Changes Tidak Auto-reload
**Cause**: Vite issue

**Solution**:
```bash
# Restart dev server
Ctrl+C
npm run dev
```

#### Backend Changes Tidak Apply
**Cause**: Need manual restart

**Solution**:
```bash
# Stop backend (Ctrl+C)
# Start again
start_backend.bat

# Atau gunakan air untuk hot reload:
go install github.com/cosmtrek/air@latest
air
```

---

### 2. Build Issues

#### Frontend Build Fails
**Cause**: TypeScript errors atau missing deps

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Backend Build Fails
**Cause**: Missing dependencies atau syntax error

**Solution**:
```bash
go mod tidy
go build -o slot-sim.exe
```

---

## Quick Diagnostic Commands

### Check Backend Status
```bash
# Test ping
curl http://localhost:8080/ping

# Test root
curl http://localhost:8080/
```

### Check Database
```bash
# Open database
sqlite3 test.db

# Check tables
.tables

# Check users
SELECT * FROM users;

# Check transactions
SELECT * FROM transactions;

# Exit
.quit
```

### Check Frontend
```bash
# Check if running
curl http://localhost:5173

# Check build
cd frontend
npm run build
```

---

## Emergency Recovery

### Complete Reset

```bash
# 1. Stop all servers
# Ctrl+C di semua terminal

# 2. Backup database
copy test.db test.db.backup

# 3. Clean database
del test.db

# 4. Clean frontend
cd frontend
rm -rf node_modules
npm install

# 5. Start backend
cd ..
start_backend.bat

# 6. Create admin
create_admin.bat

# 7. Update admin role in database

# 8. Start frontend
cd frontend
npm run dev
```

---

## Getting Help

### Debug Checklist
- [ ] Backend running? Check `http://localhost:8080/ping`
- [ ] Frontend running? Check `http://localhost:5173`
- [ ] Database exists? Check `test.db` file
- [ ] Admin role set? Check database
- [ ] Token valid? Try login again
- [ ] CORS enabled? Check middleware
- [ ] Console errors? Check browser console
- [ ] Backend logs? Check terminal

### Useful Commands
```bash
# Check Go version
go version

# Check Node version
node --version

# Check npm version
npm --version

# Check running processes
netstat -ano | findstr :8080
netstat -ano | findstr :5173

# Check database
sqlite3 test.db ".schema"
```

---

## Contact & Resources

- **Documentation**: Check all `.md` files in root
- **API Docs**: `API_DOCUMENTATION.md`
- **Architecture**: `ARCHITECTURE.md`
- **Setup Guide**: `WALLET_SETUP_QUICK_START.md`

---

**Still having issues? Check the logs and error messages carefully!** 🔍
