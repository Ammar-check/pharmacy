"use client";
import React, { useState } from 'react';
import supabase from "@/lib/supabase/client";
import { AlertCircle } from 'lucide-react';
import SuccessMessage from './SuccessMessage';

export default function DermatologyForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phoneNumber: '',
    allergies: '',
    specificAddress: '',
    streetAddress: '',
    city: '',
    state: '',
    zip: '',
    deliverTo: '',
    // Topicals
    topical1: false,
    topical2: false,
    topical3: false,
    topical4: false,
    topical5: false,
    topical6: false,
    topical7: false,
    topical8: false,
    topical9: false,
    // Dermatology Notes
    dermaNotesOral: '',
    dermaNotesTopical: '',
    // Notes
    notes: '',
    // Physician
    signature: '',
    prescriberName: '',
    prescriptionDate: '',
    clinicName: '',
    phoneNumberPhysician: '',
    clinicAddress: '',
    clinicCity: '',
    clinicState: '',
    clinicZip: '',
    npi: '',
    dea: '',
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
        body: JSON.stringify({ formType: 'dermatology', formData, email: formData.email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit');
      setShowSuccess(true);
      // Reset form
      setFormData({
        firstName: '', middleName: '', lastName: '', phoneNumber: '', allergies: '',
        specificAddress: '', streetAddress: '', city: '', state: '', zip: '', deliverTo: '',
        topical1: false, topical2: false, topical3: false, topical4: false, topical5: false,
        topical6: false, topical7: false, topical8: false, topical9: false,
        dermaNotesOral: '', dermaNotesTopical: '', notes: '', signature: '',
        prescriberName: '', prescriptionDate: '', clinicName: '', phoneNumberPhysician: '',
        clinicAddress: '', clinicCity: '', clinicState: '', clinicZip: '', npi: '', dea: '', email: ''
      });
    } catch (err) {
      setError(err.message);
      alert('Submission failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 rounded-t-lg shadow-lg overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=1200&auto=format&fit=crop"
            alt="header"
            className="absolute inset-0 w-full h-full object-cover opacity-10"
          />
          <div className="relative flex items-center gap-4">
            <img src="/medconnect logo.webp" alt="MedConnect" className="h-16 w-auto" />
            <div>
              <h1 className="text-2xl font-bold mb-1">DERMATOLOGY PAD</h1>
              <p className="text-sm opacity-90">123 Medical Plaza Drive, Suite 200, Springfield, IL 62701</p>
              <p className="text-sm opacity-90">Ph: (555) 123-4567 | Fax: (555) 765-4321</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-b-lg">
          {/* Patient Section */}
          <div className="p-8 border-b-2 border-gray-100">
            <h2 className="text-xl font-bold text-blue-900 mb-2 pb-2 border-b-2 border-blue-400 text-center">PATIENT</h2>
            <p className="text-sm text-gray-600 mb-6 text-center italic">IMPORTANT PATIENT INFORMATION</p>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Patient's Name *</label>
                  <input
                    type="text"
                    placeholder="First Name"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">&nbsp;</label>
                  <input
                    type="text"
                    placeholder="Middle Name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.middleName}
                    onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">&nbsp;</label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Patient's Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Allergies</label>
                  <input
                    type="text"
                    placeholder="Allergies"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.allergies}
                    onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Patient's Specific Address (DO NOT ENTER CLINIC'S ADDRESS - MAY CAUSE DELAYS) *
                </label>
                <input
                  type="text"
                  placeholder="123 MAIN STREET"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition mb-3"
                  value={formData.specificAddress}
                  onChange={(e) => setFormData({...formData, specificAddress: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Street Address"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.streetAddress}
                    onChange={(e) => setFormData({...formData, streetAddress: e.target.value})}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="City"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <select
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                  >
                    <option value="">Select State</option>
                    {states.map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Zip Code"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.zip}
                    onChange={(e) => setFormData({...formData, zip: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-3">Deliver to: *</label>
                <div className="flex gap-8">
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
                    <span className="text-sm text-gray-700">MD Office</span>
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

          {/* Prescription Section */}
          <div className="p-8 border-b-2 border-gray-100">
            <h2 className="text-xl font-bold text-white bg-gradient-to-r from-green-400 to-green-500 py-3 px-4 rounded-lg text-center mb-6">
              PRESCRIPTION
            </h2>

            <div className="space-y-6">
              <div className="bg-lime-50 border-2 border-lime-300 rounded-lg p-4">
                <h3 className="text-lg font-bold text-black mb-4">TOPICALS / DERMAL COMPOUNDS</h3>
                <p className="text-xs text-gray-700 mb-4 font-semibold">
                  PLEASE ADD QUANTITY WANTED AND DOSING INSTRUCTIONS ON EACH OF THE SELECTED ITEMS BELOW OR SELECT "USE AS DIRECTED"
                </p>

                <div className="space-y-3">
                  <label className="flex items-start p-3 bg-white rounded-lg border border-gray-200 hover:border-lime-400 transition cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-3 mt-1 w-4 h-4 accent-lime-500"
                      checked={formData.topical1}
                      onChange={(e) => setFormData({...formData, topical1: e.target.checked})}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Doak CL/B10 Hydro Dermal Topical Suspension Cream 30mL ($145.00)</p>
                      <p className="text-xs text-gray-600 mt-1">Details about this medication</p>
                    </div>
                  </label>

                  <label className="flex items-start p-3 bg-white rounded-lg border border-gray-200 hover:border-lime-400 transition cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-3 mt-1 w-4 h-4 accent-lime-500"
                      checked={formData.topical2}
                      onChange={(e) => setFormData({...formData, topical2: e.target.checked})}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Lidocaine 23%/ Tetracaine 7% in Lipoderm</p>
                    </div>
                  </label>

                  <label className="flex items-start p-3 bg-white rounded-lg border border-gray-200 hover:border-lime-400 transition cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-3 mt-1 w-4 h-4 accent-lime-500"
                      checked={formData.topical3}
                      onChange={(e) => setFormData({...formData, topical3: e.target.checked})}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Tacrolimus 0.3% / Estriol 0.3% / Vit D 500 IU/gm Lipoderm 30gm ($145.00)</p>
                    </div>
                  </label>

                  <label className="flex items-start p-3 bg-white rounded-lg border border-gray-200 hover:border-lime-400 transition cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-3 mt-1 w-4 h-4 accent-lime-500"
                      checked={formData.topical4}
                      onChange={(e) => setFormData({...formData, topical4: e.target.checked})}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Hydrocortisone 1% / Lidocaine 2% Ointment</p>
                    </div>
                  </label>

                  <label className="flex items-start p-3 bg-white rounded-lg border border-gray-200 hover:border-lime-400 transition cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-3 mt-1 w-4 h-4 accent-lime-500"
                      checked={formData.topical5}
                      onChange={(e) => setFormData({...formData, topical5: e.target.checked})}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Doak PLO/ 40 mg Hydro Dermal Topical Suspension Cream ($155.00)</p>
                    </div>
                  </label>

                  <label className="flex items-start p-3 bg-white rounded-lg border border-gray-200 hover:border-lime-400 transition cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-3 mt-1 w-4 h-4 accent-lime-500"
                      checked={formData.topical6}
                      onChange={(e) => setFormData({...formData, topical6: e.target.checked})}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Niacin/ Caffeine 2%/2% Trans PLO 30ml ($150.00)</p>
                    </div>
                  </label>

                  <label className="flex items-start p-3 bg-white rounded-lg border border-gray-200 hover:border-lime-400 transition cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-3 mt-1 w-4 h-4 accent-lime-500"
                      checked={formData.topical7}
                      onChange={(e) => setFormData({...formData, topical7: e.target.checked})}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Tretinoin 0.05%/30mg/mL (30mL Trans PLO) ($140.00)</p>
                    </div>
                  </label>

                  <label className="flex items-start p-3 bg-white rounded-lg border border-gray-200 hover:border-lime-400 transition cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-3 mt-1 w-4 h-4 accent-lime-500"
                      checked={formData.topical8}
                      onChange={(e) => setFormData({...formData, topical8: e.target.checked})}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Minoxidil 10% Lipoderm</p>
                    </div>
                  </label>

                  <label className="flex items-start p-3 bg-white rounded-lg border border-gray-200 hover:border-lime-400 transition cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-3 mt-1 w-4 h-4 accent-lime-500"
                      checked={formData.topical9}
                      onChange={(e) => setFormData({...formData, topical9: e.target.checked})}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">DERMA CUSTOM (please use DERMA notes to customize)</p>
                    </div>
                  </label>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-black mb-2">
                    DERMA NOTES: ORAL SUSPENSION, (Supp Qty,) & DOSING INSTRUCTIONS (If RX)
                  </label>
                  <textarea
                    rows="3"
                    placeholder="SUGGEST CUSTOM DERMA SUSPENSION TO BE PATIENTS..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition resize-none"
                    value={formData.dermaNotesOral}
                    onChange={(e) => setFormData({...formData, dermaNotesOral: e.target.value})}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold text-black mb-2">
                    DERMA NOTES: TOPICAL DOSING INSTRUCT. & CUSTOM TOPICALS
                  </label>
                  <textarea
                    rows="3"
                    placeholder="INSTRUCTIONS FOR TOPICAL COMPOUNDS"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition resize-none"
                    value={formData.dermaNotesTopical}
                    onChange={(e) => setFormData({...formData, dermaNotesTopical: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">NOTES</label>
                <textarea
                  rows="2"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Physician Section */}
          <div className="p-8">
            <h2 className="text-xl font-bold text-blue-900 mb-6 pb-2 border-b-2 border-blue-400">PHYSICIAN</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Signature or Initials *</label>
                <div className="border-2 border-gray-300 rounded-lg bg-gray-50 h-32 flex items-center justify-center mb-2">
                  <input
                    type="text"
                    required
                    placeholder="Sign Here"
                    className="w-full h-full px-4 bg-transparent text-center font-cursive text-2xl outline-none"
                    value={formData.signature}
                    onChange={(e) => setFormData({...formData, signature: e.target.value})}
                  />
                </div>
                <button type="button" className="text-sm text-blue-600 hover:underline" onClick={() => setFormData({...formData, signature: ''})}>
                  Clear
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Prescriber's Print Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="ONLY AUTHORIZED PRESCRIBER"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.prescriberName}
                    onChange={(e) => setFormData({...formData, prescriberName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.prescriptionDate}
                    onChange={(e) => setFormData({...formData, prescriptionDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Clinic Name * <span className="text-gray-600 text-xs">(NAME MUST MATCH ACCOUNT SETUP)</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  value={formData.clinicName}
                  onChange={(e) => setFormData({...formData, clinicName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Phone Number *</label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  value={formData.phoneNumberPhysician}
                  onChange={(e) => setFormData({...formData, phoneNumberPhysician: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Clinic's Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Street Address"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition mb-3"
                  value={formData.clinicAddress}
                  onChange={(e) => setFormData({...formData, clinicAddress: e.target.value})}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.clinicCity}
                    onChange={(e) => setFormData({...formData, clinicCity: e.target.value})}
                  />
                  <select
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.clinicState}
                    onChange={(e) => setFormData({...formData, clinicState: e.target.value})}
                  >
                    <option value="">State</option>
                    {states.map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Zip Code"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  value={formData.clinicZip}
                  onChange={(e) => setFormData({...formData, clinicZip: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">NPI # *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.npi}
                    onChange={(e) => setFormData({...formData, npi: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">DEA #</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.dea}
                    onChange={(e) => setFormData({...formData, dea: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  E-mail address for a copy for your records *
                </label>
                <input
                  type="email"
                  required
                  placeholder="example@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="px-8 pb-8">
            <button
              disabled={submitting}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-60"
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
          message="Your Dermatology form has been submitted successfully! We will process your request shortly."
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
}