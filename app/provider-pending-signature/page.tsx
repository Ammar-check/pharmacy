"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { Mail, CheckCircle, Clock, FileText, ArrowRight } from "lucide-react";

function ProviderPendingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [signatureUrl, setSignatureUrl] = useState<string>("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const signatureUrlParam = searchParams.get("signatureUrl");

    if (emailParam) {
      setEmail(emailParam);
    }

    if (signatureUrlParam) {
      setSignatureUrl(signatureUrlParam);
    }

    if (!emailParam) {
      // If no email parameter, redirect to home page after 3 seconds
      setTimeout(() => {
        router.push("/");
      }, 3000);
    }
  }, [searchParams, router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Animation Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Success Icon with Animation */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-green-500 rounded-full p-6">
                <CheckCircle className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Application Submitted Successfully!
            </h1>
            <p className="text-lg text-gray-600">
              Thank you for applying to become a MedConnect provider partner.
            </p>
          </div>

          {/* Email Confirmation Box */}
          {email && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-start">
                <Mail className="h-6 w-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-blue-900 mb-2">Check Your Email</h2>
                  <p className="text-blue-800 mb-2">
                    We've sent a provider agreement form to:
                  </p>
                  <p className="text-blue-900 font-semibold text-lg bg-white px-4 py-2 rounded-lg border border-blue-300">
                    {email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps Section */}
          <div className="bg-gray-50 rounded-xl p-6 md:p-8 mb-8">
            <div className="flex items-center mb-6">
              <FileText className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Next Steps</h2>
            </div>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    Check Your Email Inbox
                  </h3>
                  <p className="text-gray-600">
                    Look for an email from DocuSeal with the subject containing your provider agreement. The email includes a secure link to electronically sign your agreement. If you don't see it within a few minutes, please check your spam/junk folder.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    Review the Provider Agreement
                  </h3>
                  <p className="text-gray-600">
                    Click the "Sign Document" link in the email or use the button below. Carefully read through all terms and conditions of the provider partnership agreement online. Take your time to understand all aspects of the partnership.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    Sign Electronically
                  </h3>
                  <p className="text-gray-600">
                    Use the secure DocuSeal interface to add your electronic signature. Simply click, type, or draw your signature directly in the browser - no printing or scanning required! The process is fast, secure, and legally binding.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Application Status Timeline</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Application Submitted</p>
                  <p className="text-sm text-gray-600">Your provider application has been received</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="h-5 w-5 border-2 border-yellow-400 bg-yellow-100 rounded-full mr-3 flex items-center justify-center flex-shrink-0">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Awaiting Signature</p>
                  <p className="text-sm text-gray-600">Complete and return the provider agreement form</p>
                </div>
              </div>

              <div className="flex items-center opacity-50">
                <div className="h-5 w-5 border-2 border-gray-300 rounded-full mr-3 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-gray-900">Review & Verification</p>
                  <p className="text-sm text-gray-600">Our team will verify your credentials and documents</p>
                </div>
              </div>

              <div className="flex items-center opacity-50">
                <div className="h-5 w-5 border-2 border-gray-300 rounded-full mr-3 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-gray-900">Account Activation</p>
                  <p className="text-sm text-gray-600">Your provider account will be activated and you'll receive login credentials</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-yellow-900 text-lg mb-2">Important Notes</h3>
            <ul className="list-disc list-inside space-y-2 text-yellow-800">
              <li>Your account will remain in "Pending Signature" status until you complete the electronic signature.</li>
              <li>The signature process only takes 2-3 minutes and can be completed from any device.</li>
              <li>Once signed, the review process typically takes 1-2 business days.</li>
              <li>You will receive a confirmation email once your account is approved and activated.</li>
              <li>If you have any questions, please contact our provider support team.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            {signatureUrl && (
              <button
                onClick={() => window.open(signatureUrl, "_blank")}
                className="flex items-center justify-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition shadow-lg hover:shadow-xl">
                <FileText className="mr-2 h-5 w-5" />
                Open Signature Form
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            )}

            <button
              onClick={() => router.push("/")}
              className="flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-lg hover:shadow-xl"
            >
              Return to Home
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>

          {/* Contact Support */}
          <div className="text-center mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-600 mb-2">Need help or have questions?</p>
            <p className="text-gray-900 font-semibold">
              Contact Provider Support:{" "}
              <a
                href="mailto:provider-support@alphabiomed.com"
                className="text-blue-600 hover:underline"
              >
                provider-support@alphabiomed.com
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function ProviderPendingSignaturePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-b from-white to-blue-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    }>
      <ProviderPendingContent />
    </Suspense>
  );
}
