"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { Upload, Check, AlertCircle, FileText, Building2, MapPin, Shield } from "lucide-react";

export default function ProviderSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{
    resellers_certificate?: File;
    business_license?: File;
  }>({});

  // Form state
  const [formData, setFormData] = useState({
    // Contact Information
    firstName: "",
    lastName: "",
    suffix: "",
    email: "",
    phone: "",

    // Business Profile
    companyName: "",
    businessType: "Provider",
    website: "",
    taxIdEin: "",
    npiNumber: "",
    npiOwnerMatches: true,
    hasResellersLicense: "not_sure",
    resellersPermitNumber: "",

    // Business Address
    addressLine1: "",
    city: "",
    state: "",
    zipCode: "",

    // Verification & Referral
    referredBy: "",
    additionalNotes: "",

    // Consent
    marketingConsent: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRadioChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "resellers_certificate" | "business_license") => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return;
      }

      // Validate file type (PDF, images)
      const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        setError(`File "${file.name}" has an invalid type. Please upload PDF, JPEG, or PNG files.`);
        return;
      }

      setUploadedFiles(prev => ({ ...prev, [fieldName]: file }));
      setError(null);
    }
  };

  const removeFile = (fieldName: "resellers_certificate" | "business_license") => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[fieldName];
      return newFiles;
    });
  };

  const validateForm = () => {
    // Required fields validation
    if (!formData.firstName.trim()) return "First name is required";
    if (!formData.lastName.trim()) return "Last name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.phone.trim()) return "Phone number is required";
    if (!formData.companyName.trim()) return "Company name is required";
    if (!formData.website.trim()) return "Website is required";
    if (!formData.taxIdEin.trim()) return "Tax ID / EIN is required";
    if (!formData.npiNumber.trim()) return "NPI Number is required";
    if (!formData.addressLine1.trim()) return "Address is required";
    if (!formData.city.trim()) return "City is required";
    if (!formData.state.trim()) return "State is required";
    if (!formData.zipCode.trim()) return "Zip Code is required";
    if (!formData.referredBy.trim()) return "Referral information is required";

    // Email validation
    const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-])*[a-zA-Z0-9]@[a-zA-Z0-9]([a-zA-Z0-9-])*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address";
    }

    // Phone validation (basic US format)
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(formData.phone) || formData.phone.replace(/\D/g, "").length < 10) {
      return "Please enter a valid US phone number (at least 10 digits)";
    }

    // Website validation
    const urlRegex = /^(https?:\/\/)?(www\.)?[\w\-\.]+\.\w{2,}(\/.*)?$/;
    if (!urlRegex.test(formData.website)) {
      return "Please enter a valid website URL";
    }

    // NPI validation (10 digits)
    if (formData.npiNumber.replace(/\D/g, "").length !== 10) {
      return "NPI Number must be exactly 10 digits";
    }

    // Conditional validation for reseller's license
    if (formData.hasResellersLicense === "yes") {
      if (!formData.resellersPermitNumber.trim()) {
        return "Reseller's Permit Number is required when you have a reseller's license";
      }
      if (!uploadedFiles.resellers_certificate) {
        return "Please upload your Reseller's Certificate";
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);

    try {
      // Prepare FormData for file uploads
      const submitData = new FormData();

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, String(value));
      });

      // Add files
      if (uploadedFiles.resellers_certificate) {
        submitData.append("resellers_certificate", uploadedFiles.resellers_certificate);
      }
      if (uploadedFiles.business_license) {
        submitData.append("business_license", uploadedFiles.business_license);
      }

      // Submit to API
      const response = await fetch("/api/provider-signup", {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit provider application");
      }

      // Redirect to pending signature page
      router.push(`/provider-pending-signature?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(err.message || "An error occurred while submitting your application");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/medconnect logo.webp" alt="Alpha BioMed" className="h-20 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Provider Intake</h1>
          <p className="text-gray-600">Complete the form below to create your provider account</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          {/* Contact Information Section */}
          <section>
            <div className="flex items-center mb-6">
              <FileText className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  First Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  required
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Last Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  required
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Suffix
                </label>
                <input
                  type="text"
                  name="suffix"
                  value={formData.suffix}
                  onChange={handleInputChange}
                  placeholder="MD, DO, NP, PA, etc."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Phone<span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="US-based mobile number"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">US-based mobile number</p>
              </div>
            </div>
          </section>

          {/* Business Profile Section */}
          <section>
            <div className="flex items-center mb-6 pt-6 border-t border-gray-200">
              <Building2 className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Business Profile</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Company Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Business Type
                </label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white"
                >
                  <option value="Provider">Provider</option>
                  <option value="Clinic">Clinic</option>
                  <option value="Practice">Practice</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Website<span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://www.example.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tax ID / EIN<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="taxIdEin"
                  value={formData.taxIdEin}
                  onChange={handleInputChange}
                  placeholder="XX-XXXXXXX"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  NPI Number<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="npiNumber"
                  value={formData.npiNumber}
                  onChange={handleInputChange}
                  placeholder="10-digit National Provider Identifier"
                  maxLength={10}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  required
                />
              </div>
            </div>

            {/* NPI Owner Match */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Does the owner of the NPI number match the contact for this account?
              </label>
              <div className="flex items-center space-x-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="npiOwnerMatches"
                    checked={formData.npiOwnerMatches === true}
                    onChange={() => handleRadioChange("npiOwnerMatches", true)}
                    className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Yes</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="npiOwnerMatches"
                    checked={formData.npiOwnerMatches === false}
                    onChange={() => handleRadioChange("npiOwnerMatches", false)}
                    className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">No</span>
                </label>
              </div>
            </div>

            {/* Reseller's License */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Does your business have a reseller's license?<span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">Helps determine your eligibility for sales tax exemption.</p>
              <div className="flex items-center space-x-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="hasResellersLicense"
                    checked={formData.hasResellersLicense === "yes"}
                    onChange={() => handleRadioChange("hasResellersLicense", "yes")}
                    className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Yes</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="hasResellersLicense"
                    checked={formData.hasResellersLicense === "no"}
                    onChange={() => handleRadioChange("hasResellersLicense", "no")}
                    className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">No</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="hasResellersLicense"
                    checked={formData.hasResellersLicense === "not_sure"}
                    onChange={() => handleRadioChange("hasResellersLicense", "not_sure")}
                    className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Not sure</span>
                </label>
              </div>
            </div>

            {/* Conditional Reseller's License Fields */}
            {formData.hasResellersLicense === "yes" && (
              <div className="mt-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Reseller's Permit Number<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="resellersPermitNumber"
                    value={formData.resellersPermitNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Upload Reseller's Certificate<span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    {!uploadedFiles.resellers_certificate ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="mb-1 text-sm text-gray-600 font-medium">
                            <span className="text-blue-600">Click to upload</span> or drag files here
                          </p>
                          <p className="text-xs text-gray-500">PDF, JPEG, or PNG (max 10MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, "resellers_certificate")}
                        />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                        <div className="flex items-center">
                          <Check className="w-5 h-5 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-green-800">
                            {uploadedFiles.resellers_certificate.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile("resellers_certificate")}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Business Address Section */}
          <section>
            <div className="flex items-center mb-6 pt-6 border-t border-gray-200">
              <MapPin className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Business Address</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">If not applicable, use your main operating address</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Address Line 1<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    City<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    State<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="e.g., CA, NY, TX"
                    maxLength={2}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Zip Code<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="12345"
                    maxLength={10}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Verification & Referral Section */}
          <section>
            <div className="flex items-center mb-6 pt-6 border-t border-gray-200">
              <Shield className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Verification & Referral</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Upload Proof of Business or Professional License
                </label>
                <p className="text-xs text-gray-600 mb-3">
                  Optional at this stage. Clinics may upload a business permit; individual providers may upload a license or valid ID. Required later to complete your application.
                </p>
                <div className="mt-2">
                  {!uploadedFiles.business_license ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-1 text-sm text-gray-600 font-medium">
                          <span className="text-blue-600">Click to upload</span> or drag files here
                        </p>
                        <p className="text-xs text-gray-500">PDF, JPEG, or PNG (max 10MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, "business_license")}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <Check className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">
                          {uploadedFiles.business_license.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile("business_license")}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Referred by someone? Let us know!<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="referredBy"
                  value={formData.referredBy}
                  onChange={handleInputChange}
                  placeholder="Name or code of the person who referred you"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  placeholder="Comments"
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
                />
              </div>
            </div>
          </section>

          {/* Consent Checkbox */}
          <div className="pt-6 border-t border-gray-200">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                name="marketingConsent"
                checked={formData.marketingConsent}
                onChange={handleInputChange}
                className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
              />
              <span className="ml-3 text-sm text-gray-700">
                By registering, you consent to receive email and/or SMS notifications, alerts, and occasional marketing communication from Alpha BioMed. Message frequency varies. Message & data rates may apply. See our{" "}
                <a href="/terms" className="text-blue-600 hover:underline">Terms & Conditions</a> and{" "}
                <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting Application...
                </span>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </main>
  );
}
