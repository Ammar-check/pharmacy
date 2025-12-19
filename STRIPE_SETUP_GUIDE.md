# 💳 Stripe Payment Gateway Setup Guide

## Overview
Your e-commerce system now has full Stripe payment integration! This guide will walk you through the manual setup steps.

---

## 🚀 Quick Start Checklist

- [ ] Install Stripe package
- [ ] Create Stripe account
- [ ] Get API keys
- [ ] Add environment variables
- [ ] Set up webhook endpoint
- [ ] Test with test cards
- [ ] Go live with real keys

---

## 📦 Step 1: Install Stripe Package

Run this command in your project root:

```bash
npm install stripe
```

Or if using yarn:

```bash
yarn add stripe
```

---

## 🔑 Step 2: Create Stripe Account & Get API Keys

### 2.1 Create Account
1. Go to https://stripe.com
2. Click "Sign up"
3. Complete registration
4. Verify your email

### 2.2 Get Test API Keys
1. Login to Stripe Dashboard: https://dashboard.stripe.com
2. Click "Developers" in left sidebar
3. Click "API keys"
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)
5. Click "Reveal test key" for the Secret key
6. **Copy both keys** - you'll need them next

---

## 🔐 Step 3: Add Environment Variables

Add these to your `.env.local` file (create if it doesn't exist):

```bash
# Stripe Keys (TEST MODE)
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Your site URL (for redirects)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Important:**
- Replace `YOUR_KEY_HERE` with actual keys from Step 2.2
- For `STRIPE_WEBHOOK_SECRET`, see Step 4
- For production, use `pk_live_` and `sk_live_` keys

---

## 🔔 Step 4: Set Up Webhook Endpoint

Webhooks notify your app when payments complete.

### 4.1 Local Development (Testing)


**Option A: Using Stripe CLI (Recommended)**

1. Install Stripe CLI:
   - Windows: Download from https://github.com/stripe/stripe-cli/releases
   - Mac: `brew install stripe/stripe-cli/stripe`
   - Linux: See https://stripe.com/docs/stripe-cli

2. Login to Stripe CLI:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. You'll get a webhook signing secret (starts with `whsec_`)
5. Copy it and add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

**Option B: Using Ngrok (Alternative)**

1. Install ngrok: https://ngrok.com/download
2. Start your Next.js dev server: `npm run dev`
3. In another terminal, run: `ngrok http 3000`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Go to Stripe Dashboard → Developers → Webhooks → "Add endpoint"
6. Enter: `https://abc123.ngrok.io/api/stripe/webhook`
7. Select events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
8. Click "Add endpoint"
9. Click "Reveal" on Signing secret and copy to `.env.local`

### 4.2 Production Deployment

After deploying to production (Vercel, etc.):

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter your production URL: `https://yourdomain.com/api/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click "Add endpoint"
6. Copy the "Signing secret" and add to your production environment variables

---

## 🧪 Step 5: Test the Payment Flow

### 5.1 Start Your Development Server

```bash
npm run dev
```

### 5.2 Test Checkout

1. Go to http://localhost:3000/products
2. Add a product to cart
3. Go to cart → Proceed to Checkout
4. Fill in shipping information
5. Click "Place Order"
6. You'll be redirected to Stripe Checkout

### 5.3 Use Test Cards

Stripe provides test cards for different scenarios:

| Card Number | Scenario |
|------------|----------|
| `4242 4242 4242 4242` | Success |
| `4000 0025 0000 3155` | Requires 3D Secure authentication |
| `4000 0000 0000 9995` | Declined (insufficient funds) |
| `4000 0000 0000 0069` | Expired card |

**Use these details:**
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

### 5.4 Complete Test Payment

1. Enter test card: `4242 4242 4242 4242`
2. Enter any future expiry and CVC
3. Click "Pay"
4. You should be redirected to `/payment-success`
5. Order status should be "Processing"
6. Cart should be empty

---

## ✅ Step 6: Verify Everything Works

### Check Database
1. Go to Supabase Dashboard → Table Editor
2. Open `orders` table
3. Find your test order
4. Verify:
   - `payment_status` = "paid"
   - `order_status` = "processing"
   - `paid_at` has a timestamp

### Check Stripe Dashboard
1. Go to Stripe Dashboard → Payments
2. You should see your test payment
3. Check webhook events (Developers → Events)

---

## 🌐 Step 7: Go Live (Production)

When ready for real payments:

### 7.1 Activate Stripe Account
1. Go to Stripe Dashboard
2. Click "Activate your account"
3. Complete business verification
4. Add bank account details

### 7.2 Switch to Live Keys
1. In Stripe Dashboard, toggle from "Test mode" to "Live mode"
2. Go to Developers → API keys
3. Get your live keys:
   - `pk_live_...` (Publishable key)
   - `sk_live_...` (Secret key)

### 7.3 Update Environment Variables
In your production environment (e.g., Vercel):

```bash
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 7.4 Set Up Live Webhook
1. Stripe Dashboard (Live mode) → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select same events as before
4. Copy signing secret to production env vars

---

## 📂 Files Created/Modified

### New Files
- `app/api/stripe/create-checkout-session/route.ts` - Creates Stripe session
- `app/api/stripe/webhook/route.ts` - Handles payment events
- `app/payment-success/page.tsx` - Success page
- `components/payment-success-client.tsx` - Success UI

### Modified Files
- `components/checkout-client.tsx` - Now redirects to Stripe

---

## 🔍 How It Works

### Payment Flow

1. **Customer clicks "Place Order"**
   - Frontend calls `/api/stripe/create-checkout-session`
   - Backend creates order in database (status: pending)
   - Backend creates Stripe Checkout Session
   - Customer redirected to Stripe-hosted checkout page

2. **Customer enters card details**
   - Stripe securely processes payment
   - Stripe validates card
   - Payment succeeds or fails

3. **Stripe sends webhook**
   - Webhook hits `/api/stripe/webhook`
   - Verified with webhook secret
   - Order updated: payment_status = "paid", order_status = "processing"
   - Customer's cart cleared

4. **Customer redirected back**
   - Returns to `/payment-success?order_id=xxx`
   - Shows order confirmation
   - Order is complete!

---

## 🛠️ Troubleshooting

### "Unauthorized" Error
- Check if admin is logged in
- Verify `admin_gate` cookie exists

### "Service role not configured"
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is in `.env.local`

### Webhook Not Receiving Events
- Check Stripe CLI is running (`stripe listen...`)
- Verify webhook URL is correct
- Check webhook secret in `.env.local`
- Look at Stripe Dashboard → Developers → Events → Failed attempts

### Payment Succeeds But Order Not Updated
- Check webhook endpoint logs
- Verify webhook secret matches
- Check Supabase service role has permissions
- Look for errors in Stripe Dashboard → Events

### Redirect After Payment Fails
- Check `NEXT_PUBLIC_BASE_URL` in `.env.local`
- Make sure it matches your actual URL
- For localhost: `http://localhost:3000` (no trailing slash)

---

## 💰 Pricing

Stripe charges:
- **2.9% + $0.30** per successful card transaction (US)
- No monthly fees, setup fees, or hidden costs
- Only pay when you get paid

---

## 🔒 Security Features

Your implementation includes:
- ✅ **PCI Compliance**: Card details never touch your server
- ✅ **Webhook Verification**: Signatures prevent fake events
- ✅ **Server-side Processing**: API keys never exposed to frontend
- ✅ **Order Verification**: Double-checks order ownership
- ✅ **Idempotency**: Prevents duplicate charges

---

## 📧 Next Steps

### Recommended Enhancements

1. **Email Notifications**
   - Send order confirmation emails
   - Send payment receipts
   - Notify on shipping

2. **Order Management Dashboard**
   - Admin view of all orders
   - Update order status (shipped, delivered)
   - Add tracking numbers

3. **Customer Order History**
   - Let users view past orders
   - Reorder previous purchases
   - Download invoices

4. **Shipping Integration**
   - Integrate with USPS, FedEx, UPS
   - Real-time shipping rates
   - Print shipping labels

---

## 📞 Support

### Stripe Support
- Documentation: https://stripe.com/docs
- Support: https://support.stripe.com

### Issues?
If you encounter issues:
1. Check browser console for errors
2. Check terminal logs
3. Check Stripe Dashboard → Events → Failed events
4. Check Supabase logs

---

## ✅ Final Checklist

Before going live:

- [ ] Stripe package installed
- [ ] Test keys working in development
- [ ] Webhook receiving events locally
- [ ] Test payments completing successfully
- [ ] Orders updating in database
- [ ] Cart clearing after payment
- [ ] Payment success page showing
- [ ] Live keys added to production
- [ ] Live webhook endpoint configured
- [ ] Business verified on Stripe
- [ ] Test a live payment (small amount)
- [ ] All working? Go live! 🚀

---

**You're all set!** Your e-commerce platform now has professional payment processing. 🎉
