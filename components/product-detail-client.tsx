"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import supabase from "@/lib/supabase/client";
import CartNotification from "@/components/cart-notification";

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  short_description: string | null;
  product_overview: string | null;
  key_features: string[] | null;
  product_details: any;
  storage_handling: string | null;
  usage_instructions: string | null;
  benefits: string | null;
  ingredients: string[] | null;
  disclaimer: string | null;
  base_price: number;
  stock_quantity: number;
  primary_image_url: string | null;
  requires_prescription: boolean;
};

export default function ProductDetailClient({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      setMessage("");

      // Check if user is logged in
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/create-account");
        return;
      }

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          quantity,
          price_at_add: product.base_price,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add to cart");
      }

      // Show beautiful notification (no auto-reload)
      setShowNotification(true);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
    // Reload to update cart count when notification is closed
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  return (
    <>
      {/* Cart Notification */}
      <CartNotification
        show={showNotification}
        productName={product.name}
        quantity={quantity}
        onClose={handleCloseNotification}
      />

      <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex text-sm">
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              Home
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href="/products" className="text-blue-600 hover:text-blue-700">
              Products
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-600">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Main Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div>
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 sticky top-24">
              {product.primary_image_url ? (
                <img
                  src={product.primary_image_url}
                  alt={product.name}
                  className="w-full h-auto object-contain rounded-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-lg">No image available</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              {product.category && (
                <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                  {product.category}
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

            {product.short_description && (
              <p className="text-lg text-gray-600 mb-6">{product.short_description}</p>
            )}

            {/* Price */}
            <div className="mb-6">
              <span className="text-4xl font-bold text-blue-600">
                ${product.base_price.toFixed(2)}
              </span>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock_quantity > 0 ? (
                <div className="flex items-center text-green-600">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">In Stock ({product.stock_quantity} available)</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Prescription Notice */}
            {product.requires_prescription && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">
                  ⚕️ This product requires a valid prescription from a licensed healthcare provider.
                </p>
              </div>
            )}

            {/* Quantity Selector & Add to Cart */}
            {product.stock_quantity > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-300 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock_quantity}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.min(product.stock_quantity, Math.max(1, parseInt(e.target.value) || 1)))
                      }
                      className="w-16 text-center border-x-2 border-gray-300 py-2 text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={loading}
                    className="flex-1 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loading ? "Adding..." : "Add to Cart"}
                  </button>
                </div>

                {message && (
                  <p
                    className={`mt-3 text-sm ${
                      message.includes("success") ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Product Details Sections */}
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Product Overview */}
          {product.product_overview && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Overview</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.product_overview}
              </p>
            </div>
          )}

          {/* Key Features */}
          {product.key_features && product.key_features.length > 0 && product.key_features[0] !== "" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
              <ul className="space-y-3">
                {product.key_features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {product.benefits && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefits</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.benefits}
              </p>
            </div>
          )}

          {/* Ingredients */}
          {product.ingredients && product.ingredients.length > 0 && product.ingredients[0] !== "" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ingredients</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Usage Instructions */}
          {product.usage_instructions && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Usage Instructions</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.usage_instructions}
              </p>
            </div>
          )}

          {/* Storage & Handling */}
          {product.storage_handling && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Storage & Handling</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.storage_handling}
              </p>
            </div>
          )}

          {/* Disclaimer */}
          {product.disclaimer && (
            <div className="bg-red-50 rounded-2xl border border-red-200 p-8">
              <h2 className="text-2xl font-bold text-red-900 mb-4">Important Disclaimer</h2>
              <p className="text-red-800 leading-relaxed whitespace-pre-line">
                {product.disclaimer}
              </p>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <Link
                  key={relProduct.id}
                  href={`/products/${relProduct.slug}`}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all"
                >
                  {relProduct.primary_image_url ? (
                    <img
                      src={relProduct.primary_image_url}
                      alt={relProduct.name}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-200"></div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 line-clamp-2">
                      {relProduct.name}
                    </h3>
                    <span className="text-lg font-bold text-blue-600">
                      ${relProduct.base_price.toFixed(2)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
