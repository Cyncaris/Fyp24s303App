'use client';

// Add these imports at the top
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { supabase } from '../../../lib/supabaseClient'; 
import RoleBasedRoute from '@/app/components/RoleBasedRoute'; // Import RoleBasedRoute component
import { ROLES } from '@/app/utils/roles'; // Import ROLES object 

export default function CreateRecord() {
  const router = useRouter(); // Add router initialization
  const [formData, setFormData] = useState({
    patientId: '',
    visitDate: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    followUpDate: '',
  });

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorId, setDoctorId] = useState('');

  // Separate the fetch functions
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify-token`, {
        withCredentials: true
      });

      if (response.status === 401) {
        router.push('/unauthorized');
        return;
      }

      if (!response.data.success) {
        throw new Error('Verification failed');
      }

      const userId = response.data.user.userId;
      console.log("Doctor ID:", userId);
      setDoctorId(userId);
      return userId;
    } catch (error) {
      console.error('Profile fetch error:', error);
      if (error.response?.status === 401) {
        router.push('/unauthorized');
      }
      setError('Failed to load user profile');
      return null;
    }
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('useraccount')
        .select('id, first_name, last_name')
        .eq('role_id', 2);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        setError('No patients found');
        setPatients([]);
      } else {
        setPatients(data);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to fetch patients list');
    } finally {
      setLoading(false);
    }
  };

  // Use separate useEffects for clarity
  useEffect(() => {
    const initializePage = async () => {
      const userId = await fetchUserProfile();
      if (userId) {
        await fetchPatients();
      }
    };

    initializePage();
  }, [router]); // Add router to dependencies

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.patientId) {
      alert('Please select a patient');
      return;
    }

    if (!doctorId) {
      alert('Doctor ID not available. Please try again.');
      return;
    }

    try {
      console.log("Submitting record with doctor ID:", doctorId);
      const { data, error } = await supabase
        .from('patientrecord')
        .insert([
          {
            patient_id: formData.patientId,
            doctor_id: doctorId,
            visit_date: formData.visitDate,
            diagnosis: formData.diagnosis,
            treatment_plan: formData.treatment,
            prescription: formData.prescription,
            follow_up_date: formData.followUpDate,
          },
        ])
        .select(); // Add this to get the inserted record back

      if (error) throw error;

      console.log('Record created:', data);
      alert('Record created successfully!');
      setFormData({
        patientId: '',
        visitDate: '',
        diagnosis: '',
        treatment: '',
        prescription: '',
        followUpDate: '',
      });
    } catch (error) {
      console.error('Error inserting record:', error);
      alert('Error creating record: ' + error.message);
    }
  };

  // Rest of your component remains the same...
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
   // Replace the patient input field with this dropdown
   const PatientSelect = () => (
    <div className="mb-4">
      <label htmlFor="patientId" className="block text-gray-700 font-bold mb-2">
        Patient
      </label>
      {loading ? (
        <div className="animate-pulse flex items-center justify-center h-10 bg-gray-100 rounded-md">
          <span className="text-gray-500">Loading patients...</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-between p-2 border border-red-300 rounded-md bg-red-50">
          <span className="text-red-500">{error}</span>
          <button 
            onClick={fetchPatients}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <select
          id="patientId"
          name="patientId"
          value={formData.patientId}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
          required
        >
          <option value="">Select a Patient</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.first_name} {patient.last_name}
            </option>
          ))}
        </select>
      )}
    </div>
  );

  return (
    <RoleBasedRoute allowedRoles={[ROLES.DOCTOR]} requireRestricted={false}>
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
            <PatientSelect />
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
    </RoleBasedRoute>
  );
}
