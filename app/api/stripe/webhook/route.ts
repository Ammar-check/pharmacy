export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { createSupabaseServiceRole } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

// Helper function to log with timestamp
function log(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[${timestamp}] [STRIPE-WEBHOOK] ${message}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`[${timestamp}] [STRIPE-WEBHOOK] ${message}`);
  }
}

function logError(message: string, error?: any) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [STRIPE-WEBHOOK-ERROR] ${message}`, error);
}

export async function POST(req: Request) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  log(`=== Webhook Request Started ===`, { requestId });

  let event;
  let body: string;

  try {
    // Step 1: Get request body
    try {
      body = await req.text();
      log("Request body received", { bodyLength: body.length, requestId });
    } catch (err: any) {
      logError("Failed to read request body", err);
      return NextResponse.json(
        { error: "Failed to read request body" },
        { status: 400 }
      );
    }

    // Step 2: Verify webhook signature
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      logError("No Stripe signature found in headers", { requestId });
      return NextResponse.json(
        { error: "No signature found" },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      logError("STRIPE_WEBHOOK_SECRET is not configured", { requestId });
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Step 3: Construct and verify event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      log("Event verified successfully", {
        eventType: event.type,
        eventId: event.id,
        requestId
      });
    } catch (err: any) {
      logError("Webhook signature verification failed", {
        error: err.message,
        requestId
      });
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Step 4: Process event asynchronously and return 200 immediately
    // This is CRITICAL: Stripe needs a quick 200 response
    processWebhookEvent(event, requestId).catch((err) => {
      logError("Async event processing failed", {
        error: err.message,
        stack: err.stack,
        eventType: event.type,
        eventId: event.id,
        requestId
      });
    });

    log("Webhook acknowledged successfully", {
      eventType: event.type,
      eventId: event.id,
      requestId
    });

    // Return 200 immediately - CRITICAL for Stripe
    return NextResponse.json({
      received: true,
      eventId: event.id,
      requestId
    }, { status: 200 });

  } catch (err: any) {
    logError("Unexpected error in webhook handler", {
      error: err.message,
      stack: err.stack,
      requestId
    });

    // Even on error, try to return 200 to prevent Stripe from retrying
    // The error is logged for investigation
    return NextResponse.json(
      {
        received: true,
        error: "Internal processing error - logged for review",
        requestId
      },
      { status: 200 }
    );
  }
}

// Async function to process webhook events
async function processWebhookEvent(event: any, requestId: string) {
  log("Processing event asynchronously", {
    eventType: event.type,
    eventId: event.id,
    requestId
  });

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        await handlePaymentIntentSucceeded(paymentIntent, requestId);
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        await handlePaymentFailed(failedPayment, requestId);
        break;

      case "payment_intent.canceled":
        const canceledPayment = event.data.object;
        log("PaymentIntent canceled", {
          paymentIntentId: canceledPayment.id,
          requestId
        });
        break;

      case "checkout.session.completed":
        log("Checkout session completed", {
          sessionId: event.data.object.id,
          requestId
        });
        // Handle checkout session if needed
        break;

      default:
        log(`Unhandled event type: ${event.type}`, {
          eventId: event.id,
          requestId
        });
    }
  } catch (err: any) {
    logError("Error processing event", {
      error: err.message,
      stack: err.stack,
      eventType: event.type,
      eventId: event.id,
      requestId
    });
    throw err; // Re-throw to be caught by the outer catch
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any, requestId: string) {
  log("=== Payment Intent Succeeded Handler Started ===", {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    requestId
  });

  const supabase = createSupabaseServiceRole();

  if (!supabase) {
    logError("Service role client not available", { requestId });
    throw new Error("Service role client not available");
  }

  try {
    const metadata = paymentIntent.metadata;
    const userId = metadata.user_id;

    if (!userId) {
      logError("No user_id in payment intent metadata", {
        paymentIntentId: paymentIntent.id,
        metadata,
        requestId
      });
      throw new Error("No user_id in payment intent metadata");
    }

    log("Processing payment for user", { userId, requestId });

    // Parse shipping address from metadata
    let shippingAddress;
    try {
      shippingAddress = JSON.parse(metadata.shipping_address || "{}");
    } catch (err) {
      logError("Failed to parse shipping address", {
        shippingAddressRaw: metadata.shipping_address,
        requestId
      });
      shippingAddress = {};
    }

    // Step 1: Get cart items
    log("Fetching cart items", { userId, requestId });
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        product_id,
        quantity,
        price_at_add,
        products (
          name,
          sku,
          primary_image_url,
          stock_quantity
        )
      `
      )
      .eq("user_id", userId);

    if (cartError) {
      logError("Error fetching cart items", {
        error: cartError,
        userId,
        requestId
      });
      throw new Error(`Failed to fetch cart items: ${cartError.message}`);
    }

    if (!cartItems || cartItems.length === 0) {
      logError("Cart is empty", { userId, requestId });
      throw new Error("Cart is empty - cannot process order");
    }

    log("Cart items fetched successfully", {
      itemCount: cartItems.length,
      requestId
    });

    // Step 2: Create the order
    log("Creating order", { userId, requestId });
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        customer_email: metadata.customer_email,
        customer_name: metadata.customer_name,
        customer_phone: metadata.customer_phone || null,
        shipping_address_line1: shippingAddress.line1,
        shipping_address_line2: shippingAddress.line2 || null,
        shipping_city: shippingAddress.city,
        shipping_state: shippingAddress.state,
        shipping_zip: shippingAddress.zip,
        subtotal: parseFloat(metadata.subtotal),
        tax_amount: parseFloat(metadata.tax),
        shipping_cost: parseFloat(metadata.shipping),
        total_amount: parseFloat(metadata.total),
        payment_status: "paid",
        order_status: "processing",
        payment_intent_id: paymentIntent.id,
        payment_method: "card",
        customer_notes: metadata.customer_notes || null,
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      logError("Error creating order", {
        error: orderError,
        userId,
        requestId
      });
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    if (!order) {
      logError("Order creation returned null", { userId, requestId });
      throw new Error("Order creation failed - no order returned");
    }

    log("Order created successfully", {
      orderId: order.id,
      orderNumber: order.order_number,
      requestId
    });

    // Step 3: Create order items
    log("Creating order items", { orderId: order.id, requestId });
    const orderItems = cartItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.price_at_add,
      total_price: item.price_at_add * item.quantity,
      product_name: item.products?.name || "Unknown Product",
      product_sku: item.products?.sku || null,
      product_image_url: item.products?.primary_image_url || null,
    }));

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) {
      logError("Error creating order items", {
        error: orderItemsError,
        orderId: order.id,
        requestId
      });
      // Don't throw - order is already created, continue with partial success
    } else {
      log("Order items created successfully", {
        orderId: order.id,
        itemCount: orderItems.length,
        requestId
      });
    }

    // Step 4: Update product stock quantities (optimized with Promise.all)
    log("Updating product stock", {
      productCount: cartItems.length,
      requestId
    });

    const stockUpdatePromises = cartItems.map(async (item) => {
      try {
        // Use atomic update to prevent race conditions
        const { error: stockError } = await supabase.rpc(
          'decrement_product_stock',
          {
            product_id_param: item.product_id,
            quantity_param: item.quantity
          }
        );

        if (stockError) {
          // If RPC doesn't exist, fall back to manual update
          const { data: product } = await supabase
            .from("products")
            .select("stock_quantity")
            .eq("id", item.product_id)
            .single();

          if (product) {
            const newStock = Math.max(0, product.stock_quantity - item.quantity);
            const { error: updateError } = await supabase
              .from("products")
              .update({ stock_quantity: newStock })
              .eq("id", item.product_id);

            if (updateError) {
              logError("Error updating stock (fallback)", {
                productId: item.product_id,
                error: updateError,
                requestId
              });
            } else {
              log("Stock updated (fallback)", {
                productId: item.product_id,
                oldStock: product.stock_quantity,
                newStock,
                requestId
              });
            }
          }
        } else {
          log("Stock decremented (RPC)", {
            productId: item.product_id,
            quantity: item.quantity,
            requestId
          });
        }
      } catch (err: any) {
        logError("Stock update failed", {
          productId: item.product_id,
          error: err.message,
          requestId
        });
        // Continue with other updates
      }
    });

    // Wait for all stock updates to complete
    await Promise.all(stockUpdatePromises);
    log("All stock updates completed", { requestId });

    // Step 5: Clear user's cart
    log("Clearing user cart", { userId, requestId });
    const { error: clearCartError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId);

    if (clearCartError) {
      logError("Error clearing cart", {
        error: clearCartError,
        userId,
        requestId
      });
      // Don't throw - order is created, this is cleanup
    } else {
      log("Cart cleared successfully", { userId, requestId });
    }

    log("Order processing completed successfully", {
      orderId: order.id,
      orderNumber: order.order_number,
      paymentIntentId: paymentIntent.id,
      requestId
    });

    // Step 6: Send order confirmation email (non-blocking)
    sendOrderConfirmationEmail(order, cartItems, metadata, shippingAddress, requestId)
      .catch((emailError) => {
        logError("Error sending order confirmation email", {
          error: emailError,
          orderId: order.id,
          requestId
        });
        // Don't fail the webhook if email fails
      });

  } catch (error: any) {
    logError("Critical error in handlePaymentIntentSucceeded", {
      error: error.message,
      stack: error.stack,
      paymentIntentId: paymentIntent.id,
      requestId
    });
    throw error;
  }
}

