"use client";
import Link from "next/link";

type Order = {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  total_amount: number;
  order_status: string;
  created_at: string;
  order_items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products: {
      name: string;
      primary_image_url: string | null;
    } | null;
  }>;
};

export default function OrderConfirmationClient({ order }: { order: Order }) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Message */}
        <div className="bg-white rounded-2xl border-2 border-green-500 p-8 mb-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-xl text-gray-600 mb-4">
            Thank you for your order, {order.customer_name}
          </p>
          <p className="text-gray-700">
            A confirmation email has been sent to{" "}
            <span className="font-medium">{order.customer_email}</span>
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Details</h2>
              <p className="text-gray-600">
                Order Number: <span className="font-bold text-gray-900">{order.order_number}</span>
              </p>
              <p className="text-sm text-gray-500">
                Placed on {new Date(order.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
              {order.order_status === "pending" && "Processing"}
              {order.order_status === "processing" && "Processing"}
              {order.order_status === "shipped" && "Shipped"}
              {order.order_status === "delivered" && "Delivered"}
            </span>
          </div>

          {/* Shipping Address */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">Shipping Address</h3>
            <p className="text-gray-700">{order.customer_name}</p>
            <p className="text-gray-700">{order.shipping_address_line1}</p>
            {order.shipping_address_line2 && (
              <p className="text-gray-700">{order.shipping_address_line2}</p>
            )}
            <p className="text-gray-700">
              {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
            </p>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                  {item.products?.primary_image_url ? (
                    <img
                      src={item.products.primary_image_url}
                      alt={item.product_name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{item.product_name}</h4>
                    <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                    <p className="text-gray-600 text-sm">
                      ${item.unit_price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${item.total_price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax</span>
                <span>${order.tax_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span>${order.shipping_cost.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>${order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">What Happens Next?</h3>
          <ol className="space-y-3">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                1
              </span>
              <span className="text-gray-700">
                You'll receive an order confirmation email shortly
              </span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                2
              </span>
              <span className="text-gray-700">
                Your order will be processed and prepared for shipping
              </span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                3
              </span>
              <span className="text-gray-700">
                You'll receive a shipping confirmation with tracking information
              </span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                4
              </span>
              <span className="text-gray-700">
                Your order will arrive at your doorstep within 5-7 business days
              </span>
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/products"
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-center"
          >
            Continue Shopping
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition text-center"
          >
            Print Order Details
          </button>
        </div>

        {/* Support */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Need help? Contact us at{" "}
            <a href="mailto:support@medconnect.com" className="text-blue-600 font-medium">
              support@medconnect.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
