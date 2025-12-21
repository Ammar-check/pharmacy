-- ========================================
-- DOCUSEAL INTEGRATION SCHEMA UPDATES
-- ========================================
-- Add DocuSeal-related columns to provider_accounts table
-- for tracking e-signature submission lifecycle

-- Add DocuSeal submission tracking columns
ALTER TABLE provider_accounts ADD COLUMN IF NOT EXISTS docuseal_submission_id VARCHAR(255);
ALTER TABLE provider_accounts ADD COLUMN IF NOT EXISTS docuseal_submitter_uuid VARCHAR(255);
ALTER TABLE provider_accounts ADD COLUMN IF NOT EXISTS docuseal_submitter_slug VARCHAR(255);
ALTER TABLE provider_accounts ADD COLUMN IF NOT EXISTS docuseal_signature_url TEXT;
ALTER TABLE provider_accounts ADD COLUMN IF NOT EXISTS docuseal_signed_document_url TEXT;
ALTER TABLE provider_accounts ADD COLUMN IF NOT EXISTS docuseal_audit_log_url TEXT;

-- Add timestamp columns for signature lifecycle tracking
ALTER TABLE provider_accounts ADD COLUMN IF NOT EXISTS signature_opened_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE provider_accounts ADD COLUMN IF NOT EXISTS signature_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE provider_accounts ADD COLUMN IF NOT EXISTS signature_declined_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE provider_accounts ADD COLUMN IF NOT EXISTS signature_expired_at TIMESTAMP WITH TIME ZONE;

-- Add index for DocuSeal submission lookups
CREATE INDEX IF NOT EXISTS idx_provider_accounts_docuseal_submission 
ON provider_accounts(docuseal_submission_id);

CREATE INDEX IF NOT EXISTS idx_provider_accounts_docuseal_uuid 
ON provider_accounts(docuseal_submitter_uuid);

-- Add comments for documentation
COMMENT ON COLUMN provider_accounts.docuseal_submission_id IS 'DocuSeal submission ID for tracking signature request';
COMMENT ON COLUMN provider_accounts.docuseal_submitter_uuid IS 'DocuSeal submitter UUID for identification';
COMMENT ON COLUMN provider_accounts.docuseal_submitter_slug IS 'DocuSeal submitter slug used in signature URL';
COMMENT ON COLUMN provider_accounts.docuseal_signature_url IS 'Direct URL to DocuSeal signature form';
COMMENT ON COLUMN provider_accounts.docuseal_signed_document_url IS 'URL to the completed signed document';
COMMENT ON COLUMN provider_accounts.docuseal_audit_log_url IS 'URL to DocuSeal audit log for compliance';
COMMENT ON COLUMN provider_accounts.signature_opened_at IS 'Timestamp when provider opened the signature link';
COMMENT ON COLUMN provider_accounts.signature_completed_at IS 'Timestamp when provider completed signing';
COMMENT ON COLUMN provider_accounts.signature_declined_at IS 'Timestamp when provider declined to sign';
COMMENT ON COLUMN provider_accounts.signature_expired_at IS 'Timestamp when signature request expired';

-- Update status column comment to include new DocuSeal states
COMMENT ON COLUMN provider_accounts.status IS 'Account status: pending_signature (initial), signature_sent (DocuSeal submission created), signature_opened (link opened), signature_received (completed), signature_declined, signature_expired, approved, rejected, suspended';
