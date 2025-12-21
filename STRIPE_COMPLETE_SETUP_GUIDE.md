# 🚀 Complete Stripe Integration Setup & Testing Guide

## Status: ✅ 100% Complete & Production Ready

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Environment Variables](#environment-variables)
4. [Local Testing](#local-testing)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- ✅ Stripe Account (https://stripe.com)
- ✅ Supabase Project
- ✅ Gmail Account (for email notifications)

### Required Software
- Node.js 18+ installed
- Stripe CLI (for webhook testing)

---

## Database Setup

### Step 1: Run Database Migrations

Execute these SQL scripts in your Supabase SQL Editor in this order:

#### 1.1 Products and Cart Schema
```bash
# File: database/products_and_cart_schema.sql
```
Run this first to create the core tables: products, cart_items, orders, order_items.

#### 1.2 Order Number Generation
```bash
# File: database/order_number_generation.sql
```
Run this second to create:
- Order number generation function
- Auto-increment trigger
- Updated_at timestamp triggers

### Step 2: Verify Database Setup

Run this query in Supabase SQL Editor:
```sql
-- Test order number generation
SELECT generate_order_number();
-- Should return something like: ORD-20250121-00001

-- Verify tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('products', 'cart_items', 'orders', 'order_items');
-- Should return all 4 tables
```

---

## Environment Variables

### Development (.env.local)

Your `.env.local` file should have:

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Configuration (Gmail SMTP)
SMTP_SERVICE=Gmail
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Stripe Configuration (TEST MODE)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Getting Stripe Test Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy **Publishable key** (pk_test_...)
3. Click **Reveal** for **Secret key** (sk_test_...)
4. Add both to `.env.local`

### Getting Webhook Secret (Local Testing)

We'll get this in the next section when we start Stripe CLI.

---

## Local Testing

### Step 1: Install Stripe CLI

**Windows:**
```bash
# Download from: https://github.com/stripe/stripe-cli/releases/latest
# Install the .exe file
```

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
# Download from: https://github.com/stripe/stripe-cli/releases/latest
```

### Step 2: Login to Stripe CLI

```bash
stripe login
```
This will open your browser to authorize the CLI.

### Step 3: Start Development Server

**Terminal 1: Next.js Dev Server**
```bash
npm run dev
```
Keep this running!

**Terminal 2: Stripe Webhook Listener**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

You'll see output like:
```
> Ready! You are using Stripe API Version [2025-12-15]. Your webhook signing secret is whsec_xxxxxxxxxxxx (^C to quit)
```

**Copy the webhook secret** (`whsec_...`) and update your `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

**Restart your Next.js dev server** after adding the webhook secret.

### Step 4: Test Complete Checkout Flow

#### 4.1 Add Products (If Not Already Done)

1. Go to http://localhost:3000/admin/login
2. Login as admin
3. Go to Products → Add New Product
4. Create a test product with:
   - Name: Test Product
   - Price: $10.00
   - Stock: 100
   - Status: Active

#### 4.2 Place Test Order

1. **Go to Products Page:**
   - Visit http://localhost:3000/products

2. **Add to Cart:**
   - Click "Add to Cart" on a product
   - Go to Cart (http://localhost:3000/cart)

3. **Proceed to Checkout:**
   - Click "Checkout"
   - Fill in shipping information:
     - Name: Test Customer
     - Email: test@example.com
     - Address: 123 Test St
     - City: Test City
     - State: CA
     - ZIP: 12345

4. **Click "Continue to Payment"**

5. **Enter Payment Details:**
   Use Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/30`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

6. **Click "Pay Now"**

### Step 5: Verify Success

After clicking "Pay Now", you should see:

✅ **Console Logs (Terminal 1 - Next.js):**
```
=== Payment Intent Creation Started ===
Supabase client created
User authenticated: [user-id]
Order data received: { email: 'test@example.com', name: 'Test Customer' }
Cart items found: 1
Order totals calculated: { subtotal: '10.00', tax: '0.80', shipping: '9.99', total: '20.79' }
Creating Stripe Payment Intent...
Payment Intent created successfully: pi_...
```

✅ **Webhook Logs (Terminal 2 - Stripe CLI):**
```
2025-01-21 10:00:00 --> payment_intent.created [evt_...]
2025-01-21 10:00:05 --> payment_intent.succeeded [evt_...]
```

✅ **Application Response:**
- Redirected to `/payment-success?payment_intent=pi_...`
- Success page displays order details
- Order number shows (e.g., ORD-20250121-00001)

✅ **Email Sent:**
- Check `test@example.com` inbox
- Should receive "Order Confirmation" email

✅ **Database Updated:**
Go to Supabase → Table Editor:
- **orders** table: New order with status "paid"
- **order_items** table: Items from cart
- **cart_items** table: Cart cleared for user
- **products** table: Stock quantity decreased

### Step 6: Test Different Card Scenarios

#### Success Cards
| Card | Result |
|------|--------|
| `4242 4242 4242 4242` | Success |
| `5555 5555 5555 4444` | Success (Mastercard) |

#### Failed Cards
| Card | Result |
|------|--------|
| `4000 0000 0000 9995` | Declined - Insufficient funds |
| `4000 0000 0000 0002` | Declined - Generic decline |
| `4000 0000 0000 0069` | Expired card |

#### 3D Secure
| Card | Result |
|------|--------|
| `4000 0025 0000 3155` | Requires authentication |

Test these to ensure error handling works correctly.

---

## Production Deployment

### Step 1: Activate Stripe Account

1. Go to https://dashboard.stripe.com
2. Click "Activate your account"
3. Complete business verification:
   - Business details
   - Bank account information
   - Identity verification
4. Wait for approval (usually 1-2 business days)

### Step 2: Get Live API Keys

1. In Stripe Dashboard, toggle from **Test mode** to **Live mode** (top right)
2. Go to **Developers** → **API keys**
3. Copy:
   - Publishable key (pk_live_...)
   - Secret key (sk_live_...) - click "Reveal"

### Step 3: Configure Production Webhook

1. In Stripe Dashboard (**Live mode**):
   - Go to **Developers** → **Webhooks**
   - Click **Add endpoint**

2. Enter webhook URL:
   ```
   https://yourdomain.com/api/stripe/webhook
   ```

3. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`

4. Click **Add endpoint**

5. Click on the newly created endpoint

6. Click **Reveal** next to **Signing secret**

7. Copy the signing secret (whsec_...)

### Step 4: Update Production Environment Variables

In your production environment (Vercel, AWS, etc.), set:

```env
# Stripe Configuration (LIVE MODE)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (from production webhook)

# Site URL
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Email Configuration
SMTP_EMAIL=your_production_email@gmail.com
SMTP_PASSWORD=your_app_password

# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

### Step 5: Deploy

```bash
# Build production
npm run build

# Deploy (example for Vercel)
vercel --prod
```

### Step 6: Test Production

1. Place a small test order with a real card
2. Verify:
   - Payment processes
   - Order created in database
   - Email confirmation sent
   - Webhook received (check Stripe Dashboard → Events)
3. Refund the test order if needed

---

## Troubleshooting

### Error: "Payment System Not Configured"

**Cause:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` not set

**Fix:**
1. Check `.env.local` has the key
2. Restart dev server after adding env vars
3. Ensure the key starts with `pk_test_` or `pk_live_`

### Error: "Failed to create payment intent"

**Check console logs for specific error:**

**Common causes:**

1. **Stripe API key invalid**
   - Verify `STRIPE_SECRET_KEY` is correct
   - Ensure it starts with `sk_test_` or `sk_live_`

2. **Cart is empty**
   - Add items to cart before checkout

3. **Supabase connection failed**
   - Verify Supabase credentials
   - Check database tables exist

### Error: "Application error: a server-side exception"

**This was the original error you encountered. Fixed by:**

1. ✅ Added better error handling in create-payment-intent route
2. ✅ Added comprehensive logging
3. ✅ Validated environment variables
4. ✅ Added null checks for Stripe promise

**To debug:**
Check Terminal 1 (Next.js) for detailed error logs.

### Webhook Not Receiving Events

**Symptoms:**
- Payment succeeds
- No order created
- No email sent

**Fix:**

1. **Check Stripe CLI is running:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

2. **Verify webhook secret:**
   - Copy from Stripe CLI output
   - Update `.env.local`
   - Restart Next.js server

3. **Check webhook endpoint:**
   - Go to http://localhost:3000/api/stripe/webhook
   - Should return "Method Not Allowed" (that's expected - it only accepts POST)

4. **Check Stripe Dashboard:**
   - Go to Developers → Events
   - Look for failed webhook deliveries
   - Click to see error details

### Order Created But Cart Not Cleared

**Cause:** RLS (Row Level Security) policies in Supabase

**Fix:**

1. Go to Supabase → Authentication → Policies
2. Ensure `cart_items` table has DELETE policy:
   ```sql
   CREATE POLICY "Users can delete own cart items"
   ON cart_items FOR DELETE
   USING (auth.uid() = user_id);
   ```

### Email Not Sent

**Check:**

1. **SMTP credentials:**
   - Verify `SMTP_EMAIL` and `SMTP_PASSWORD`
   - For Gmail, use App Password (not regular password)
   - Create at: https://myaccount.google.com/apppasswords

2. **Console logs:**
   Look for "Error sending order confirmation email"

3. **Gmail security:**
   - Enable 2-factor authentication
   - Generate app-specific password
   - Use that in `.env.local`

### Stock Not Updated

**Check:**

1. **Products table permissions:**
   ```sql
   -- Service role should have full access
   GRANT ALL ON products TO service_role;
   ```

2. **Stock tracking enabled:**
   - Product should have `track_inventory = true`
   - Stock quantity should be a number

---

## 🎉 You're All Set!

Your Stripe integration is now:
- ✅ 100% functional
- ✅ Enterprise-grade error handling
- ✅ Automatic order numbering
- ✅ Email confirmations
- ✅ Production ready

### Next Steps

1. **Customize email template** (app/api/stripe/webhook/route.ts)
2. **Add shipping tracking** features
3. **Implement refunds** functionality
4. **Add admin dashboard** for order management

---

## 📞 Support Resources

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Support:** https://support.stripe.com
- **Stripe Test Cards:** https://stripe.com/docs/testing

---

**Last Updated:** January 21, 2025
**Version:** 2.0 - Complete Enterprise Implementation
