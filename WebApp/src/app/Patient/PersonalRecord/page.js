"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link"; // Use Next.js Link for navigation
import { supabase } from '@/app/lib/supabaseClient'; // Import Supabase client
import RoleBasedRoute from '@/app/components/RoleBasedRoute'; // Import RoleBasedRoute component
import { ROLES } from '@/app/utils/roles'; // Import ROLES object
import { useRouter } from 'next/navigation';
import axios from 'axios';

const PatientPersonalRecordDashboard = () => {
  const [showMedicalInfoModal, setShowMedicalInfoModal] = useState(false);
  const [showAppointmentHistoryModal, setShowAppointmentHistoryModal] = useState(false);
  const [medicalInfo, setMedicalInfo] = useState(null);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  
  const [patientId, setPatientId] = useState(null);

  const openMedicalInfoModal = async () => {
    setShowMedicalInfoModal(true);
    await fetchMedicalInfo();
  };

  const closeMedicalInfoModal = () => setShowMedicalInfoModal(false);

  const openAppointmentHistoryModal = async () => {
    setShowAppointmentHistoryModal(true);
    await fetchAppointmentHistory();
  };

  const closeAppointmentHistoryModal = () => setShowAppointmentHistoryModal(false);

  // Fetch medical information from the database
  const fetchMedicalInfo = async () => {
    console.log("Fetching medical info for patientId:", patientId);
    if (!patientId) {
        setError("No patient ID available");
        setLoading(false);
        return;
    }

    try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
            .from('patientrecord')
            .select('record_id, diagnosis, treatment_plan, prescription, follow_up_date, visit_date, height, weight, allergies')
            .eq('patient_id', patientId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // PostgreSQL error code for no rows returned
                setMedicalInfo(null);
                setError("No medical record found");
            } else {
                console.error("Error fetching medical information:", error);
                setError(`Failed to fetch medical record: ${error.message}`);
                setMedicalInfo(null);
            }
        } else {
            setMedicalInfo(data);
            setError(null);
        }
    } catch (error) {
        console.error("Unexpected error:", error);
        setError("An unexpected error occurred while fetching medical records");
        setMedicalInfo(null);
    } finally {
        setLoading(false);
    }
};

  // Fetch appointment history from the database
  const fetchAppointmentHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments') // Replace with the correct table name
        .select('title, date, time, location')
        .eq('patient_id', patientId)
        .eq('is_upcoming', false)
        .order('date', { ascending: false });

      if (error) {
        console.error("Error fetching appointment history:", error.message);
        setAppointmentHistory([]); // Clear previous data
      } else {
        setAppointmentHistory(data);
      }
    } catch (error) {
      console.error("Unexpected error:", error.message);
      setAppointmentHistory([]);
    }
  };

  const Logout = async () => {
    console.log('Logging out...');
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
        setPatientId(userId);
        console.log("Patient ID:", userId);
      } catch (error) {
        console.error('Profile fetch error:', error);
        if (error.response?.status === 401) {
          router.push('/unauthorized');
        }
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);


  return (
    <RoleBasedRoute allowedRoles={[ROLES.PATIENT]} requireRestricted={true}> 
      <div className="bg-gray-100 min-h-screen flex flex-col">
        {/* Header Section */}
        <header className="bg-black text-white py-4 shadow-lg">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Personal Record</h1>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link href="/Patient/">Back</Link>
                </li>
                <li>
                  <Link href="/Patient/" className="hover:underline">Home</Link>
                </li>
                <li>
                  <Link onClick={Logout} className="hover:underline">Logout</Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        {/* Main Content Section */}
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Manage Personal Records</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Medical Information Button */}
              <button
                onClick={openMedicalInfoModal}
                className="bg-black text-white p-4 rounded-lg shadow-md flex items-center justify-between hover:bg-blue-600 transition w-full"
              >
                <span className="font-bold text-lg">Medical Information</span>
                <i className="fas fa-user-cog text-2xl"></i>
              </button>

              {/* Appointment History Button */}
              <button
                onClick={openAppointmentHistoryModal}
                className="bg-black text-white p-4 rounded-lg shadow-md flex items-center justify-between hover:bg-blue-600 transition w-full"
              >
                <span className="font-bold text-lg">Appointment History</span>
                <i className="fas fa-calendar-alt text-2xl"></i>
              </button>
            </div>
          </div>
        </main>

        {/* Medical Information Modal */}
        {showMedicalInfoModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Medical Information</h3>
              {loading ? (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : error ? (
                <div className="text-center py-4">
                  <p className="text-gray-600">{error}</p>
                  <button
                    onClick={closeMedicalInfoModal}
                    className="mt-4 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-700 transition"
                  >
                    Close
                  </button>
                </div>
              ) : medicalInfo ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-600 font-semibold">Diagnosis</label>
                    <input 
                      type="text" 
                      value={medicalInfo.diagnosis || "N/A"} 
                      readOnly 
                      className="w-full p-2 bg-gray-200 rounded-md" 
                    />
                  </div>
                  {/* Additional fields... */}
                  <button
                    onClick={closeMedicalInfoModal}
                    className="mt-4 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-700 transition"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600">No medical record found.</p>
                  <button
                    onClick={closeMedicalInfoModal}
                    className="mt-4 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-700 transition"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointment History Modal */}
        {showAppointmentHistoryModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Appointment History</h3>
              {appointmentHistory.length > 0 ? (
                <table className="w-full border border-gray-300">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border-b font-semibold text-left">Title</th>
                      <th className="px-4 py-2 border-b font-semibold text-left">Date</th>
                      <th className="px-4 py-2 border-b font-semibold text-left">Time</th>
                      <th className="px-4 py-2 border-b font-semibold text-left">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointmentHistory.map((appointment, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 border-b">{appointment.title}</td>
                        <td className="px-4 py-2 border-b">{appointment.date}</td>
                        <td className="px-4 py-2 border-b">{appointment.time}</td>
                        <td className="px-4 py-2 border-b">{appointment.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No past appointments available.</p>
              )}
              <button
                onClick={closeAppointmentHistoryModal}
                className="mt-4 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Footer Section */}
        <footer className="bg-gray-800 text-white py-4">
          <div className="container mx-auto px-4 text-center">
            &copy; 2023 Hospital App. All rights reserved.
          </div>
        </footer>
      </div>
    </RoleBasedRoute>
  );
};

export default PatientPersonalRecordDashboard;
