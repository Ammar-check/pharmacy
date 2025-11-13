"use client";
import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SuccessMessageProps {
  message: string;
  onClose: () => void;
}

export default function SuccessMessage({ message, onClose }: SuccessMessageProps) {
  useEffect(() => {
    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-slideUp">
        {/* Success Icon Section */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 rounded-t-2xl">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-3 animate-bounce">
              <CheckCircle className="text-green-600" size={48} strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white text-center">Success!</h2>
        </div>

        {/* Message Section */}
        <div className="p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <p className="text-gray-700 text-center text-lg mb-4">{message}</p>

          <div className="flex items-center justify-center gap-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Form submitted successfully</span>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
