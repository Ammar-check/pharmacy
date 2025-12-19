"use client";
import { useEffect } from "react";
import Link from "next/link";

type CartNotificationProps = {
  show: boolean;
  productName: string;
  quantity: number;
  onClose: () => void;
};

export default function CartNotification({
  show,
  productName,
  quantity,
  onClose,
}: CartNotificationProps) {
  // No auto-close - wait for user action
  if (!show) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Notification Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 transform transition-all duration-500 ease-out ${
          show ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">Added to Cart!</h3>
                <p className="text-green-100 text-sm">Item successfully added</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Product Info */}
          <div className="flex-1 px-6 py-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100 shadow-sm">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md">
                  <svg
                    className="w-10 h-10 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-600 font-semibold mb-1">Product Added</p>
                  <h4 className="font-bold text-gray-900 text-lg leading-tight mb-2">
                    {productName}
                  </h4>
                  <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <span className="font-bold text-blue-600">{quantity}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 mt-4 border border-blue-200">
                <p className="text-sm text-gray-600 text-center">
                  Your item is ready for checkout
                </p>
              </div>
            </div>

            {/* Animated Success Icon */}
            <div className="mt-8 flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-bounce-slow shadow-lg">
                  <svg
                    className="w-14 h-14 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="absolute -inset-2 bg-green-400 rounded-full opacity-20 animate-ping-slow"></div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 pb-6 space-y-3">
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105"
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Proceed to Checkout
              </div>
            </Link>

            <button
              onClick={onClose}
              className="block w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 text-center py-4 rounded-xl font-semibold text-lg border-2 border-gray-300 hover:border-gray-400 hover:from-gray-200 hover:to-gray-300 transition-all"
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Continue Shopping
              </div>
            </button>

            <Link
              href="/cart"
              onClick={onClose}
              className="block w-full text-blue-600 text-center py-3 rounded-xl font-medium hover:bg-blue-50 transition"
            >
              View Cart
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes ping-slow {
          75%,
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </>
  );
}
