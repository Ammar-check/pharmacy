-- ========================================
-- PROVIDER ACCOUNTS SCHEMA
-- ========================================
-- This schema creates tables to handle provider signup and document management
-- for the Alpha BioMed pharmacy platform.

-- Drop existing tables if they exist (use with caution in production)
-- DROP TABLE IF EXISTS provider_documents CASCADE;
-- DROP TABLE IF EXISTS provider_accounts CASCADE;

-- ========================================sc
-- 1. PROVIDER ACCOUNTS TABLE
-- ========================================
-- Stores all provider account information including contact, business, and verification data

CREATE TABLE IF NOT EXISTS provider_accounts (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Contact Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    suffix VARCHAR(20),  -- e.g., MD, DO, NP, PA, etc.
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,  -- US-based mobile number

    -- Business Profile
    company_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100) DEFAULT 'Provider',  -- Provider, Clinic, Practice, etc.
    website VARCHAR(255) NOT NULL,
    tax_id_ein VARCHAR(50) NOT NULL,  -- Tax ID / EIN
    npi_number VARCHAR(20) NOT NULL,  -- National Provider Identifier
    npi_owner_matches BOOLEAN NOT NULL,  -- Does the owner of NPI match the contact?

    -- Reseller's License Information
    has_resellers_license VARCHAR(20) NOT NULL,  -- 'yes', 'no', 'not_sure'
    resellers_permit_number VARCHAR(100),
    resellers_certificate_url TEXT,  -- URL to uploaded certificate (Supabase Storage)

    -- Business Address
    address_line1 VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,

    -- Verification & Referral
    business_license_url TEXT,  -- URL to uploaded business/professional license (Supabase Storage)
    referred_by VARCHAR(255),  -- Name or code of referrer
    additional_notes TEXT,  -- Any additional comments from the provider

    -- Account Status
    status VARCHAR(50) DEFAULT 'pending_signature',
    -- Possible values: 'pending_signature', 'signature_sent', 'signature_received', 'approved', 'rejected', 'suspended'

    -- Marketing Consent
    marketing_consent BOOLEAN DEFAULT true,  -- Consent for email/SMS notifications

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    signature_sent_at TIMESTAMP WITH TIME ZONE,
    signature_received_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    form_data JSONB,  -- Store complete form data as backup in JSON format
    ip_address INET,  -- IP address of submission for security tracking
    user_agent TEXT  -- Browser/device info for security tracking
);

-- ========================================
-- 2. PROVIDER DOCUMENTS TABLE
-- ========================================
-- Stores references to all documents uploaded by providers
-- This allows multiple documents per provider and better document management

CREATE TABLE IF NOT EXISTS provider_documents (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign key to provider_accounts
    provider_id UUID NOT NULL REFERENCES provider_accounts(id) ON DELETE CASCADE,

    -- Document Information
    document_type VARCHAR(100) NOT NULL,
    -- e.g., 'resellers_certificate', 'business_license', 'professional_license', 'signature_form'

    document_name VARCHAR(255) NOT NULL,  -- Original filename
    document_url TEXT NOT NULL,  -- URL to the document in storage
    file_size INTEGER,  -- File size in bytes
    mime_type VARCHAR(100),  -- e.g., 'application/pdf', 'image/jpeg'

    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID,  -- Admin user who verified the document
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,

    -- Timestamps
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Metadata
    metadata JSONB  -- Additional document metadata
);

-- ========================================
-- 3. INDEXES FOR PERFORMANCE
-- ========================================

-- Index on email for quick lookups during signup/login
CREATE INDEX IF NOT EXISTS idx_provider_accounts_email ON provider_accounts(email);

-- Index on status for filtering providers by status
CREATE INDEX IF NOT EXISTS idx_provider_accounts_status ON provider_accounts(status);

-- Index on created_at for chronological queries
CREATE INDEX IF NOT EXISTS idx_provider_accounts_created_at ON provider_accounts(created_at DESC);

