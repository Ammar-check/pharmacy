# DocuSeal E-Signature Integration - Setup Guide

## Overview

This guide will help you set up DocuSeal e-signature automation for the MedConnect provider signup flow. DocuSeal replaces the manual PDF signature process with automated electronic signatures.

## Prerequisites

- DocuSeal account (cloud or self-hosted)
- Provider agreement PDF template
- Publicly accessible webhook URL (for production)

## Step 1: DocuSeal Account Setup

### Option A: Cloud (Recommended)
1. Sign up at [docuseal.com](https://docuseal.com)
2. Verify your email address
3. Complete account setup

### Option B: Self-Hosted
Follow the [DocuSeal self-hosting guide](https://github.com/docusealco/docuseal)

## Step 2: Upload Provider Agreement Template

1. Log into your DocuSeal dashboard
2. Navigate to **Templates** section
3. Click "**New Template**" or "**Upload Template**"
4. Upload your `MedConnect_Provider_Terms_Form.pdf`
5. Configure signature fields:
   - Add signature field where provider should sign
   - Add date field
   - Add optional text fields for provider name, company, etc.
6. Save the template
7. **Copy the Template Slug** (e.g., `EnSzXPh7cGgjQC`)

## Step 3: Generate API Key

1. In DocuSeal dashboard, go to **Settings** → **API**
2. Click "**Generate API Key**"
3. **Copy the API key** (starts with random characters)
4. Save it securely - you won't be able to see it again

## Step 4: Configure Webhook

1. In DocuSeal dashboard, go to **Settings** → **Webhooks**
2. Click "**Add Webhook**"
3. Configure:
   - **URL**: `https://your-app-url.vercel.app/api/webhooks/docuseal`
   - **Secret**: Copy from `DOCUSEAL_ENV_VARS.txt` file
   - **Events**: Select all submission events:
     - `submission.created`
     - `submission.completed`
     - `submission.expired`
     - `submission.archived`
4. Save webhook configuration

### Local Development Webhook Setup

For local testing, you'll need to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose local port 3000
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Use: https://abc123.ngrok.io/api/webhooks/docuseal as webhook URL
```

## Step 5: Configure Environment Variables

Open your `.env.local` file and add the DocuSeal configuration:

```bash
# DocuSeal Configuration
DOCUSEAL_API_KEY=your_actual_api_key_here
DOCUSEAL_API_URL=https://api.docuseal.com
DOCUSEAL_TEMPLATE_SLUG=your_template_slug_here
DOCUSEAL_WEBHOOK_SECRET=whs_MedConnect2024_9k3JmN7pQr5sXvL2wY8tZb4nFg6hCd1aE0iUoP
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change for production
```

**Important**: 
- Replace `your_actual_api_key_here` with your DocuSeal API key
- Replace `your_template_slug_here` with your template slug
- For production, update `NEXT_PUBLIC_APP_URL` to your Vercel URL

## Step 6: Run Database Migration

Execute the DocuSeal database migration to add required columns:

```sql
-- Connect to your Supabase database
-- Run the migration script:
\i database/add_docuseal_fields.sql
```

Or via Supabase Dashboard:
1. Go to **SQL Editor**
2. Copy contents of `database/add_docuseal_fields.sql`
3. Execute the script

## Step 7: Test the Integration

### 7.1 Test Signup Flow

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/provider-signup`
3. Fill out the complete provider application form
4. Submit the form
5. **Verify**:
   - No errors in browser console
   - Provider account created in database
   - `docuseal_submission_id` populated
   - `status` is `signature_sent`

### 7.2 Test Email Reception

1. Check the email inbox used in signup
2. **Verify**:
   - Email received from DocuSeal
   - Email contains "Sign Document" link
   - Link opens DocuSeal signing interface

### 7.3 Test Signature Completion

1. Click the signature link from email
2. Complete the signature in DocuSeal
3. **Verify**:
   - Redirected to completion page
   - Check database: `status` updated to `signature_received`
   - `signature_completed_at` timestamp set
   - `docuseal_signed_document_url` populated

### 7.4 Test Webhook

Monitor webhook reception:

```bash
# View application logs
npm run dev

# Or check Vercel logs for production
```

**Verify**:
- Webhook received with `submission.completed` event
- Database updated correctly
- No errors in webhook processing

## Step 8: Production Deployment

### 8.1 Update Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add all DocuSeal variables:
   - `DOCUSEAL_API_KEY`
   - `DOCUSEAL_API_URL`
   - `DOCUSEAL_TEMPLATE_SLUG`
   - `DOCUSEAL_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_APP_URL` (set to your production URL)

### 8.2 Update Webhook URL in DocuSeal

1. Go to DocuSeal dashboard → **Webhooks**
2. Edit the webhook
3. Update URL to: `https://your-production-url.vercel.app/api/webhooks/docuseal`
4. Save changes

### 8.3 Deploy to Vercel

```bash
git add .
git commit -m "Add DocuSeal e-signature integration"
git push origin main
```

Vercel will automatically deploy your updates.

### 8.4 Production Testing

1. Complete one test provider signup in production
2. Verify email delivery
3. Complete signature
4. Check database updates
5. Monitor Vercel logs for any errors

## Troubleshooting

### Issue: No email received from DocuSeal

**Solution**:
- Check spam/junk folder
- Verify email address in provider signup
- Check DocuSeal dashboard for submission status
- Ensure `send_email: true` in submission creation

### Issue: Webhook not received

**Solution**:
- Verify webhook URL is publicly accessible
- Check webhook secret matches `.env.local`
- Test webhook URL with a tool like Postman
- Review Vercel logs for webhook errors
- Ensure DocuSeal webhook events are enabled

### Issue: Database not updating

**Solution**:
- Verify database migration was executed
- Check Supabase RLS policies allow service role updates
- Review webhook handler logs for errors
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set

### Issue: Signature link not working

**Solution**:
- Verify `docuseal_signature_url` is populated in database
- Check template slug is correct
- Ensure template is active in DocuSeal
- Verify API key has correct permissions

## Security Considerations

1. **API Key**: Never commit API keys to version control
2. **Webhook Secret**: Use strong, random secrets
3. **Webhook Validation**: Always validate webhook signatures
4. **HTTPS Only**: Use HTTPS for all webhook endpoints
5. **Rate Limiting**: Implement rate limiting on webhook endpoint

## Support

If you encounter issues:
- Check [DocuSeal Documentation](https://www.docuseal.com/docs)
- Review application logs
- Contact DocuSeal support for API issues
- Check MedConnect internal documentation

## Quick Reference

### Important URLs
- **DocuSeal Dashboard**: https://docuseal.com
- **API Documentation**: https://www.docuseal.com/docs/api
- **Webhook Configuration**: DocuSeal Dashboard → Settings → Webhooks

### Environment Variables
```bash
DOCUSEAL_API_KEY=<your-key>
DOCUSEAL_API_URL=https://api.docuseal.com
DOCUSEAL_TEMPLATE_SLUG=<your-slug>
DOCUSEAL_WEBHOOK_SECRET=whs_MedConnect2024_9k3JmN7pQr5sXvL2wY8tZb4nFg6hCd1aE0iUoP
NEXT_PUBLIC_APP_URL=<your-url>
```

### Key Files
- DocuSeal Service: `lib/docuseal.ts`
- Webhook Handler: `app/api/webhooks/docuseal/route.ts`
- Provider Signup: `app/api/provider-signup/route.ts`
- Database Migration: `database/add_docuseal_fields.sql`
