'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';

export default function CreateAppointment() {
  const [formData, setFormData] = useState({
    doctor_id: '',
    patient_id: '',
    title: '',
    date: '',
    time: '',
    location: '', // Added location
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('appointments')
      .insert([
        {
          doctor_id: formData.doctor_id,
          patient_id: formData.patient_id,
          title: formData.title,
          date: formData.date,
          time: formData.time,
          location: formData.location, // Include location in the insert
        },
      ]);

    if (error) {
      console.error('Error creating appointment:', error);
    } else {
      // Optionally reset the form or redirect after successful creation
      setFormData({
        doctor_id: '',
        patient_id: '',
        title: '',
        date: '',
        time: '',
        location: '', // Reset location
      });
      alert('Appointment created successfully!');
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="bg-green-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Create Appointment</h1>
          <nav>
            <ul className="flex space-x-4">
              {/* Navigation Links */}
              <li>
                <Link href="/Doctor/viewAppointment" className="hover:underline">Back</Link>
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
          <h2 className="text-xl font-bold text-gray-800 mb-6">Appointment Details</h2>
          <form onSubmit={handleSubmit}>
            {/* Doctor ID Input */}
            <div className="mb-4">
              <label htmlFor="doctorID" className="block text-gray-700 font-bold mb-2">Doctor ID</label>
              <input
                type="text"
                id="doctorID"
                name="doctor_id"
                value={formData.doctor_id}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              />
            </div>
            {/* Patient ID Input */}
            <div className="mb-4">
              <label htmlFor="patientID" className="block text-gray-700 font-bold mb-2">Patient ID</label>
              <input
                type="text"
                id="patientID"
                name="patient_id"
                value={formData.patient_id}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              />
            </div>
            {/* Title Input */}
            <div className="mb-4">
              <label htmlFor="title" className="block text-gray-700 font-bold mb-2">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              />
            </div>
            {/* Visit Date Input */}
            <div className="mb-4">
              <label htmlFor="visitDate" className="block text-gray-700 font-bold mb-2">Visit Date</label>
              <input
                type="date"
                id="visitDate"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              />
            </div>
            {/* Visit Time Input */}
            <div className="mb-4">
              <label htmlFor="visitTime" className="block text-gray-700 font-bold mb-2">Visit Time</label>
              <input
                type="time"
                id="visitTime"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              />
            </div>
            {/* Location Input */}
            <div className="mb-4">
              <label htmlFor="location" className="block text-gray-700 font-bold mb-2">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg w-full"
            >
              Create Appointment
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
