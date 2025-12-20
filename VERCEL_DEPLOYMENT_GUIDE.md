# Vercel Deployment Guide

This guide will help you deploy your pharmacy application to Vercel.

## Prerequisites

- A Vercel account (sign up at https://vercel.com)
- Your GitHub repository pushed with latest changes
- All environment variables from `.env.local`

## Step 1: Push Your Code to GitHub

Make sure all your latest changes are committed and pushed:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Step 2: Import Project to Vercel

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select your GitHub repository
4. Click **Import**

## Step 3: Configure Environment Variables

**CRITICAL**: You must add all environment variables from your `.env.local` file to Vercel.

In the Vercel project settings:

1. Click **Environment Variables** tab
2. Add each variable one by one:

### Required Environment Variables

Copy these from your `.env.local` file:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ndtmojatnuxjmogkazrd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Email Configuration
SMTP_SERVICE=Gmail
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
MODERATOR_EMAIL=your-email@gmail.com

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### How to Add Each Variable:

1. Click **Add New**
2. Enter **Key** (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
3. Enter **Value** (copy from your `.env.local`)
4. Select **All** environments (Production, Preview, Development)
5. Click **Save**

**Repeat for all variables above!**

## Step 4: Deploy

1. After adding all environment variables, click **Deploy**
2. Wait for the build to complete (3-5 minutes)
3. Once deployed, click **Visit** to see your live site

## Step 5: Configure Custom Domain (Optional)

1. Go to your project **Settings**
2. Click **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions

## Step 6: Update Supabase Redirect URLs

After deployment, update your Supabase settings:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to **Redirect URLs**:
   - `https://your-domain.vercel.app/auth/callback`
   - `https://your-domain.vercel.app/**` (wildcard for all routes)

## Step 7: Update Stripe Webhook

If using Stripe webhooks in production:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Create new webhook endpoint
3. URL: `https://your-domain.vercel.app/api/stripe/webhook`
4. Select events to listen for
5. Copy the webhook secret
6. Update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables

## Common Deployment Issues

### Build Fails with "Environment Variable Not Set"

**Solution**: Make sure ALL environment variables are added to Vercel:
- Go to Project Settings → Environment Variables
- Add missing variables
- Redeploy

### Supabase Connection Fails

**Solution**:
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check they're set for ALL environments
- Redeploy after adding

### Stripe Payments Don't Work

**Solution**:
- Verify `STRIPE_SECRET_KEY` is set correctly
- Make sure you're using the correct key (test vs live)
- Check webhook endpoint is configured

### Images Don't Load

**Solution**:
- Make sure Supabase Storage bucket is public
- Verify CORS settings in Supabase Storage
- Check image URLs are using HTTPS

### Email Sending Fails

**Solution**:
- Verify `SMTP_EMAIL` and `SMTP_PASSWORD` are correct
- For Gmail, use App Password, not regular password
- Check `SMTP_SERVICE` is set to "Gmail"

## Environment Variables Checklist

Before deploying, ensure you have:

- [ ] `NEXT_PUBLIC_SITE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `SMTP_SERVICE`
- [ ] `SMTP_EMAIL`
- [ ] `SMTP_PASSWORD`
- [ ] `MODERATOR_EMAIL`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`

## Vercel CLI Deployment (Alternative)

You can also deploy using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Set environment variables via CLI
vercel env add NEXT_PUBLIC_SITE_URL
vercel env add STRIPE_SECRET_KEY
# ... etc for all variables
```

## Automatic Deployments

Once connected to GitHub, Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you create a pull request

To disable automatic deployments:
1. Go to Project Settings → Git
2. Toggle off **Production Branch** or **Preview Deployments**

## Monitoring Your Deployment

### View Logs

1. Go to your project dashboard
2. Click **Deployments**
3. Click on a deployment
4. Click **View Function Logs**

### Check Analytics

1. Go to **Analytics** tab
2. View page views, performance, and errors

### Performance Monitoring

Vercel provides built-in:
- Core Web Vitals
- Response times
- Error tracking

## Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Supabase redirect URLs updated
- [ ] Stripe webhook configured (if using)
- [ ] Custom domain configured (if using)
- [ ] SSL/HTTPS enabled (automatic on Vercel)
- [ ] Test all features on production URL
- [ ] Email sending works
- [ ] Payments work
- [ ] File uploads work (Supabase Storage)
- [ ] Authentication works
- [ ] Admin panel accessible

## Rollback a Deployment

If something goes wrong:

1. Go to **Deployments**
2. Find a previous working deployment
3. Click **•••** menu
4. Click **Promote to Production**

## Cost & Limits

### Vercel Free Tier Includes:
- Unlimited deployments
- 100 GB bandwidth per month
- Serverless function execution: 100 GB-hours
- Edge function execution: 500k requests

### Upgrading:
If you exceed limits, upgrade to Pro plan ($20/month):
- 1 TB bandwidth
- Unlimited serverless functions
- Priority support

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Support](https://vercel.com/support)

## Next Steps After Deployment

1. **Monitor for errors** in the first 24 hours
2. **Test all user flows** on production
3. **Set up error tracking** (e.g., Sentry)
4. **Configure backups** for Supabase database
5. **Set up monitoring** alerts

## Troubleshooting

### "This Function Has Exceeded the Maximum Runtime"

**Solution**: Optimize long-running API routes or upgrade Vercel plan

### "Build Exceeded Maximum Duration"

**Solution**:
- Remove unused dependencies
- Optimize build process
- Contact Vercel support for limit increase

### Environment Variables Not Working

**Solution**:
- Make sure variables are set for correct environment
- Rebuild/redeploy after adding variables
- Check variable names match exactly (case-sensitive)

Good luck with your deployment! 🚀
