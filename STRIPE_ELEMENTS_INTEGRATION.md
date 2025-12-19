# Stripe Elements Integration Guide

## Overview
This project now uses **Stripe Elements** for embedded payment processing instead of Stripe Checkout. This provides a seamless, on-site payment experience where customers never leave your website.

## Implementation Details

### Architecture
1. **Checkout Flow**:
   - Customer fills out shipping/billing information
   - System creates a PaymentIntent via API
   - Stripe Elements form renders with payment methods
   - Customer completes payment on-site
   - Stripe redirects to success page
   - Webhook creates order in database

2. **Key Components**:
   - `/components/checkout-client.tsx` - Main checkout component
   - `/components/stripe-payment-form.tsx` - Stripe Elements payment form
   - `/app/api/stripe/create-payment-intent/route.ts` - Creates PaymentIntent
   - `/app/api/stripe/webhook/route.ts` - Handles payment confirmations
   - `/app/payment-success/page.tsx` - Success page after payment

### Environment Variables
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Testing the Integration

### 1. Local Development Setup

**Start the dev server:**
```bash
npm run dev
```

**In a new terminal, start Stripe CLI for webhook testing:**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret from the CLI output and update your `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 2. Test Payment Flow

1. **Navigate to Products**:
   - Go to http://localhost:3000/products
   - Add items to cart
   - Click "Checkout"

2. **Fill Checkout Form**:
   - Enter shipping information
   - Click "Continue to Payment"

3. **Complete Payment**:
   - Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)
   - Click "Pay Now"

4. **Verify Success**:
   - You should be redirected to the payment success page
   - Check that the order appears in your Supabase database
   - Verify cart is cleared
   - Confirm stock quantities are updated

### 3. Testing Different Scenarios

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expected: Order created, cart cleared, success page shown

**Failed Payment (Insufficient Funds):**
- Card: `4000 0000 0000 9995`
- Expected: Error message displayed, order not created

**Failed Payment (Card Declined):**
- Card: `4000 0000 0000 0002`
- Expected: Error message displayed, order not created

**3D Secure Authentication:**
- Card: `4000 0025 0000 3155`
- Expected: 3D Secure modal appears, complete authentication

### 4. Webhook Testing

Monitor webhook events in the Stripe CLI terminal:
```bash
# You should see events like:
# payment_intent.created
# payment_intent.succeeded
```

Verify in Supabase that:
- Order record created in `orders` table
- Order items created in `order_items` table
- Cart items deleted from `cart_items` table
- Product stock updated in `products` table

## Production Deployment

### 1. Update Environment Variables
Replace test keys with live keys in your production environment:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Set Up Production Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter your production URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Copy the webhook signing secret
6. Update `STRIPE_WEBHOOK_SECRET` in production environment

### 3. Test Production

Use live mode test before going fully live:
- Create test orders with real test cards
- Verify all webhooks are received
- Check order creation workflow
- Test email notifications (if implemented)

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **Webhook Verification**: Always verify webhook signatures (already implemented)
3. **Payment Intent Metadata**: Sensitive order data is stored in PaymentIntent metadata
4. **Row Level Security**: Supabase RLS policies protect order data

## Common Issues & Troubleshooting

### Webhook Not Receiving Events
- Check webhook URL is correct
- Verify webhook secret matches
- Ensure `/api/stripe/webhook` route is accessible
- Check Stripe Dashboard for webhook delivery attempts

### Payment Success but No Order Created
- Check webhook logs in Stripe Dashboard
- Verify webhook secret is correct
- Check server logs for errors
- Ensure Supabase permissions allow order creation

### Order Created but Cart Not Cleared
- Webhook may have partially failed
- Check Supabase RLS policies on cart_items
- Verify user authentication in webhook

### Stock Not Updated
- Check products table has RLS policy allowing updates
- Verify stock_quantity field exists and is numeric
- Check webhook logs for stock update errors

## API Endpoints

### POST /api/stripe/create-payment-intent
Creates a PaymentIntent for the checkout process.

**Request Body:**
```json
{
  "orderData": {
    "customer_email": "user@example.com",
    "customer_name": "John Doe",
    "customer_phone": "555-1234",
    "shipping_address_line1": "123 Main St",
    "shipping_city": "New York",
    "shipping_state": "NY",
    "shipping_zip": "10001",
    "tax_amount": 8.99,
    "shipping_cost": 9.99,
    "customer_notes": "Leave at door"
  }
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### POST /api/stripe/webhook
Receives webhook events from Stripe.

**Events Handled:**
- `payment_intent.succeeded` - Creates order, clears cart, updates stock
- `payment_intent.payment_failed` - Logs failure
- `payment_intent.canceled` - Logs cancellation

## Next Steps

1. **Email Notifications**: Implement order confirmation emails
2. **Admin Dashboard**: Add order management interface
3. **Refunds**: Implement refund processing
4. **Shipping Integration**: Add shipping label generation
5. **Analytics**: Track conversion rates and abandoned carts

## Support

For Stripe-related issues:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

For implementation questions, check the code comments in:
- `components/checkout-client.tsx`
- `app/api/stripe/webhook/route.ts`
