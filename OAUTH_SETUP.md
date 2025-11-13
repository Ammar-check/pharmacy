# OAuth Setup Guide

This guide will help you configure Google, Microsoft, and Facebook OAuth providers in your Supabase project.

## Prerequisites

- A Supabase project
- Access to your Supabase dashboard
- Developer accounts for Google, Microsoft, and Facebook

---

## General Setup Steps

1. Go to your Supabase Dashboard: https://app.supabase.com/
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Enable and configure each OAuth provider

---

## 1. Google OAuth Setup

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if you haven't already:
   - User Type: External (for testing) or Internal (for organization)
   - Add your app name, user support email, and developer contact
   - Add scopes: `email`, `profile`, `openid`

### Step 2: Configure OAuth Client

1. Application type: **Web application**
2. Add **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://your-production-domain.com
   ```
3. Add **Authorized redirect URIs**:
   ```
   https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback
   ```
   Replace `[YOUR_SUPABASE_PROJECT_REF]` with your actual Supabase project reference ID

4. Click **Create** and save your:
   - Client ID
   - Client Secret

### Step 3: Configure in Supabase

1. In Supabase Dashboard, go to **Authentication** > **Providers**
2. Find **Google** and enable it
3. Enter your **Client ID** and **Client Secret**
4. Click **Save**

---

## 2. Microsoft (Azure) OAuth Setup

### Step 1: Register Application in Azure

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Enter:
   - Name: Your app name
   - Supported account types: Choose based on your needs
   - Redirect URI:
     ```
     https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback
     ```

### Step 2: Configure Application

1. After registration, note your:
   - Application (client) ID
   - Directory (tenant) ID

2. Go to **Certificates & secrets**
3. Click **New client secret**
4. Add a description and expiration period
5. Copy the **Value** (this is your Client Secret - save it immediately!)

### Step 3: Configure API Permissions

1. Go to **API permissions**
2. Click **Add a permission** > **Microsoft Graph**
3. Select **Delegated permissions**
4. Add:
   - `openid`
   - `profile`
   - `email`
5. Click **Add permissions**

### Step 4: Configure in Supabase

1. In Supabase Dashboard, go to **Authentication** > **Providers**
2. Find **Azure** and enable it
3. Enter your:
   - **Client ID**: Application (client) ID
   - **Client Secret**: The secret value you created
   - **Azure Tenant**: Your Directory (tenant) ID
4. Click **Save**

---

## 3. Facebook OAuth Setup

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** > **Create App**
3. Select **Consumer** as the app type
4. Enter your app name and contact email
5. Click **Create App**

### Step 2: Add Facebook Login Product

1. In your app dashboard, find **Facebook Login**
2. Click **Set Up**
3. Select **Web** platform
4. Enter your Site URL: `http://localhost:3000` (for development)

### Step 3: Configure OAuth Redirect

1. Go to **Facebook Login** > **Settings**
2. Add **Valid OAuth Redirect URIs**:
   ```
   https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback
   ```
3. Click **Save Changes**

### Step 4: Get App Credentials

1. Go to **Settings** > **Basic**
2. Note your:
   - **App ID**
   - **App Secret** (click Show to reveal)

### Step 5: Make App Live

1. In the top navigation, toggle your app from **Development** to **Live** mode
2. You may need to complete the App Review process for production use

### Step 6: Configure in Supabase

1. In Supabase Dashboard, go to **Authentication** > **Providers**
2. Find **Facebook** and enable it
3. Enter your:
   - **Client ID**: Your App ID
   - **Client Secret**: Your App Secret
4. Click **Save**

---

## 4. Update Your Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration (if not already present)
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_SUPABASE_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: If using service role for admin operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

## 5. Testing OAuth Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/create-account`

3. The page should now show:
   - **Login** tab selected by default
   - Three OAuth buttons:
     - Continue with Google
     - Continue with Microsoft
     - Continue with Facebook
   - Toggle to **Create account** for signup

4. Click on any OAuth provider button to test

5. After successful authentication, you should be:
   - Redirected to the home page
   - Logged in with your OAuth account
   - Profile created in the `profiles` table

---

## Important Notes

### Redirect URIs

Your Supabase OAuth callback URL format is:
```
https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback
```

You can find your project reference ID in your Supabase project settings or in the project URL.

### Development vs Production

For development:
- Use `http://localhost:3000` for local testing
- Ensure all OAuth providers have the localhost URL configured

For production:
- Update all OAuth providers with your production domain
- Ensure HTTPS is enabled
- Update authorized redirect URIs in all provider consoles

### Privacy and Compliance

- Review each provider's terms of service
- Ensure your privacy policy covers OAuth data collection
- Complete necessary app review processes (especially for Facebook)
- Configure OAuth consent screens appropriately

---

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Verify the redirect URI matches exactly in both Supabase and the OAuth provider
   - Ensure there are no trailing slashes
   - Check for http vs https mismatches

2. **"Unauthorized client"**
   - Verify Client ID and Client Secret are correct
   - Ensure the OAuth app is in "Live" or "Production" mode
   - Check that required scopes/permissions are configured

3. **"User profile not created"**
   - Check that the `profiles` table exists in Supabase
   - Verify the table has columns: `id`, `email`, `full_name`, `role`
   - Check Supabase logs for any database errors

4. **OAuth button doesn't work**
   - Open browser console to check for errors
   - Verify Supabase client is initialized correctly
   - Check that the OAuth provider is enabled in Supabase dashboard

---

## Security Considerations

1. **Never commit secrets**: Keep Client Secrets in environment variables
2. **Use HTTPS in production**: OAuth requires secure connections
3. **Implement CSRF protection**: Consider adding state parameters
4. **Review permissions**: Only request necessary OAuth scopes
5. **Monitor usage**: Check Supabase auth logs regularly

---

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)

---

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Review browser console for client-side errors
3. Verify all redirect URIs are correctly configured
4. Ensure OAuth apps are in production/live mode
