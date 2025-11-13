export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        <div>
          <img
            src="/medconnect logo.webp"
            alt="MedConnect"
            className="h-16 w-auto mb-2"
          />
          <p className="text-gray-600">Compounding • Wellness • Patient-Centric Care</p>
        </div>
        <div className="text-gray-700">
          <p className="font-semibold mb-2">Contact Us</p>
          <p>info@medconnetrx.com</p>
          <p className="mt-2">3733 Westheimer Rd 1-674</p>
          <p>Houston Texas 77027</p>
        </div>
        <div className="text-gray-700">
          <p className="font-semibold mb-2">Quick Links</p>
          <ul className="space-y-1">
            <li><a href="/" className="hover:underline">Home</a></li>
            <li><a href="/create-account" className="hover:underline">Create New Account</a></li>
            <li><a href="/weightlossForm" className="hover:underline">Weight Loss Pad</a></li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-gray-500 py-4 border-t">© 2025 MedConnect. All rights reserved.</div>
    </footer>
  );
}



