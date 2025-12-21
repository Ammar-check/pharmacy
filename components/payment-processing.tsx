"use client";

export default function PaymentProcessing() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Processing Your Order...
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Please wait while we confirm your payment.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            This usually takes a few seconds. If the page doesn't update automatically, click the button below.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}
