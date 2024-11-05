'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient'; 

export default function CreateRecord() {
  const [formData, setFormData] = useState({
    visitDate: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    followUpDate: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from('patientrecord') 
      .insert([
        {
          visit_date: formData.visitDate,
          diagnosis: formData.diagnosis,
          treatment_plan: formData.treatment,
          prescription: formData.prescription,
          follow_up_date: formData.followUpDate,
        },
      ]);

    if (error) {
      console.error('Error inserting record:', error);
      alert('Error inserting record: ' + error.message); // Alert for better visibility
    } else {
      console.log('Record created successfully:', data); // Log the created record data
      // Reset the form after successful submission
      setFormData({
        visitDate: '',
        diagnosis: '',
        treatment: '',
        prescription: '',
        followUpDate: '',
      });
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="bg-green-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Create Patient Records</h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/Doctor/viewPatient" className="hover:underline">Back</Link>
              </li>
              <li>
                <Link href="/Doctor/DoctorDashboard" className="hover:underline">Home</Link>
              </li>
              <li>
                <Link href="/" className="hover:underline">Logout</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content Section */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Patient Record</h2>
          <form onSubmit={handleSubmit}>
            {/* Visit Date Input */}
            <div className="mb-4">
              <label htmlFor="visitDate" className="block text-gray-700 font-bold mb-2">Visit Date</label>
              <input
                type="date" 
                id="visitDate"
                name="visitDate"
                value={formData.visitDate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              />
            </div>
            {/* Diagnosis Input */}
            <div className="mb-4">
              <label htmlFor="diagnosis" className="block text-gray-700 font-bold mb-2">Diagnosis</label>
              <textarea
                id="diagnosis"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              ></textarea>
            </div>
            {/* Treatment Plan Input */}
            <div className="mb-4">
              <label htmlFor="treatment" className="block text-gray-700 font-bold mb-2">Treatment Plan</label>
              <textarea
                id="treatment"
                name="treatment"
                value={formData.treatment}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              ></textarea>
            </div>
            {/* Prescription Input */}
            <div className="mb-4">
              <label htmlFor="prescription" className="block text-gray-700 font-bold mb-2">Prescriptions</label>
              <textarea
                id="prescription"
                name="prescription"
                value={formData.prescription}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              ></textarea>
            </div>
            {/* Follow Up Input */}
            <div className="mb-4">
              <label htmlFor="followUpDate" className="block text-gray-700 font-bold mb-2">Follow-up Date</label>
              <input
                type="date" 
                id="followUpDate"
                name="followUpDate"
                value={formData.followUpDate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg w-full"
            >
              Create Record
            </button>
          </form>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          &copy; 2023 Hospital App. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
