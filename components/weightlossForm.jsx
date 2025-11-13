"use client";
import React, { useState } from 'react';
import supabase from "@/lib/supabase/client";
import { Calendar, AlertCircle } from 'lucide-react';
import SuccessMessage from './SuccessMessage';

export default function WeightLossForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dobMonth: '',
    dobDay: '',
    dobYear: '',
    phone: '',
    allergies: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    billTo: '',
    deliverTo: '',
    medicalNecessity: '',
    customNotes: '',
    semaglutideVialSelections: [],
    semaglutideRdtSelections: [],
    tirzepatideVialSelections: [],
    tirzepatide20Selections: [],
    tirzepatide30Selections: [],
    commonlyPrescribedSelections: [],
    refills: '',
    signature: '',
    prescriberName: '',
    prescriptionDate: '',
    clinicName: '',
    clinicPhone: '',
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

  const newCompoundPlan = [
    'Week 1: Inject 0.6mg subcutaneously once a day',
    'Week 2: Inject 1.2mg subcutaneously once a day',
    'Week 3: Inject 1.8mg subcutaneously once a day',
    'Week 4: Inject 2.4mg subcutaneously once a day',
    'Week 5: Inject 3mg subcutaneously once a day',
    'Maintenance Dose: 3mg subcutaneously once a day'
  ];

  const semaglutideVialOptions = [
    {
      value: 'Semaglutide/Pyridoxine 1mg-8mg/mL (1mL) 1mg vial',
      primary: 'Semaglutide/Pyridoxine 1mg-8mg/mL (1mL)',
      secondary: '1mg vial'
    },
    {
      value: 'Semaglutide/Pyridoxine 2mg-8mg/mL (1mL) 2mg vial',
      primary: 'Semaglutide/Pyridoxine 2mg-8mg/mL (1mL)',
      secondary: '2mg vial'
    },
    {
      value: 'Semaglutide/Pyridoxine 4mg-8mg/mL (1mL) 4mg vial',
      primary: 'Semaglutide/Pyridoxine 4mg-8mg/mL (1mL)',
      secondary: '4mg vial'
    },
    {
      value: 'Semaglutide/Pyridoxine 4mg-8mg/mL (2mL) 8mg vial',
      primary: 'Semaglutide/Pyridoxine 4mg-8mg/mL (2mL)',
      secondary: '8mg vial'
    },
    {
      value: 'Semaglutide/Pyridoxine 5mg-8mg/mL (2mL) 10mg vial',
      primary: 'Semaglutide/Pyridoxine 5mg-8mg/mL (2mL)',
      secondary: '10mg vial'
    },
    {
      value: '12 Week Special Supply - Semaglutide/Pyridoxine 2.5mg-8mg/mL (5mL) 12.5mg vial',
      primary: '12 Week Special Supply - Semaglutide/Pyridoxine 2.5mg-8mg/mL (5mL)',
      secondary: '12.5mg vial'
    },
    {
      value: '(Dispensed as #3 2mL VIALS - 30mg) - Semaglutide/Pyridoxine 5mg-8mg/mL',
      primary: '(Dispensed as #3 2mL VIALS - 30mg) - Semaglutide/Pyridoxine 5mg-8mg/mL'
    }
  ];

  const semaglutideRdtOptions = [
    {
      value: 'Semaglutide/Pyridoxine 0.6mg-10mg RDT (8 Week Supply - 40 Tabs) $280.00',
      primary: 'Semaglutide/Pyridoxine 0.6mg-10mg RDT (8 Week Supply - 40 Tabs) $280.00',
      description:
        'Sig: Dissolve 1 tablet under the tongue twice weekly for Weeks 1 and 2, then dissolve 2 tablets under the tongue twice weekly (Weeks 3 and 4), then dissolve 3 tablets under the tongue twice weekly (Weeks 5 and 6), then dissolve 4 tablets under the tongue twice weekly (Weeks 7 and 8)'
    },
    {
      value: 'Semaglutide/B6 3.6mg-10mg RDT (4 Week Supply) $225.00',
      primary: 'Semaglutide/B6 3.6mg-10mg RDT (4 Week Supply) $225.00',
      description:
        'Sig: Dissolve 1 tablet under the tongue twice weekly for 4 weeks'
    }
  ];

  const tirzepatideVialOptions = [
    {
      value: 'Tirzepatide/pyridoxine 10mg-8mg/mL (1mL) 10mg vial',
      primary: 'Tirzepatide/pyridoxine 10mg-8mg/mL (1mL)',
      secondary: '10mg vial'
    },
    {
      value: 'Tirzepatide/pyridoxine 10mg-4mg/0.5mL (1mL) 20mg vial',
      primary: 'Tirzepatide/pyridoxine 10mg-4mg/0.5mL (1mL)',
      secondary: '20mg vial'
    },
    {
      value: 'Tirzepatide/pyridoxine 10mg-8mg/mL (3mL) 30mg vial',
      primary: 'Tirzepatide/pyridoxine 10mg-8mg/mL (3mL)',
      secondary: '30mg vial'
    },
    {
      value: 'Tirzepatide/pyridoxine 10mg-4mg/0.5mL (2mL) 40mg vial',
      primary: 'Tirzepatide/pyridoxine 10mg-4mg/0.5mL (2mL)',
      secondary: '40mg vial'
    },
    {
      value: 'Tirzepatide/pyridoxine 15mg-4mg/0.5mL (2mL) 60mg vial',
      primary: 'Tirzepatide/pyridoxine 15mg-4mg/0.5mL (2mL)',
      secondary: '60mg vial'
    },
    {
      value: 'Tirzepatide/pyridoxine 10mg-4mg/0.5mL (6mL) 120mg vial',
      primary: 'Tirzepatide/pyridoxine 10mg-4mg/0.5mL (6mL)',
      secondary: '120mg vial'
    },
    {
      value: '(Dispensed as #3 2mL Vials - 180mg) - Tirzepatide/pyridoxine 15mg-4mg/0.5mL',
      primary: '(Dispensed as #3 2mL Vials - 180mg) - Tirzepatide/pyridoxine 15mg-4mg/0.5mL'
    }
  ];

  const tirzepatide20Options = [
    { value: 'Tirzepatide/Semaglutide 2mg/0.2mg = 10 units SQ weekly', primary: 'Tirzepatide/Semaglutide 2mg/0.2mg', secondary: '= 10 units SQ weekly' },
    { value: 'Tirzepatide/Semaglutide 4mg/0.4mg = 20 units SQ weekly', primary: 'Tirzepatide/Semaglutide 4mg/0.4mg', secondary: '= 20 units SQ weekly' },
    { value: 'Tirzepatide/Semaglutide 6mg/0.6mg = 30 units SQ weekly', primary: 'Tirzepatide/Semaglutide 6mg/0.6mg', secondary: '= 30 units SQ weekly' },
    { value: 'Tirzepatide/Semaglutide 8mg/0.8mg = 40 units SQ weekly', primary: 'Tirzepatide/Semaglutide 8mg/0.8mg', secondary: '= 40 units SQ weekly' },
    { value: 'Tirzepatide/Semaglutide 10mg/1mg = 50 units SQ weekly', primary: 'Tirzepatide/Semaglutide 10mg/1mg', secondary: '= 50 units SQ weekly' }
  ];

  const tirzepatide30Options = [
    { value: 'Tirzepatide/Semaglutide 3mg/0.5mg = 10 units SQ weekly', primary: 'Tirzepatide/Semaglutide 3mg/0.5mg', secondary: '= 10 units SQ weekly' },
    { value: 'Tirzepatide/Semaglutide 6mg/1mg = 20 units SQ weekly', primary: 'Tirzepatide/Semaglutide 6mg/1mg', secondary: '= 20 units SQ weekly' },
    { value: 'Tirzepatide/Semaglutide 9mg/1.5mg = 30 units SQ weekly', primary: 'Tirzepatide/Semaglutide 9mg/1.5mg', secondary: '= 30 units SQ weekly' },
    { value: 'Tirzepatide/Semaglutide 12mg/2mg = 40 units SQ weekly', primary: 'Tirzepatide/Semaglutide 12mg/2mg', secondary: '= 40 units SQ weekly' },
    { value: 'Tirzepatide/Semaglutide 13.2mg/2.2mg = 44 units SQ weekly', primary: 'Tirzepatide/Semaglutide 13.2mg/2.2mg', secondary: '= 44 units SQ weekly' }
  ];

  const commonlyPrescribedOptions = [
    { value: 'Cagrilintide 5mg/mL MDV (2mL -10mg vial)', primary: 'Cagrilintide 5mg/mL MDV (2mL -10mg vial)' },
    { value: 'Lipo-Trim MDV 10mL', primary: 'Lipo-Trim MDV 10mL' },
    { value: 'Lipo-Trim MDV 30mL', primary: 'Lipo-Trim MDV 30mL' },
    { value: 'Zofran 4mg (ODT) ($1.00/ODT) Minimum 10 Tabs', primary: 'Zofran 4mg (ODT)', secondary: '($1.00/ODT) Minimum 10 Tabs' },
    { value: 'Tesofensine 500mcg Caps #30 $280.00 / #60 $450.00 / #90 $600.00', primary: 'Tesofensine 500mcg Caps', secondary: '#30 $280.00 / #60 $450.00 / #90 $600.00' }
  ];

  const toggleSelection = (field, value) => {
    setFormData(prev => {
      const selections = prev[field] || [];
      const exists = selections.includes(value);
      return {
        ...prev,
        [field]: exists ? selections.filter(item => item !== value) : [...selections, value]
      };
    });
  };

  const renderCheckboxList = (items, field) => (
    <div className="space-y-3">
      {items.map((item) => {
        const selected = formData[field]?.includes(item.value);
        return (
          <label
            key={item.value}
            className={`flex items-start gap-3 p-3 rounded-xl border transition shadow-sm ${
              selected ? 'border-lime-400 bg-lime-50' : 'border-gray-200 bg-white'
            }`}
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-lime-500"
              checked={selected}
              onChange={() => toggleSelection(field, item.value)}
            />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-900">{item.primary}</p>
              {item.secondary && <p className="text-xs text-gray-600">{item.secondary}</p>}
              {item.description && <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>}
            </div>
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
      // Require a signed-in Supabase user to satisfy RLS (auth.uid() = user_id)
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        alert('Please sign in to submit the form.');
        window.location.href = '/create-account';
        return;
      }
      const res = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType: 'weightloss', formData, email: formData.email }),
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
            src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop"
            alt="header"
            className="absolute inset-0 w-full h-full object-cover opacity-10"
          />
          <div className="relative flex items-center gap-4">
            <img src="/medconnect logo.webp" alt="MedConnect" className="h-16 w-auto" />
            <div>
              <h1 className="text-2xl font-bold mb-1">SEMAGLUTIDE/TIRZEPATIDE PAD</h1>
              <p className="text-sm opacity-90">123 Medical Plaza Drive, Suite 200, Springfield, IL 62701</p>
              <p className="text-sm opacity-90">Ph: (555) 123-4567 | Fax: (555) 765-4321</p>
            </div>
          </div>
        </div>

        {/* Alert */}
        <div className="bg-lime-50 border-l-4 border-lime-400 p-4 flex items-start gap-3">
          <AlertCircle className="text-lime-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-black">
            <p className="font-semibold mb-1">All fields marked with * are required and must be filled.</p>
            <p className="text-gray-700">***FAILURE TO PROVIDE PATIENT'S SPECIFIC INFORMATION WILL CAUSE DELAYS***</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-b-lg">
          {/* Patient Section */}
          <div className="p-8 border-b-2 border-gray-100">
            <h2 className="text-xl font-bold text-blue-900 mb-6 pb-2 border-b-2 border-lime-400">PATIENT INFORMATION</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">First Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition text-gray-900 placeholder:text-gray-700"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Last Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition text-gray-900 placeholder:text-gray-700"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Date of Birth *</label>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    placeholder="Month"
                    required
                    min="1"
                    max="12"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition text-gray-900 placeholder:text-gray-700"
                    value={formData.dobMonth}
                    onChange={(e) => setFormData({...formData, dobMonth: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Day"
                    required
                    min="1"
                    max="31"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition text-gray-900 placeholder:text-gray-700"
                    value={formData.dobDay}
                    onChange={(e) => setFormData({...formData, dobDay: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Year"
                    required
                    min="1900"
                    max="2025"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition text-gray-900 placeholder:text-gray-700"
                    value={formData.dobYear}
                    onChange={(e) => setFormData({...formData, dobYear: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="(555) 555-5555"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition text-gray-900 placeholder:text-gray-700"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Allergies *</label>
                <textarea
                  required
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition resize-none"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition mb-3"
                  value={formData.street}
                  onChange={(e) => setFormData({...formData, street: e.target.value})}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition text-gray-900 placeholder:text-gray-700"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                  <select
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition text-gray-900 placeholder:text-gray-700"
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition text-gray-900 placeholder:text-gray-700"
                    value={formData.zip}
                    onChange={(e) => setFormData({...formData, zip: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Bill to *</label>
                  <select
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition text-gray-900 placeholder:text-gray-700"
                    value={formData.billTo}
                    onChange={(e) => setFormData({...formData, billTo: e.target.value})}
                  >
                    <option value="">Select Option</option>
                    <option value="patient">Patient</option>
                    <option value="clinic">Clinic</option>
                    <option value="insurance">Insurance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Deliver to *</label>
                  <select
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition text-gray-900 placeholder:text-gray-700"
                    value={formData.deliverTo}
                    onChange={(e) => setFormData({...formData, deliverTo: e.target.value})}
                  >
                    <option value="">Select Option</option>
                    <option value="patient">Patient Address</option>
                    <option value="clinic">Clinic Address</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Prescription Section */}
          <div className="p-8 border-b-2 border-gray-100">
            <h2 className="text-xl font-bold text-blue-900 mb-6 pb-2 border-b-2 border-lime-400">PRESCRIPTION</h2>
            
            <div className="space-y-8">
              <div className="rounded-2xl border-2 border-blue-100 shadow-sm overflow-hidden">
                <div className="bg-blue-50 border-b border-blue-100 px-6 py-4 text-center">
                  <h3 className="text-lg font-bold text-blue-900 uppercase tracking-wide">New Compound</h3>
                  <p className="text-sm text-blue-700 mt-1">Reach out to your representative for more info.</p>
                </div>
                <div className="px-6 py-6 space-y-4">
                  <h4 className="text-sm font-semibold text-blue-900">Liraglutide/Pyridoxine 15mg-4mg/0.5mL (3mL 90mg Vial) $280.00</h4>
                  <ul className="space-y-2">
                    {newCompoundPlan.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-1 h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">●</span>
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-center">
                  <span className="inline-block bg-lime-500 text-white font-bold uppercase tracking-[0.25em] px-6 py-2 rounded-full shadow-sm">
                    Semaglutide
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-blue-900 mb-4 uppercase">Semaglutide Vial Options</h3>
                  {renderCheckboxList(semaglutideVialOptions, 'semaglutideVialSelections')}
                </div>

                <div>
                  <h3 className="text-base font-bold text-blue-900 mb-4 uppercase">Semaglutide/B6 Sublingual Rapid Dissolving Tablets</h3>
                  {renderCheckboxList(semaglutideRdtOptions, 'semaglutideRdtSelections')}
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-center">
                  <span className="inline-block bg-lime-500 text-white font-bold uppercase tracking-[0.25em] px-6 py-2 rounded-full shadow-sm">
                    Tirzepatide
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-blue-900 mb-4 uppercase">Tirzepatide Vial Options</h3>
                  {renderCheckboxList(tirzepatideVialOptions, 'tirzepatideVialSelections')}
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-blue-900 mb-4 uppercase">Tirzepatide/Semaglutide 20mg/2mg/mL (2mL 40mg/4mg MDV) $335.00</h3>
                    {renderCheckboxList(tirzepatide20Options, 'tirzepatide20Selections')}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-blue-900 mb-4 uppercase">Tirzepatide/Semaglutide 30mg/5mg/mL (2mL 60mg/10mg MDV) $405.00</h3>
                    {renderCheckboxList(tirzepatide30Options, 'tirzepatide30Selections')}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2 uppercase">
                  Medical Necessity * <span className="text-red-600">(Must have valid documented medical necessity)</span>
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition resize-none"
                  value={formData.medicalNecessity}
                  onChange={(e) => setFormData({...formData, medicalNecessity: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2 uppercase">
                  Fill box below for: Custom Dosing / Quantity / Comments / Notes / Other Meds
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition resize-none"
                  value={formData.customNotes}
                  onChange={(e) => setFormData({...formData, customNotes: e.target.value})}
                />
              </div>

              <div>
                <h3 className="text-base font-bold text-blue-900 mb-4 uppercase">Commonly Prescribed Together</h3>
                {renderCheckboxList(commonlyPrescribedOptions, 'commonlyPrescribedSelections')}
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2 uppercase">Refills *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition text-gray-900 placeholder:text-gray-700"
                  value={formData.refills}
                  onChange={(e) => setFormData({...formData, refills: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Physician Section */}
          <div className="p-8">
            <h2 className="text-xl font-bold text-blue-900 mb-6 pb-2 border-b-2 border-lime-400">PHYSICIAN INFORMATION</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Signature or Initials *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition font-cursive text-lg"
                  value={formData.signature}
                  onChange={(e) => setFormData({...formData, signature: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Prescriber's Print Name * <span className="text-gray-600">(ONLY AUTHORIZED PRESCRIBER)</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition text-gray-900 placeholder:text-gray-700"
                  value={formData.prescriberName}
                  onChange={(e) => setFormData({...formData, prescriberName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Date *</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition text-gray-900 placeholder:text-gray-700"
                  value={formData.prescriptionDate}
                  onChange={(e) => setFormData({...formData, prescriptionDate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Clinic Name * <span className="text-gray-600">(NAME MUST MATCH ACCT SETUP)</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition text-gray-900 placeholder:text-gray-700"
                  value={formData.clinicName}
                  onChange={(e) => setFormData({...formData, clinicName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition text-gray-900 placeholder:text-gray-700"
                    value={formData.clinicPhone}
                    onChange={(e) => setFormData({...formData, clinicPhone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">NPI # *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition text-gray-900 placeholder:text-gray-700"
                    value={formData.npi}
                    onChange={(e) => setFormData({...formData, npi: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">DEA #</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition text-gray-900 placeholder:text-gray-700"
                  value={formData.dea}
                  onChange={(e) => setFormData({...formData, dea: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Clinic's Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Street Address"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition mb-3"
                  value={formData.clinicStreet}
                  onChange={(e) => setFormData({...formData, clinicStreet: e.target.value})}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition text-gray-900 placeholder:text-gray-700"
                    value={formData.clinicCity}
                    onChange={(e) => setFormData({...formData, clinicCity: e.target.value})}
                  />
                  <select
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition text-gray-900 placeholder:text-gray-700"
                    value={formData.clinicState}
                    onChange={(e) => setFormData({...formData, clinicState: e.target.value})}
                  >
                    <option value="">Select State</option>
                    {states.map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Zip Code"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition text-gray-900 placeholder:text-gray-700"
                    value={formData.clinicZip}
                    onChange={(e) => setFormData({...formData, clinicZip: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">E-mail Address for Records Copy *</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-lime-400 focus:ring-2 focus:ring-lime-200 outline-none transition text-gray-900 placeholder:text-gray-700"
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
              {submitting ? 'Submitting...' : 'Submit Prescription'}
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
          message="Your Weight Loss form has been submitted successfully! We will process your request shortly."
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
}