'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import RoleBasedRoute from '@/app/components/RoleBasedRoute'; // Import RoleBasedRoute component
import { ROLES } from '@/app/utils/roles'; // Import ROLES object 


export default function CreateAppointment() {
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [listOfPatient, setlistOfPatient] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    doctor_id: '',
    patient_id: '',
    title: '',
    date: '',
    time: '',
    location: '',
  });

  // Predefined appointment types
  const appointmentTypes = [
    "Dental Checkup",
    "Physical Therapy",
    "Blood Pressure Check",
    "Cardiology Follow-up",
    "Vision Screening"
  ];

  // Predefined locations
  const locations = [
    "Room 101",
    "Room 102",
    "Room 201",
    "Room 305",
    "Room 410"
  ];

  const fetchListOfDoctors = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('useraccount')
        .select('id, first_name, last_name')
        .eq('role_id', 1);

      if (error) {
        console.error('Error fetching doctors:', error);
        setError('Failed to fetch list of doctors');
        setDoctors([]);
        return;
      }

      if (!data || data.length === 0) {
        setError('No doctors found');
        setDoctors([]);
        return;
      }

      setDoctors(data);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchListOfPatient = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('useraccount')
        .select('id, first_name, last_name')
        .eq('role_id', 2);

      if (error) {
        console.error('Error fetching patients:', error);
        setError('Failed to fetch list of patients');
        setlistOfPatient([]);
        return;
      }

      if (!data || data.length === 0) {
        setError('No patients found');
        setlistOfPatient([]);
        return;
      }

      setlistOfPatient(data);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
      setlistOfPatient([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.doctor_id || !formData.patient_id) {
      alert('Please select both a doctor and a patient');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            doctor_id: formData.doctor_id,
            patient_id: formData.patient_id,
            title: formData.title,
            date: formData.date,
            time: formData.time,
            location: formData.location,
            is_upcoming: true
          }
        ])
        .select();

      if (error) throw error;

      alert('Appointment created successfully!');
      router.push('/Doctor/viewAppointment');
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to create appointment: ' + error.message);
    }
  };

  const Logout = async () => {
    try {
      // 1. Call backend to clear cookie
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/logout`, {}, {
        withCredentials: true
      });
      if (!response.status === 200) {
        throw new Error('Failed to log out');
      }
      else {
        // 2. Redirect to login page
        router.push('/');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      await Promise.all([
        fetchListOfDoctors(),
        fetchListOfPatient()
      ]);
    };

    initializePage();
  }, []);

  return (
    <RoleBasedRoute allowedRoles={[ROLES.DOCTOR]} requireRestricted={false}>
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <header className="bg-green-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Create Appointment</h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/Doctor/viewAppointment" className="hover:underline">Back</Link>
              </li>
              <li>
                <Link href="/Doctor/DoctorDashboard" className="hover:underline">Home</Link>
              </li>
              <li>
                <button onClick={handleLogout} className="hover:underline">Logout</button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Appointment Details</h2>
          <form onSubmit={handleSubmit}>
            {/* Doctor Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Doctor</label>
              <select
                name="doctor_id"
                value={formData.doctor_id}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              >
                <option value="">Select a Doctor</option>
                {Array.isArray(doctors) && doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.first_name} {doctor.last_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Patient Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Patient</label>
              <select
                name="patient_id"
                value={formData.patient_id}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              >
                <option value="">Select a Patient</option>
                {Array.isArray(listOfPatient) && listOfPatient.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Appointment Type Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Appointment Type</label>
              <select
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              >
                <option value="">Select Appointment Type</option>
                {appointmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Input */}
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              />
            </div>

            {/* Time Input */}
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              />
            </div>

            {/* Location Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Location</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg w-full"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Appointment'}
            </button>
          </form>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          &copy; {new Date().getFullYear()} Hospital App. All rights reserved.
        </div>
      </footer>
    </div>
    </RoleBasedRoute>
  );
}