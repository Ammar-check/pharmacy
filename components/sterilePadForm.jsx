"use client";
import React, { useState } from 'react';
import supabase from "@/lib/supabase/client";
import { AlertCircle } from 'lucide-react';
import SuccessMessage from './SuccessMessage';

export default function SterileCompoundForm() {
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
    medicationSelections: [],
    medicationNotes: '',
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

  const sterileMedicationOptions = [
    'Ascorbic Acid 500 mg/mL MDV 100mL ($250)',
    'Acetylcysteine 200 mg/mL MDV 30mL ($105)',
    'Amino Acid Blend PF 30mL ($95)',
    'B-Complex (+MethylB12) MDV 30mL ($95)',
    'Biotin 10 mg/mL MDV 30mL ($135)',
    'Estradiol 5mg/mL MDV 3mL ($85)',
    'Glutathione 200 mg/mL MDV 5mL ($215)',
    'Glutamine(L) 30 mg/mL MDV 30mL ($105.00)',
    'Hydroxocobalamin 2 mg/mL MDV 30mL ($205.00)',
    'L-Carnitine 100 mg/mL MDV (30mL) ($80.00)',
    'Lipo-Trim MDV 10mL ($65.00)',
    'Mag. Chloride 200 mg/mL MDV 30mL ($95.00)',
    'Methylcobalamin 10 mg/mL MDV 10mL ($65.00)',
    "Myers' Cocktail MDV 30mL ($175.00)",
    'Nandrolone Dec 200 mg/mL MDV 10mL ($95.00)',
    'Progesterone 200mg (Free Capsules) (#30 $65.00 / #90 $135.00)',
    'Trace Elements-5 MDV 10mL $60.00',
    'Vitamin D3 (MCT Oil) 100,000 iu/mL MDV 10mL ($85.00)',
    "SELECT HERE TO ADD MANUAL RX'S BELOW",
    'Ascorbic Acid 500 mg/mL MDV 10mL ($65)',
    'Acetyl-L-Carnitine 200 mg/mL MDV 30mL ($105)',
    'B-Complex/Lidocaine/Methylfolate MDV 10mL ($75)',
    'B-Complex (+MethylB12) MDV 10mL ($65)',
    'EDTA Disodium 150 mg/mL MDV 100mL ($95)',
    'Estradiol Cypionate 5 mg/mL MDV 3mL ($75.00)',
    'Glutathione 200 mg/mL MDV 3mL ($130)',
    'Glycine 50 mg/mL MDV 30mL ($85.00)',
    'Ketamine 100 mg/mL MDV 3mL ($85.00)',
    'Lipo-Trim MDV 30mL ($95.00)',
    'Lysine(L) 200 mg/mL MDV 30mL ($80.00)',
    'Methylcobalamin 10 mg/mL MDV 30mL ($125.00)',
    "Myers' Cocktail MDV 10mL ($125.00)",
    'NAD+ 200 mg/mL MDV 10mL ($125.00)',
    'Oxandrolone 50mg Troche ($8.00/troche) (Needs QTY in comments)',
    'Pyridoxine (VitB6)/Lidocaine 50mg-2mg/mL MDV 10mL ($65.00)',
    'Taurine 50mg/mL MDV 30mL ($105.00)',
    'Zinc Sulfate 10 mg/mL MDV 30mL ($115.00)'
  ];

  const toggleMedicationSelection = (value) => {
    setFormData((prev) => {
      const exists = prev.medicationSelections.includes(value);
      return {
        ...prev,
        medicationSelections: exists
          ? prev.medicationSelections.filter((item) => item !== value)
          : [...prev.medicationSelections, value]
      };
    });
  };

  const renderMedicationOptions = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {sterileMedicationOptions.map((option) => {
        const selected = formData.medicationSelections.includes(option);
        return (
          <label
            key={option}
            className={`flex items-start gap-3 rounded-xl border p-4 text-sm transition shadow-sm ${
              selected ? 'border-lime-400 bg-lime-50' : 'border-blue-100 bg-white'
            }`}
          >
            <span className={`mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 ${
              selected ? 'border-lime-500 text-lime-600 bg-white' : 'border-blue-200 text-blue-500 bg-blue-50'
            }`}>
              {selected ? '✓' : '+'}
            </span>
            <div className="flex-1">
              <span className="text-gray-800 leading-relaxed block font-semibold">{option}</span>
            </div>
            <input
              type="checkbox"
              className="sr-only"
              checked={selected}
              onChange={() => toggleMedicationSelection(option)}
            />
          </label>
        );
      })}
    </div>
  );

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
        body: JSON.stringify({ formType: 'sterile', formData, email: formData.email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit');
      setShowSuccess(true);
      // Reset form
      setFormData({
        firstName: '', lastName: '', dob: '', phone: '', allergies: '',
        street: '', city: '', state: '', zip: '', billTo: '', deliverTo: '',
        medicationSelections: [], medicationNotes: '', providerBUD: '', patientBUD: '', quantity: '',
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
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-3xl shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-blue-700/30"></div>
          <div className="relative flex items-center gap-4 px-8 py-6">
            <img src="/medconnect logo.webp" alt="MedConnect" className="h-16 w-auto" />
            <div>
              <h1 className="text-2xl font-bold mb-1">STERILE COMPOUND PAD</h1>
              <p className="text-sm opacity-90">123 Medical Plaza Drive, Suite 200, Springfield, IL 62701</p>
              <p className="text-sm opacity-90">Ph: (555) 123-4567 | Fax: (555) 765-4321</p>
            </div>
          </div>
        </div>

        {/* Alert */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 flex items-start gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-black">
            <p className="font-semibold mb-1">All fields marked with * are required and must be filled.</p>
            <p className="text-gray-700">Patient specific information is mandatory for processing.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-b-lg">
          {/* Patient Section */}
          <div className="p-8 border-b-2 border-gray-100">
            <h2 className="text-xl font-bold text-blue-900 mb-2 pb-2 border-b-2 border-blue-400">PATIENT</h2>
            <p className="text-sm text-gray-600 mb-6">Patient specific information.</p>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Patient's Name *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="FIRST NAME"
                        required
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition font-semibold text-sm uppercase"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      />
                      <p className="text-xs text-gray-500 mt-1">First Name</p>
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="LAST NAME"
                        required
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition font-semibold text-sm uppercase"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      />
                      <p className="text-xs text-gray-500 mt-1">Last Name</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Patient's DOB *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition font-semibold text-sm"
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Patient's Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="(000) 000-0000"
                    required
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition font-semibold text-sm"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-1">Please enter a valid phone number.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Allergies</label>
                  <input
                    type="text"
                    placeholder="LIST ANY ALLERGIES"
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition font-semibold text-sm uppercase"
                    value={formData.allergies}
                    onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                  Patient's Specific Address (Not The Clinic's) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="# STREET NAME"
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition font-semibold text-sm uppercase mb-2"
                  value={formData.street}
                  onChange={(e) => setFormData({...formData, street: e.target.value})}
                />
                <p className="text-xs text-gray-500 mb-4">Example: 123 MAIN STREET</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="CITY NAME"
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition font-semibold text-sm uppercase"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                    <p className="text-xs text-gray-500 mt-1">Example: AUSTIN</p>
                  </div>
                  <div>
                    <select
                      required
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition font-semibold text-sm"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                    >
                      <option value="">Please Select</option>
                      {states.map(state => <option key={state} value={state}>{state}</option>)}
                    </select>
                  </div>
                </div>
                <input
                  type="text"
                  required
                  placeholder="NUMBERS ONLY"
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition font-semibold text-sm uppercase"
                  value={formData.zip}
                  onChange={(e) => setFormData({...formData, zip: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">Example: 78660</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Bill to: *</label>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${formData.billTo === 'clinic' ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-blue-200 bg-white text-gray-700'}`}>
                      <input 
                        type="radio" 
                        name="billTo" 
                        value="clinic" 
                        required
                        className="h-4 w-4 accent-blue-600"
                        checked={formData.billTo === 'clinic'}
                        onChange={(e) => setFormData({...formData, billTo: e.target.value})}
                      />
                      <span>MD Office</span>
                    </label>
                    <label className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${formData.billTo === 'patient' ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-blue-200 bg-white text-gray-700'}`}>
                      <input 
                        type="radio" 
                        name="billTo" 
                        value="patient" 
                        required
                        className="h-4 w-4 accent-blue-600"
                        checked={formData.billTo === 'patient'}
                        onChange={(e) => setFormData({...formData, billTo: e.target.value})}
                      />
                      <span>Patient</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Deliver to: *</label>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${formData.deliverTo === 'clinic' ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-blue-200 bg-white text-gray-700'}`}>
                      <input 
                        type="radio" 
                        name="deliverTo" 
                        value="clinic" 
                        required
                        className="h-4 w-4 accent-blue-600"
                        checked={formData.deliverTo === 'clinic'}
                        onChange={(e) => setFormData({...formData, deliverTo: e.target.value})}
                      />
                      <span>MD Office</span>
                    </label>
                    <label className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${formData.deliverTo === 'patient' ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-blue-200 bg-white text-gray-700'}`}>
                      <input 
                        type="radio" 
                        name="deliverTo" 
                        value="patient" 
                        required
                        className="h-4 w-4 accent-blue-600"
                        checked={formData.deliverTo === 'patient'}
                        onChange={(e) => setFormData({...formData, deliverTo: e.target.value})}
                      />
                      <span>Patient</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sterile Compounded Products Section */}
          <div className="p-8 border-b-2 border-gray-100">
            <div className="relative mb-6 text-center">
              <span className="inline-block bg-lime-500 text-white font-bold uppercase tracking-[0.3em] px-6 py-3 rounded-full shadow-md">Sterile Compounded Products Rx</span>
            </div>

            <div className="space-y-8">
              <p className="text-sm font-semibold text-gray-700 text-center md:text-left">
                All medications need dosing instructions (Failure to provide instructions will result in delays)
              </p>

              {renderMedicationOptions()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                <p>Please add quantity and directions if RX is not "Use As Directed"</p>
                <p className="md:text-right">***When shipping to patient: All options need specific dosing instructions***</p>
              </div>

              <textarea
                rows={5}
                placeholder="***WHEN SHIPPING TO PATIENT: ALL OPTIONS NEED SPECIFIC DOSING INSTRUCTIONS***"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none text-sm"
                value={formData.medicationNotes}
                onChange={(e) => setFormData({...formData, medicationNotes: e.target.value})}
              />
            </div>
          </div>

          {/* CONTROLLED MEDS */}
          <div className="border-2 border-red-300 rounded-2xl p-6 bg-red-50 space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h3 className="text-lg font-bold text-red-900 uppercase tracking-wide">Controlled Meds</h3>
              <p className="text-sm text-red-800 uppercase">
                Options have been moved to a new pad:
                {' '}
                <a
                  href="https://form.jotform.com/242412737631150"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-700 lowercase"
                >
                  https://form.jotform.com/242412737631150
                </a>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-red-900 uppercase">
                  Is the Provider "OK" with BUD (Beyond Use Date)?
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:border-red-400 focus:ring-2 focus:ring-red-200 outline-none transition"
                  value={formData.providerBUD}
                  onChange={(e) => setFormData({...formData, providerBUD: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-red-900 uppercase">
                  Is the Patient "OK" with BUD (Beyond Use Date)?
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:border-red-400 focus:ring-2 focus:ring-red-200 outline-none transition"
                  value={formData.patientBUD}
                  onChange={(e) => setFormData({...formData, patientBUD: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-red-900 uppercase">Quantity</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:border-red-400 focus:ring-2 focus:ring-red-200 outline-none transition"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-red-900 uppercase">Refills</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:border-red-400 focus:ring-2 focus:ring-red-200 outline-none transition"
                  value={formData.refills}
                  onChange={(e) => setFormData({...formData, refills: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Physician Section */}
          <div className="p-8">
            <h2 className="text-xl font-bold text-blue-900 mb-6 pb-2 border-b-2 border-blue-400 uppercase tracking-wide">Physician</h2>
            
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase">Signature or Initials *</label>
                <div className="border-2 border-blue-200 rounded-xl bg-blue-50 h-36 flex items-center justify-center mb-2">
                  <input
                    type="text"
                    required
                    placeholder="Sign Here"
                    className="w-full h-full px-4 bg-transparent text-center font-cursive text-3xl text-blue-700 outline-none"
                    value={formData.signature}
                    onChange={(e) => setFormData({...formData, signature: e.target.value})}
                  />
                </div>
                <button type="button" className="text-sm text-blue-600 hover:underline" onClick={() => setFormData({...formData, signature: ''})}>
                  Clear
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase">
                  Print Name * <span className="text-gray-500 normal-case">(Authorized Prescriber Only)</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  value={formData.prescriberName}
                  onChange={(e) => setFormData({...formData, prescriberName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(000) 000-0000"
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.prescriberPhone}
                    onChange={(e) => setFormData({...formData, prescriberPhone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase">Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.prescriptionDate}
                    onChange={(e) => setFormData({...formData, prescriptionDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase">
                  Clinic (Name Must Match Account Setup - May Cause Delays Otherwise) *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  value={formData.clinicName}
                  onChange={(e) => setFormData({...formData, clinicName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase">NPI # *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.npi}
                    onChange={(e) => setFormData({...formData, npi: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase">DEA #</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.dea}
                    onChange={(e) => setFormData({...formData, dea: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase">Clinic's Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Street Address"
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition mb-3"
                  value={formData.clinicStreet}
                  onChange={(e) => setFormData({...formData, clinicStreet: e.target.value})}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.clinicCity}
                    onChange={(e) => setFormData({...formData, clinicCity: e.target.value})}
                  />
                  <select
                    required
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
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
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.clinicZip}
                    onChange={(e) => setFormData({...formData, clinicZip: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase">
                  Enter E-mail address for a copy for your records *
                </label>
                <input
                  type="email"
                  required
                  placeholder="example@example.com"
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
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
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-4 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-60"
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
          message="Your Sterile Compound form has been submitted successfully! We will process your request shortly."
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
}