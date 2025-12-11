# Database Setup Guide for Provider Accounts

## 📋 Table of Contents
1. [Recommended Approach: New Tables](#recommended-approach-new-tables)
2. [Alternative Approach: Amend Existing Tables](#alternative-approach-amend-existing-tables)
3. [Which Approach Should You Choose?](#which-approach-should-you-choose)
4. [Setup Instructions](#setup-instructions)

---

## ✅ Recommended Approach: New Tables

**File**: `provider_accounts_schema.sql`

This approach creates **dedicated tables** specifically for provider accounts:

### Tables Created:
1. **`provider_accounts`** - Stores all provider-specific data
2. **`provider_documents`** - Manages uploaded documents

### Advantages:
- ✅ **Clean separation** of regular users vs providers
- ✅ **Scalable** - easy to add provider-specific features
- ✅ **Better organization** - all provider data in one place
- ✅ **Flexible** - different fields and validations for providers
- ✅ **Security** - separate RLS policies for providers
- ✅ **No conflicts** - won't affect existing user system

### Disadvantages:
- ⚠️ Two separate user systems to manage
- ⚠️ Can't reuse auth from `profiles` table directly

### When to Use:
- When providers are **different from regular users**
- When providers need **many unique fields** (NPI, Tax ID, etc.)
- When you want **separate workflows** for providers vs users
- When you anticipate **complex provider features** in the future

**🎯 This is the recommended approach and is already implemented in the code.**

---

## 🔄 Alternative Approach: Amend Existing Tables

This approach **extends the current `profiles` table** to include provider data.

### What Changes:
- Add provider-specific columns to `profiles` table
- Use `role` field to distinguish providers from users
- Optionally add a `provider_details` JSONB column for flexibility

### SQL to Amend Existing Tables:

```sql
-- ========================================
-- OPTION 2: AMEND EXISTING PROFILES TABLE
-- ========================================

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS provider_data JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create provider_documents table (still needed for file management)
CREATE TABLE IF NOT EXISTS provider_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_provider_documents_user_id ON provider_documents(user_id);

-- Update trigger for profiles
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profiles_updated_at();

-- Comments
COMMENT ON COLUMN profiles.role IS 'User role: user, provider, admin';
COMMENT ON COLUMN profiles.provider_data IS 'JSON object containing provider-specific data';
COMMENT ON COLUMN profiles.status IS 'Account status: active, pending_signature, approved, rejected, suspended';

-- Sample provider_data structure:
/*
{
  "firstName": "John",
  "lastName": "Doe",
  "suffix": "MD",
  "phone": "555-0100",
  "companyName": "ABC Medical",
  "businessType": "Provider",
  "website": "https://example.com",
  "taxIdEin": "12-3456789",
  "npiNumber": "1234567890",
  "npiOwnerMatches": true,
  "hasResellersLicense": "yes",
  "resellersPermitNumber": "RL123456",
  "resellersCertificateUrl": "https://...",
  "addressLine1": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "businessLicenseUrl": "https://...",
  "referredBy": "Dr. Smith",
  "additionalNotes": "...",
  "marketingConsent": true
}
*/
```

### Advantages:
- ✅ **Single user system** - providers are just users with role='provider'
- ✅ **Reuse auth** - can use existing Supabase auth
- ✅ **Simpler architecture** - fewer tables
- ✅ **Easier queries** - one table for all users

### Disadvantages:
- ⚠️ **Messy table** - profiles table becomes very wide
- ⚠️ **Less flexible** - hard to add many provider-specific fields
- ⚠️ **JSONB queries** - harder to query provider-specific data
- ⚠️ **Validation complexity** - different fields for different roles

### When to Use:
- When providers are **similar to regular users**
- When you want **unified authentication**
- When provider-specific data is **minimal**
- When you prefer **simplicity over scalability**

---

## 🤔 Which Approach Should You Choose?

### Choose **New Tables** (Recommended) if:
- ✅ You have **many provider-specific fields** (NPI, Tax ID, etc.)
- ✅ Providers need a **separate workflow** from regular users
- ✅ You plan to add **more provider features** in the future
- ✅ You want **clean separation** of concerns
- ✅ Your current system already works for regular users

### Choose **Amend Existing** if:
- ✅ Providers are **just users with extra permissions**
- ✅ You want **one unified user system**
- ✅ Provider data is **minimal** (just a few extra fields)
- ✅ You prefer **simplicity** over future scalability
- ✅ You want to **reuse existing auth flows**

---

## 🚀 Setup Instructions

### For New Tables (Recommended):

1. **Run the schema**:
   ```bash
   # In Supabase SQL Editor
   # Copy and paste contents of provider_accounts_schema.sql
   # Click "Run"
   ```

2. **Create Storage Bucket**:
   - Go to Storage in Supabase
   - Create bucket: `provider-documents`
   - Make it public
   - Add policies (see PROVIDER_SIGNUP_SETUP.md)

3. **Verify**:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_name IN ('provider_accounts', 'provider_documents');
   ```

### For Amending Existing Tables:

1. **Backup your database first!**
   ```sql
   -- In Supabase SQL Editor, export your profiles table
   ```

2. **Run the ALTER statements** (see Alternative Approach section above)

3. **Update your API code**:
   - Change `provider_accounts` to `profiles` in `/api/provider-signup/route.ts`
   - Store provider data in `provider_data` JSONB column
   - Set `role = 'provider'` and `status = 'pending_signature'`

4. **Update queries** to use JSONB:
   ```sql
   -- Example: Query providers
   SELECT * FROM profiles WHERE role = 'provider';

   -- Example: Query by NPI
   SELECT * FROM profiles
   WHERE role = 'provider'
   AND provider_data->>'npiNumber' = '1234567890';
   ```

---

## 📊 Current Tables in Your Database

Based on the screenshot, you currently have:

### `profiles` table:
- `id` (uuid) - Primary key
- `email` (text)
- `full_name` (text)
- `role` (text)
- `created_at` (timestamp)

### `form_submissions` table:
- Existing table for form submissions
- Not related to provider accounts

---

## 🎯 Recommendation

**Use the New Tables approach** (`provider_accounts_schema.sql`) because:

1. Your provider intake form has **20+ fields**
2. Providers need a **completely different workflow** than regular users
3. You'll likely add **more provider features** later
4. The existing `profiles` table is clean and works well for regular users
5. **The code is already implemented for this approach**

You would need to **significantly modify the API code** if you choose to amend existing tables.

---

## 🔧 Code Modifications Required for Alternative Approach

If you decide to use the "Amend Existing" approach, update `/api/provider-signup/route.ts`:

```typescript
// Change this:
const { data: insertedProvider, error: insertError } = await supabase
  .from("provider_accounts")
  .insert([providerData])
  .select()
  .single();

// To this:
const { data: insertedProvider, error: insertError } = await supabase
  .from("profiles")
  .insert([{
    email,
    full_name: `${firstName} ${lastName}`,
    role: 'provider',
    status: 'pending_signature',
    provider_data: {
      firstName,
      lastName,
      suffix,
      phone,
      // ... all other fields
    }
  }])
  .select()
  .single();
```

---

## ✅ Final Decision

**The current implementation uses the "New Tables" approach.**

To set it up:
1. Run `provider_accounts_schema.sql` in Supabase SQL Editor
2. Create `provider-documents` storage bucket
3. Test the provider signup flow

That's it! No code changes needed. 🎉
