import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createSupabaseRouteHandler } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseRouteHandler();

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    const { orderData } = body;

    // Get cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(
        `
        id,
        quantity,
        price_at_add,
        products (
          id,
          name,
          stock_quantity
        )
      `
      )
      .eq('user_id', user.id);

    if (cartError) {
      return NextResponse.json(
        { error: 'Failed to fetch cart items' },
        { status: 500 }
      );
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Check stock availability
    for (const item of cartItems) {
      const product = item.products as any;
      if (product && product.stock_quantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.name}. Only ${product.stock_quantity} available.`,
          },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    const subtotal = cartItems.reduce(
      (sum: number, item: any) => sum + item.price_at_add * item.quantity,
      0
    );
    const tax = orderData.tax_amount || subtotal * 0.08;
    const shipping = orderData.shipping_cost || 9.99;
    const total = subtotal + tax + shipping;

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        user_id: user.id,
        customer_email: orderData.customer_email,
        customer_name: orderData.customer_name,
        shipping_address: JSON.stringify({
          line1: orderData.shipping_address_line1,
          line2: orderData.shipping_address_line2 || '',
          city: orderData.shipping_city,
          state: orderData.shipping_state,
          zip: orderData.shipping_zip,
        }),
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        shipping: shipping.toFixed(2),
        total: total.toFixed(2),
        customer_phone: orderData.customer_phone || '',
        customer_notes: orderData.customer_notes || '',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
