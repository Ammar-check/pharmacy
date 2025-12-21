# ⚡ Quick Start - Stripe Checkout in 5 Minutes

## Prerequisites Checklist
- [ ] Stripe account created
- [ ] Supabase project set up
- [ ] Gmail app password generated
- [ ] Node.js installed

---

## 1️⃣ Database Setup (2 minutes)

### Go to Supabase SQL Editor

Copy and paste these files in order:

**File 1:** `database/products_and_cart_schema.sql`
- Click **Run** ✅

**File 2:** `database/order_number_generation.sql`
- Click **Run** ✅

**Verify:**
```sql
SELECT generate_order_number();
```
Should return: `ORD-20250121-00001`

---

## 2️⃣ Environment Variables (1 minute)

Update `.env.local`:

```env
# Stripe (get from dashboard.stripe.com/test/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_FROM_CLI_BELOW

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Email (use Gmail app password)
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

---

## 3️⃣ Start Servers (1 minute)

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Copy the `whsec_...` secret from Terminal 2 → Update `.env.local` → Restart Terminal 1**

---

## 4️⃣ Test Payment (1 minute)

1. Go to http://localhost:3000/products
2. Add product to cart
3. Go to cart → Checkout
4. Fill form with any data
5. Use test card: `4242 4242 4242 4242`
6. Expiry: `12/30`, CVC: `123`
7. Click "Pay Now"

**Success = Redirect to order confirmation page!**

---

## ✅ Verification

Check Terminal 1 for:
```
Payment Intent created successfully: pi_...
Order X created successfully for PaymentIntent pi_...
Order confirmation email sent to test@example.com
```

Check Supabase → orders table → New order with order_number!

Check email for order confirmation!

---

## 🚨 Common Issues

**Error: "Payment System Not Configured"**
→ Restart dev server after adding env vars

**No webhook events**
→ Check Terminal 2 is running stripe listen

**No email received**
→ Check SMTP_PASSWORD is app password, not regular password

---

## 🚀 Ready for Production?

See `STRIPE_COMPLETE_SETUP_GUIDE.md` for:
- Production deployment
- Live API keys setup
- Production webhook configuration

---

**You're done! 🎉**
