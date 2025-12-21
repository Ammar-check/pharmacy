import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createSupabaseRouteHandler } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  console.log('=== Payment Intent Creation Started ===');

  try {
    const supabase = await createSupabaseRouteHandler();
    console.log('Supabase client created');

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    if (!user) {
      console.error('No user found in session');
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
    }

    console.log('User authenticated:', user.id);

    // Parse the request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    const { orderData } = body;

    if (!orderData) {
      console.error('Missing orderData in request');
      return NextResponse.json({ error: 'Order data is required' }, { status: 400 });
    }

    console.log('Order data received:', {
      email: orderData.customer_email,
      name: orderData.customer_name,
    });

    // Get cart items
    console.log('Fetching cart items for user:', user.id);
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
      console.error('Cart fetch error:', cartError);
      return NextResponse.json(
        { error: 'Failed to fetch cart items: ' + cartError.message },
        { status: 500 }
      );
    }

    if (!cartItems || cartItems.length === 0) {
      console.error('Cart is empty for user:', user.id);
      return NextResponse.json(
        { error: 'Cart is empty. Please add items before checkout.' },
        { status: 400 }
      );
    }

    console.log('Cart items found:', cartItems.length);

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
    const shipping = orderData.shipping_cost || 0; // Free shipping
    const total = subtotal + tax + shipping;

    console.log('Order totals calculated:', {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
    });

    // Validate minimum amount (Stripe requires at least $0.50)
    if (total < 0.50) {
      console.error('Total amount too low:', total);
      return NextResponse.json(
        { error: 'Order total must be at least $0.50' },
        { status: 400 }
      );
    }

    // Create Payment Intent
    console.log('Creating Stripe Payment Intent...');
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

    console.log('Payment Intent created successfully:', paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('=== Payment Intent Creation Failed ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    // Check if it's a Stripe error
    if (error.type) {
      console.error('Stripe error type:', error.type);
      console.error('Stripe error code:', error.code);
    }

    return NextResponse.json(
      {
        error: error.message || 'Failed to create payment intent',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