async function sendOrderConfirmationEmail(
  order: any,
  cartItems: any[],
  metadata: any,
  shippingAddress: any,
  requestId: string
) {
  try {
    log("Sending order confirmation email", {
      orderId: order.id,
      email: metadata.customer_email,
      requestId
    });

    const orderItemsHtml = cartItems
      .map(
        (item: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <strong>${item.products?.name || "Unknown Product"}</strong><br/>
            <span style="color: #6b7280; font-size: 14px;">Quantity: ${item.quantity}</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            $${(item.price_at_add * item.quantity).toFixed(2)}
          </td>
        </tr>
      `
      )
      .join("");

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background-color: #2563eb; padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Order Confirmed!</h1>
      <p style="color: #e0e7ff; margin: 10px 0 0 0;">Thank you for your purchase</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 20px;">
      <!-- Order Info -->
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <p style="margin: 0 0 10px 0; color: #374151;">
          <strong>Order Number:</strong> ${order.order_number}
        </p>
        <p style="margin: 0 0 10px 0; color: #374151;">
          <strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <p style="margin: 0; color: #374151;">
          <strong>Payment Status:</strong> <span style="color: #059669;">Paid</span>
        </p>
      </div>

      <!-- Greeting -->
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Hi <strong>${metadata.customer_name}</strong>,
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        We've received your order and it's being processed. You'll receive a shipping confirmation email with tracking information once your order ships.
      </p>

      <!-- Order Items -->
      <h2 style="color: #111827; font-size: 20px; margin: 30px 0 15px 0;">Order Items</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Item</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${orderItemsHtml}
        </tbody>
      </table>

      <!-- Order Summary -->
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Subtotal</td>
            <td style="padding: 8px 0; text-align: right; color: #374151;">$${metadata.subtotal}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Tax</td>
            <td style="padding: 8px 0; text-align: right; color: #374151;">$${metadata.tax}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Shipping</td>
            <td style="padding: 8px 0; text-align: right; color: #374151;">$${metadata.shipping}</td>
          </tr>
          <tr style="border-top: 2px solid #e5e7eb;">
            <td style="padding: 12px 0 0 0;"><strong style="color: #111827; font-size: 18px;">Total</strong></td>
            <td style="padding: 12px 0 0 0; text-align: right;"><strong style="color: #111827; font-size: 18px;">$${metadata.total}</strong></td>
          </tr>
        </table>
      </div>

      <!-- Shipping Address -->
      <h2 style="color: #111827; font-size: 20px; margin: 30px 0 15px 0;">Shipping Address</h2>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <p style="margin: 0; color: #374151; line-height: 1.6;">
          ${shippingAddress.line1}<br/>
          ${shippingAddress.line2 ? shippingAddress.line2 + "<br/>" : ""}
          ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}
        </p>
      </div>

      <!-- What's Next -->
      <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin-bottom: 30px;">
        <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 18px;">What Happens Next?</h3>
        <ol style="margin: 0; padding-left: 20px; color: #374151; line-height: 1.8;">
          <li>We're preparing your order for shipment</li>
          <li>You'll receive a shipping confirmation with tracking number</li>
          <li>Your order will arrive within 5-7 business days</li>
        </ol>
      </div>

      <!-- Support -->
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
        Questions about your order? Contact us at
        <a href="mailto:support@medconnect.com" style="color: #2563eb; text-decoration: none;">support@medconnect.com</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
        Thank you for shopping with MedConnect
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        &copy; ${new Date().getFullYear()} MedConnect. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    await sendEmail({
      to: metadata.customer_email,
      subject: `Order Confirmation - ${order.order_number}`,
      html: emailHtml,
    });

    log("Order confirmation email sent successfully", {
      orderId: order.id,
      email: metadata.customer_email,
      requestId
    });
  } catch (emailError: any) {
    logError("Failed to send order confirmation email", {
      error: emailError.message,
      orderId: order.id,
      requestId
    });
    throw emailError;
  }
}

async function handlePaymentFailed(paymentIntent: any, requestId: string) {
  log("=== Payment Failed Handler Started ===", {
    paymentIntentId: paymentIntent.id,
    requestId
  });

  const supabase = createSupabaseServiceRole();

  if (!supabase) {
    logError("Service role client not available", { requestId });
    return;
  }

  try {
    const { data: order } = await supabase
      .from("orders")
      .select("id")
      .eq("payment_intent_id", paymentIntent.id)
      .single();

    if (order) {
      await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          order_status: "cancelled",
        })
        .eq("id", order.id);

      log("Order marked as failed", {
        orderId: order.id,
        paymentIntentId: paymentIntent.id,
        requestId
      });
    } else {
      log("No order found for failed payment", {
        paymentIntentId: paymentIntent.id,
        requestId
      });
    }
  } catch (error: any) {
    logError("Error in handlePaymentFailed", {
      error: error.message,
      paymentIntentId: paymentIntent.id,
      requestId
    });
  }
}
