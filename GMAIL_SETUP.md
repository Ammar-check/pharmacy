# Gmail SMTP Email Setup Guide

Your pharmacy website now uses **Gmail SMTP** to send emails - no third-party service required!

## Quick Setup (5 minutes)

### Step 1: Get Your Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** (left sidebar)
3. Under "How you sign in to Google", click **2-Step Verification**
   - If not enabled, you must enable it first
4. Scroll down and click **App passwords**
5. In the "App name" field, type: `Pharmacy Website`
6. Click **Create**
7. Google will show you a **16-character password** - copy this!

### Step 2: Update Your .env.local File

Open `.env.local` and update these lines:

```env
SMTP_EMAIL=your-actual-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
```

**Example:**
```env
SMTP_EMAIL=hamzakamran843@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
```

### Step 3: Test It!

```bash
npm run dev
```

Now when a user submits a form:
- ✅ User receives a confirmation email with their form data
- ✅ You (moderator) receive a notification at `hamzakamran843@gmail.com`

## Important Notes

⚠️ **DO NOT use your regular Gmail password** - Always use the App Password!

⚠️ **Never commit .env.local to git** - It's already in .gitignore

✅ **It's completely FREE** - No signup, no payment, no third-party service

## Using Other Email Providers

Want to use Outlook, Yahoo, or another provider instead of Gmail?

Update your `.env.local`:

```env
# For Outlook
SMTP_SERVICE=Outlook
SMTP_EMAIL=your-email@outlook.com
SMTP_PASSWORD=your-outlook-app-password

# For Yahoo
SMTP_SERVICE=Yahoo
SMTP_EMAIL=your-email@yahoo.com
SMTP_PASSWORD=your-yahoo-app-password

# For custom SMTP server
SMTP_SERVICE=custom
SMTP_HOST=smtp.yourserver.com
SMTP_PORT=587
SMTP_EMAIL=your-email@domain.com
SMTP_PASSWORD=your-password
```

## How It Works

When a user fills out a form:

1. Form is submitted to your API
2. Data is saved to Supabase database
3. Two emails are sent:
   - **To User**: Beautiful HTML email with their form responses
   - **To Moderator**: Detailed notification with all submission info

## Troubleshooting

**Error: "Invalid login"**
- Make sure you're using the App Password, not your regular Gmail password
- Check that 2-Step Verification is enabled on your Google account

**Emails not sending**
- Check that `SMTP_EMAIL` and `SMTP_PASSWORD` are set in `.env.local`
- Verify the App Password is correct (no spaces, 16 characters)
- Check the terminal for error messages

**Want to change moderator email?**
- Update `MODERATOR_EMAIL` in `.env.local`
