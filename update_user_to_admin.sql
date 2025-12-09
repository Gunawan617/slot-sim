-- Update user to admin role
-- Replace 'admin' with the username you want to make admin

UPDATE users SET role = 'admin' WHERE username = 'admin';

-- Verify the change
SELECT id, username, role, balance FROM users WHERE username = 'admin';
