"use client";
import React, { useState } from 'react';
import supabase from "@/lib/supabase/client";
import { AlertCircle } from 'lucide-react';
import SuccessMessage from './SuccessMessage';

export default function ControlsForm() {
  const [formData, setFormData] = useState({
    // Patient
    firstName: '',
    lastName: '',
    dob: '',
    phoneNumber: '',
    allergies: '',
    specificAddress: '',
    streetAddress: '',
    city: '',
    state: '',
    zip: '',
    deliverTo: '',
    // Controlled Medications - Creams
    creamNotes: '',
    // Testosterone Creams
    testoCream1: false,
    testoCream2: false,
    testoCream3: false,
    testoCream4: false,
    testoCream5: false,
    testoCream6: false,
    testoCream7: false,
    testoCream8: false,
    testoCream9: false,
    testoCream10: false,
    testoCream11: false,
    testoCream12: false,
    testoCream13: false,
    testoCream14: false,
    testoCream15: false,
    testoCream16: false,
    testoCream17: false,
    testoCream18: false,
    testoCream19: false,
    testoCream20: false,
    testoCream21: false,
    testoCream22: false,
    testoCream23: false,
    testoCream24: false,
    testoCream25: false,
    testoCream26: false,
    otherCompounds: '',
    // Ketamine
    ketamineNasal: false,
    ketamineTroches1: false,
    ketamineTroches2: false,
    ketamineTroches3: false,
    // Dosing Instructions
    dosingInstructions: '',
    dosingRefills: '',
    dosingQuantity: '',
    // Physician
    signature: '',
    prescriberName: '',
    dea: '',
    npi: '',
    dispensingMD1: '',
    dispensingMD2: '',
    dispensingMD3: '',
    dispensingMD4: '',
    clinicName: '',
    phoneNumberPhysician: '',
    clinicAddress: '',
    city2: '',
    state2: '',
    zip2: '',
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

  const testosteroneCreams = [
    { key: 'testoCream1', label: 'Test - Testosterone Cypionate 50 mg/mL (MCT Oil, MDV 10mL, $45.00)' },
    { key: 'testoCream2', label: 'Test - Testosterone Cypionate 100 mg/mL (MCT Oil, MDV 10mL, $45.00)' },
    { key: 'testoCream3', label: 'Test - Testosterone Cypionate 150 mg/mL (MCT Oil, MDV 10mL, $50.00)' },
    { key: 'testoCream4', label: 'Test - Testosterone Cypionate 200 mg/mL (MCT Oil, MDV 10mL, $50.00)' },
    { key: 'testoCream5', label: 'Test - Testosterone Enanthate 100 mg/mL (MCT Oil, MDV 10mL, $45.00)' },
    { key: 'testoCream6', label: 'Test - Testosterone Enanthate 200 mg/mL (MCT Oil, MDV 10mL, $50.00)' },
    { key: 'testoCream7', label: 'Test - Testosterone Cypionate 25 mg/mL (MCT Oil, UDV 5mL, $50.00)' },
    { key: 'testoCream8', label: 'Test - Testosterone Cypionate 50 mg/mL (MCT Oil, UDV 5mL, $50.00)' },
    { key: 'testoCream9', label: 'Test - Testosterone Cypionate 100 mg/mL (MCT Oil, UDV 5mL, $55.00)' },
    { key: 'testoCream10', label: 'Test - Testosterone Enanthate 100 mg/mL (MCT Oil, UDV 5mL, $55.00)' },
    { key: 'testoCream11', label: 'Test - Testosterone Cypionate 150 mg/mL (MCT Oil, UDV 5mL, $55.00)' },
    { key: 'testoCream12', label: 'Test - Testosterone Cypionate 200 mg/mL (MCT Oil, UDV 5mL, $55.00)' },
    { key: 'testoCream13', label: 'Test - Testosterone Enanthate 200 mg/mL (MCT Oil, UDV 5mL, $55.00)' },
    { key: 'testoCream14', label: 'Test - Testosterone Cypionate 100 mg/mL (GSO, MDV 10mL, $40.00)' },
    { key: 'testoCream15', label: 'Test - Testosterone Cypionate 150 mg/mL (GSO, MDV 10mL, $40.00)' },
    { key: 'testoCream16', label: 'Test - Testosterone Cypionate 200 mg/mL (GSO, MDV 10mL, $40.00)' },
    { key: 'testoCream17', label: 'Test - Testosterone Enanthate 100 mg/mL (GSO, MDV 10mL, $40.00)' },
    { key: 'testoCream18', label: 'Test - Testosterone Enanthate 200 mg/mL (GSO, MDV 10mL, $40.00)' },
    { key: 'testoCream19', label: 'Test - Testosterone Cypionate 100 mg/mL (Castor-Grapeseed Oil, MDV 10mL, $50.00)' },
    { key: 'testoCream20', label: 'Test - Testosterone Cypionate 150 mg/mL (Castor-Grapeseed Oil, MDV 10mL, $55.00)' },
    { key: 'testoCream21', label: 'Test - Testosterone Cypionate 200 mg/mL (Castor-Grapeseed Oil, MDV 10mL, $55.00)' },
    { key: 'testoCream22', label: 'Test - Testosterone Enanthate 100 mg/mL (Castor-Grapeseed Oil, MDV 10mL, $50.00)' },
    { key: 'testoCream23', label: 'Test - Testosterone Enanthate 200 mg/mL (Castor-Grapeseed Oil, MDV 10mL, $55.00)' },
    { key: 'testoCream24', label: 'Test - Testosterone Cypionate 200 mg/mL w/ Lido 20mg/mL (MCT Oil, UDV 5mL, $65.00)' },
    { key: 'testoCream25', label: 'Test - Testosterone Cypionate 200 mg/mL w/ Lidocaine 20mg/mL (MCT Oil, MDV 10mL, $60.00)' },
    { key: 'testoCream26', label: 'Test - Testosterone Cypionate 100mg/Anastrazole 0.5mg: 1mg Troche, (MCT 20ct, $65.00)' },
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
        body: JSON.stringify({ formType: 'controls', formData, email: formData.email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit');
      setShowSuccess(true);
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
            src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1200&auto=format&fit=crop"
            alt="header"
            className="absolute inset-0 w-full h-full object-cover opacity-10"
          />
          <div className="relative flex items-center gap-4">
            <img src="/medconnect logo.webp" alt="MedConnect" className="h-16 w-auto" />
            <div>
              <h1 className="text-2xl font-bold mb-1">CONTROLS PAD</h1>
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
            <p className="text-sm text-gray-600 mb-6 text-center italic">FAILURE TO PROVIDE PATIENT'S SPECIFIC INFORMATION WILL BE REJECTED OR CAUSE SIGNIFICANT PRESCRIPTION DELAYS</p>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="block text-sm font-semibold text-black mb-2">Patient's DOB *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Last Name"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
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
                <label className="block text-sm font-semibold text-black mb-2">
                  Patient's Specific Address (DO NOT ENTER CLINIC'S ADDRESS - WILL BE REJECTED) *
                </label>
                <input
                  type="text"
                  placeholder="EXAMPLE: 123 MAIN STREET"
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
                  <select
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                  >
                    <option value="">Please Select</option>
                    {states.map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="EXAMPLE: 78660"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  value={formData.zip}
                  onChange={(e) => setFormData({...formData, zip: e.target.value})}
                />
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

          {/* Controlled Medications Section */}
          <div className="p-8 border-b-2 border-gray-100">
            <h2 className="text-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 py-3 px-4 rounded-lg text-center mb-6">
              CONTROLLED MEDICATIONS
            </h2>

            <p className="text-center font-bold text-red-600 mb-6">
              ***ATTENTION: 16ML VIALS ARE NO LONGER BEING COMPOUNDED***
            </p>

            {/* Testosterone Creams */}
            <div className="bg-lime-50 border-2 border-lime-300 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-white bg-gradient-to-r from-lime-400 to-lime-500 py-2 px-4 rounded-lg text-center mb-4">
                TESTOSTERONE CREAMS
              </h3>

              <p className="text-xs text-gray-700 mb-4 font-semibold">
                PLEASE USE THE FOLLOWING TO SELECT TESTOSTERONE CREAMS ONLY. COMPOUNDS MUST HAVE THE FOLLOWING:
              </p>
              <p className="text-xs text-gray-700 mb-2">STRENGTH</p>
              <p className="text-xs text-gray-700 mb-2">QUANTITY (BOTH IN WORDS AND NUMBERS)</p>
              <p className="text-xs text-gray-700 mb-4">DAY SUPPLY</p>
              <p className="text-xs text-gray-700 mb-4 font-semibold">TESTOSTERONE CREAM BUCKET:</p>

              <textarea
                rows="3"
                placeholder="Enter custom cream notes..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition resize-none mb-4"
                value={formData.creamNotes}
                onChange={(e) => setFormData({...formData, creamNotes: e.target.value})}
              />

              <div className="space-y-2">
                {testosteroneCreams.map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-start p-2 bg-white rounded-lg border border-gray-200 hover:border-lime-400 transition cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="mr-3 mt-1 w-4 h-4 accent-lime-500"
                      checked={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                    />
                    <span className="text-xs text-gray-800">{label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-black mb-2">
                  OTHER (IF OTHER NEEDED COMPOUNDS/INSTRUCTIONS)
                </label>
                <textarea
                  rows="3"
                  placeholder="Enter other compounds or special instructions..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition resize-none"
                  value={formData.otherCompounds}
                  onChange={(e) => setFormData({...formData, otherCompounds: e.target.value})}
                />
              </div>
            </div>

            {/* Ketamine Section */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-blue-900 mb-4 text-center">
                KETAMINE ON DUTY / CONTROLS NASAL SPRAY
              </h3>
              <p className="text-xs text-center text-gray-700 mb-4">
                WRITE DOSING INSTRUCTIONS
              </p>

              <div className="space-y-3">
                <label className="flex items-start p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 transition cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="mr-3 mt-1 w-4 h-4 accent-blue-500"
                    checked={formData.ketamineNasal}
                    onChange={(e) => setFormData({...formData, ketamineNasal: e.target.checked})}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">50mL NASAL SPRAY</p>
                    <p className="text-xs text-gray-600">Cephalon 50-100mg per 0.1mL Spray</p>
                  </div>
                </label>

                <label className="flex items-start p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 transition cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="mr-3 mt-1 w-4 h-4 accent-blue-500"
                    checked={formData.ketamineTroches1}
                    onChange={(e) => setFormData({...formData, ketamineTroches1: e.target.checked})}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">100mg per ea Nasal Spray</p>
                  </div>
                </label>

                <label className="flex items-start p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 transition cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="mr-3 mt-1 w-4 h-4 accent-blue-500"
                    checked={formData.ketamineTroches2}
                    onChange={(e) => setFormData({...formData, ketamineTroches2: e.target.checked})}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">50mg per 0.1mL Nasal Spray</p>
                  </div>
                </label>

                <label className="flex items-start p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 transition cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="mr-3 mt-1 w-4 h-4 accent-blue-500"
                    checked={formData.ketamineTroches3}
                    onChange={(e) => setFormData({...formData, ketamineTroches3: e.target.checked})}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Ketamine 100mg Troche</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Dosing Instructions Box */}
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">DOSING INSTRUCTIONS BOX</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      WRITE INSTRUCTIONS "OR" WITH BUD (Beyond Use Date) *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter dosing instructions"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                      value={formData.dosingInstructions}
                      onChange={(e) => setFormData({...formData, dosingInstructions: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      IS THE PATIENT "OK" WITH BUD (Beyond Use Date)
                    </label>
                    <input
                      type="text"
                      placeholder="Yes/No"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                      value={formData.dosingRefills}
                      onChange={(e) => setFormData({...formData, dosingRefills: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Quantity</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.dosingQuantity}
                    onChange={(e) => setFormData({...formData, dosingQuantity: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Refills</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.refills}
                    onChange={(e) => setFormData({...formData, refills: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Physician Section */}
          <div className="p-8">
            <h2 className="text-xl font-bold text-blue-900 mb-6 pb-2 border-b-2 border-blue-400">PHYSICIAN</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Prescriber's Print Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.prescriberName}
                    onChange={(e) => setFormData({...formData, prescriberName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">DEA # *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.dea}
                    onChange={(e) => setFormData({...formData, dea: e.target.value})}
                  />
                </div>
              </div>

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
                <label className="block text-sm font-semibold text-black mb-2">Dispensing MD's info *</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.dispensingMD1}
                    onChange={(e) => setFormData({...formData, dispensingMD1: e.target.value})}
                  />
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.dispensingMD2}
                    onChange={(e) => setFormData({...formData, dispensingMD2: e.target.value})}
                  />
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.dispensingMD3}
                    onChange={(e) => setFormData({...formData, dispensingMD3: e.target.value})}
                  />
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.dispensingMD4}
                    onChange={(e) => setFormData({...formData, dispensingMD4: e.target.value})}
                  />
                </div>
              </div>

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

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Clinic Name * <span className="text-gray-600 text-xs">(NAME MUST MATCH ACCOUNT SETUP - MAY CAUSE DELAYS OTHERWISE)</span>
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
                    value={formData.city2}
                    onChange={(e) => setFormData({...formData, city2: e.target.value})}
                  />
                  <select
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.state2}
                    onChange={(e) => setFormData({...formData, state2: e.target.value})}
                  >
                    <option value="">Please Select</option>
                    {states.map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Zip Code"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  value={formData.zip2}
                  onChange={(e) => setFormData({...formData, zip2: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Enter E-mail address for a copy for your records *
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
          message="Your Controls form has been submitted successfully! We will process your request shortly."
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
}    