"use client";
import React, { useState } from 'react';
import supabase from "@/lib/supabase/client";
import { AlertCircle } from 'lucide-react';
import SuccessMessage from './SuccessMessage';

export default function PeptidesForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    phone: '',
    allergies: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    billTo: '',
    deliverTo: '',
    medicationDetails: '',
    providerBUD: '',
    patientBUD: '',
    quantity: '',
    refills: '',
    signature: '',
    prescriberName: '',
    prescriberPhone: '',
    prescriptionDate: '',
    clinicName: '',
    npi: '',
    dea: '',
    clinicStreet: '',
    clinicCity: '',
    clinicState: '',
    clinicZip: '',
    email: ''
  });

  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois',
    'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts',
    'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
    'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
    'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        alert('Please sign in to submit the form.');
        window.location.href = '/create-account';
        return;
      }
      const res = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType: 'peptides', formData, email: formData.email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit');
      setShowSuccess(true);
      // Reset form
      setFormData({
        firstName: '', lastName: '', dob: '', phone: '', allergies: '',
        street: '', city: '', state: '', zip: '', billTo: '', deliverTo: '',
        medicationDetails: '', providerBUD: '', patientBUD: '', quantity: '',
        refills: '', signature: '', prescriberName: '', prescriberPhone: '',
        prescriptionDate: '', clinicName: '', npi: '', dea: '',
        clinicStreet: '', clinicCity: '', clinicState: '', clinicZip: '', email: ''
      });
    } catch (err) {
      setError(err.message);
      alert('Submission failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="relative bg-blue-600 text-white p-4 sm:p-6 rounded-t-lg shadow-lg">
          <div className="relative flex flex-col sm:flex-row items-center gap-4">
            <img src="/medconnect logo.webp" alt="MedConnect" className="h-12 sm:h-16 w-auto" />
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold mb-1">PEPTIDES PAD</h1>
              <p className="text-xs sm:text-sm opacity-90">123 Medical Plaza Drive, Suite 200, Springfield, IL 62701</p>
              <p className="text-xs sm:text-sm opacity-90">Ph: (555) 123-4567 | Fax: (555) 765-4321</p>
            </div>
          </div>
        </div>

        {/* Alert */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 flex items-start gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-black">
            <p className="font-semibold mb-1">All fields marked with * are required and must be filled.</p>
            <p className="text-gray-700">Patient specific information is mandatory for processing.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-b-lg overflow-hidden">
          {/* Patient Section */}
          <div className="p-4 sm:p-8 border-b-2 border-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-white bg-blue-600 mb-4 sm:mb-6 px-4 py-3 rounded-lg">PATIENT INFORMATION</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">First Name *</label>
                  <input
                    type="text"
                    placeholder="First Name"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Last Name *</label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Patient's DOB *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(555) 555-5555"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Allergies</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  value={formData.allergies}
                  onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Patient's Specific Address (DO NOT ENTER CLINIC'S ADDRESS) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="123 MAIN STREET"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition mb-3"
                  value={formData.street}
                  onChange={(e) => setFormData({...formData, street: e.target.value})}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                  <select
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                  >
                    <option value="">Select State</option>
                    {states.map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Zip Code"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.zip}
                    onChange={(e) => setFormData({...formData, zip: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-black mb-3">Bill to *</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="billTo"
                        value="clinic"
                        required
                        className="mr-3 w-4 h-4 accent-blue-600"
                        checked={formData.billTo === 'clinic'}
                        onChange={(e) => setFormData({...formData, billTo: e.target.value})}
                      />
                      <span className="text-sm text-gray-700">Clinic</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="billTo"
                        value="patient"
                        required
                        className="mr-3 w-4 h-4 accent-blue-600"
                        checked={formData.billTo === 'patient'}
                        onChange={(e) => setFormData({...formData, billTo: e.target.value})}
                      />
                      <span className="text-sm text-gray-700">Patient</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-3">Deliver to *</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="deliverTo"
                        value="clinic"
                        required
                        className="mr-3 w-4 h-4 accent-blue-600"
                        checked={formData.deliverTo === 'clinic'}
                        onChange={(e) => setFormData({...formData, deliverTo: e.target.value})}
                      />
                      <span className="text-sm text-gray-700">Clinic</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="deliverTo"
                        value="patient"
                        required
                        className="mr-3 w-4 h-4 accent-blue-600"
                        checked={formData.deliverTo === 'patient'}
                        onChange={(e) => setFormData({...formData, deliverTo: e.target.value})}
                      />
                      <span className="text-sm text-gray-700">Patient</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prescription Section */}
          <div className="p-4 sm:p-8 border-b-2 border-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-white bg-blue-600 mb-4 sm:mb-6 px-4 py-3 rounded-lg">PRESCRIPTION</h2>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6 mb-6">
              <p className="text-sm text-gray-700 mb-3">All medications need dosing instructions (Failure to provide instructions will result in delays)</p>
              <p className="text-sm font-semibold text-gray-800 mb-4">PLEASE ADD QUANTITY AND DIRECTIONS IF RX IS NOT "USE AS DIRECTED":</p>

              <textarea
                rows="8"
                placeholder="Enter medication details, dosing instructions, and directions..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
                value={formData.medicationDetails}
                onChange={(e) => setFormData({...formData, medicationDetails: e.target.value})}
              />
            </div>

            {/* CONTROLLED MEDS */}
            <div className="border-2 border-red-400 rounded-xl p-4 sm:p-6 bg-red-50">
              <h3 className="text-base sm:text-lg font-bold text-red-900 mb-4">CONTROLLED MEDS</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Is the PROVIDER "OK" with BUD (Beyond Use Date)?
                  </label>
                  <div className="flex flex-wrap gap-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="providerBUD"
                        value="yes"
                        className="mr-2 w-4 h-4 accent-blue-600"
                        checked={formData.providerBUD === 'yes'}
                        onChange={(e) => setFormData({...formData, providerBUD: e.target.value})}
                      />
                      <span className="text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="providerBUD"
                        value="no"
                        className="mr-2 w-4 h-4 accent-blue-600"
                        checked={formData.providerBUD === 'no'}
                        onChange={(e) => setFormData({...formData, providerBUD: e.target.value})}
                      />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Is the PATIENT "OK" with BUD (Beyond Use Date)?
                  </label>
                  <div className="flex flex-wrap gap-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="patientBUD"
                        value="yes"
                        className="mr-2 w-4 h-4 accent-blue-600"
                        checked={formData.patientBUD === 'yes'}
                        onChange={(e) => setFormData({...formData, patientBUD: e.target.value})}
                      />
                      <span className="text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="patientBUD"
                        value="no"
                        className="mr-2 w-4 h-4 accent-blue-600"
                        checked={formData.patientBUD === 'no'}
                        onChange={(e) => setFormData({...formData, patientBUD: e.target.value})}
                      />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Refills</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.refills}
                    onChange={(e) => setFormData({...formData, refills: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Physician Section */}
          <div className="p-4 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-white bg-blue-600 mb-4 sm:mb-6 px-4 py-3 rounded-lg">PHYSICIAN INFORMATION</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Signature or Initials *</label>
                <div className="border-2 border-gray-300 rounded-lg bg-gray-50 h-24 sm:h-32 flex items-center justify-center mb-2">
                  <input
                    type="text"
                    required
                    placeholder="Sign Here"
                    className="w-full h-full px-4 bg-transparent text-center font-cursive text-xl sm:text-2xl outline-none"
                    value={formData.signature}
                    onChange={(e) => setFormData({...formData, signature: e.target.value})}
                  />
                </div>
                <button type="button" className="text-sm text-blue-600 hover:underline" onClick={() => setFormData({...formData, signature: ''})}>
                  Clear
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Print Name * <span className="text-gray-600 text-xs sm:text-sm">(AUTHORIZED PRESCRIBER ONLY)</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  value={formData.prescriberName}
                  onChange={(e) => setFormData({...formData, prescriberName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(555) 555-5555"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.prescriberPhone}
                    onChange={(e) => setFormData({...formData, prescriberPhone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.prescriptionDate}
                    onChange={(e) => setFormData({...formData, prescriptionDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Clinic Name * <span className="text-gray-600 text-xs sm:text-sm">(NAME MUST MATCH ACCOUNT SETUP)</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  value={formData.clinicName}
                  onChange={(e) => setFormData({...formData, clinicName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">NPI # *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.npi}
                    onChange={(e) => setFormData({...formData, npi: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">DEA #</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.dea}
                    onChange={(e) => setFormData({...formData, dea: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Clinic's Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Street Address"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition mb-3"
                  value={formData.clinicStreet}
                  onChange={(e) => setFormData({...formData, clinicStreet: e.target.value})}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.clinicCity}
                    onChange={(e) => setFormData({...formData, clinicCity: e.target.value})}
                  />
                  <select
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.clinicState}
                    onChange={(e) => setFormData({...formData, clinicState: e.target.value})}
                  >
                    <option value="">State</option>
                    {states.map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Zip Code"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.clinicZip}
                    onChange={(e) => setFormData({...formData, clinicZip: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  E-mail Address for Records Copy *
                </label>
                <input
                  type="email"
                  required
                  placeholder="example@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="px-4 sm:px-8 pb-8">
            <button
              disabled={submitting}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 sm:py-4 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>© 2025 MedConnect. All rights reserved.</p>
        </div>
      </div>

      {/* Success Message Modal */}
      {showSuccess && (
        <SuccessMessage
          message="Your Peptides form has been submitted successfully! We will process your request shortly."
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
}