-- Index on NPI number for verification
CREATE INDEX IF NOT EXISTS idx_provider_accounts_npi ON provider_accounts(npi_number);

-- Index on provider_id in documents table for quick document lookups
CREATE INDEX IF NOT EXISTS idx_provider_documents_provider_id ON provider_documents(provider_id);

-- Index on document_type for filtering by document type
CREATE INDEX IF NOT EXISTS idx_provider_documents_type ON provider_documents(document_type);

-- ========================================
-- 4. TRIGGERS
-- ========================================

-- Trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_provider_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_provider_accounts_updated_at
    BEFORE UPDATE ON provider_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_accounts_updated_at();

-- ========================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================
-- Enable RLS on both tables for security

ALTER TABLE provider_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Providers can view their own account
CREATE POLICY "Providers can view own account"
    ON provider_accounts FOR SELECT
    USING (email = auth.jwt() ->> 'email');

-- Policy: Providers can insert their own account (during signup)
CREATE POLICY "Providers can create own account"
    ON provider_accounts FOR INSERT
    WITH CHECK (true);  -- Anyone can signup

-- Policy: Providers can update their own account (before approval)
CREATE POLICY "Providers can update own account"
    ON provider_accounts FOR UPDATE
    USING (email = auth.jwt() ->> 'email' AND status IN ('pending_signature', 'signature_sent'));

-- Policy: Admins can view all provider accounts
-- Note: This requires an 'admin' role in the profiles table
CREATE POLICY "Admins can view all provider accounts"
    ON provider_accounts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Policy: Admins can update all provider accounts
CREATE POLICY "Admins can update all provider accounts"
    ON provider_accounts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Policy: Providers can view their own documents
CREATE POLICY "Providers can view own documents"
    ON provider_documents FOR SELECT
    USING (
        provider_id IN (
            SELECT id FROM provider_accounts
            WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Policy: Providers can upload their own documents
CREATE POLICY "Providers can upload own documents"
    ON provider_documents FOR INSERT
    WITH CHECK (
        provider_id IN (
            SELECT id FROM provider_accounts
            WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Policy: Admins can view all documents
CREATE POLICY "Admins can view all documents"
    ON provider_documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ========================================
-- 6. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE provider_accounts IS 'Stores provider account information for Alpha BioMed pharmacy platform';
COMMENT ON TABLE provider_documents IS 'Stores references to documents uploaded by providers';

COMMENT ON COLUMN provider_accounts.status IS 'Account status: pending_signature, signature_sent, signature_received, approved, rejected, suspended';
COMMENT ON COLUMN provider_accounts.npi_owner_matches IS 'Indicates if the NPI owner matches the account contact person';
COMMENT ON COLUMN provider_accounts.has_resellers_license IS 'Provider''s reseller license status: yes, no, or not_sure';
COMMENT ON COLUMN provider_accounts.marketing_consent IS 'User consent for receiving marketing communications';
COMMENT ON COLUMN provider_accounts.form_data IS 'Complete form submission data stored as JSON for backup/audit purposes';

-- ========================================
-- 7. SAMPLE QUERIES (FOR REFERENCE)
-- ========================================

-- Query to get all pending provider accounts:
-- SELECT * FROM provider_accounts WHERE status = 'pending_signature' ORDER BY created_at DESC;

-- Query to get a provider with all their documents:
-- SELECT p.*, json_agg(d.*) as documents
-- FROM provider_accounts p
-- LEFT JOIN provider_documents d ON d.provider_id = p.id
-- WHERE p.email = 'provider@example.com'
-- GROUP BY p.id;

-- Query to get provider statistics by status:
-- SELECT status, COUNT(*) as count
-- FROM provider_accounts
-- GROUP BY status
-- ORDER BY count DESC;

-- ========================================
-- END OF SCHEMA
-- ========================================
