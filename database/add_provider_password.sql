-- ========================================
-- ADD PASSWORD FIELD TO PROVIDER ACCOUNTS
-- ========================================
-- This migration adds password authentication to provider accounts

-- Add password column to provider_accounts table
ALTER TABLE provider_accounts
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN provider_accounts.password_hash IS 'Hashed password for provider authentication using bcrypt';

-- Create index on email for login lookups (if not already exists)
CREATE INDEX IF NOT EXISTS idx_provider_accounts_email_password ON provider_accounts(email, password_hash);

-- ========================================
-- NOTES FOR IMPLEMENTATION
-- ========================================
-- 1. Passwords should be hashed using bcrypt before storing
-- 2. Minimum password length should be enforced in the application (e.g., 8 characters)
-- 3. Consider implementing password complexity requirements
-- 4. Implement password reset functionality with secure tokens
-- 5. Consider adding failed login attempt tracking for security
--
-- Example in Node.js/Next.js:
-- const bcrypt = require('bcryptjs');
-- const saltRounds = 10;
-- const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
--
-- For login verification:
-- const isValid = await bcrypt.compare(plainPassword, hashedPassword);

-- ========================================
-- END OF MIGRATION
-- ========================================
