"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type CartItem = {
  id: string;
  quantity: number;
  price_at_add: number;
  products: {
    id: string;
    name: string;
    slug: string;
    primary_image_url: string | null;
    base_price: number;
    stock_quantity: number;
    status: string;
  };
};

export default function ShoppingCartClient({ cartItems: initialCartItems }: { cartItems: CartItem[] }) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [loading, setLoading] = useState<string | null>(null);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setLoading(itemId);

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      // Update local state
      setCartItems(
        cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );

      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update quantity");
    } finally {
      setLoading(null);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!confirm("Remove this item from cart?")) return;

    setLoading(itemId);

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      // Update local state
      setCartItems(cartItems.filter((item) => item.id !== itemId));

      router.refresh();
      window.location.reload(); // Reload to update navbar cart count
    } catch (err) {
      console.error(err);
      alert("Failed to remove item");
    } finally {
      setLoading(null);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price_at_add * item.quantity,
    0
  );
  const tax = subtotal * 0.08; // 8% tax
  const shipping = cartItems.length > 0 ? 9.99 : 0;
  const total = subtotal + tax + shipping;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started</p>
            <Link
              href="/products"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 flex gap-6"
                >
                  {/* Product Image */}
                  <Link href={`/products/${item.products.slug}`} className="flex-shrink-0">
                    {item.products.primary_image_url ? (
                      <img
                        src={item.products.primary_image_url}
                        alt={item.products.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.products.slug}`}
                      className="text-lg font-bold text-gray-900 hover:text-blue-600 mb-2 block"
                    >
                      {item.products.name}
                    </Link>

                    <p className="text-gray-600 mb-4">
                      ${item.price_at_add.toFixed(2)} each
                    </p>

                    {/* Stock Status */}
                    {item.products.stock_quantity < item.quantity && (
                      <p className="text-red-600 text-sm mb-2">
                        Only {item.products.stock_quantity} available in stock
                      </p>
                    )}

                    <div className="flex items-center gap-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center border-2 border-gray-300 rounded-lg">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={loading === item.id || item.quantity <= 1}
                          className="px-3 py-1 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 text-gray-900 font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={
                            loading === item.id ||
                            item.quantity >= item.products.stock_quantity
                          }
                          className="px-3 py-1 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={loading === item.id}
                        className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      ${(item.price_at_add * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-center"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/products"
                  className="block w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition text-center mt-3"
                >
                  Continue Shopping
                </Link>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 text-center">
                    🔒 Secure checkout · SSL encrypted
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
