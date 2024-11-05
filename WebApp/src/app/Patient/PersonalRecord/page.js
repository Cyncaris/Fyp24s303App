"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link"; // Use Next.js Link for navigation
import { supabase } from '@/app/lib/supabaseClient'; // Import Supabase client

const PatientPersonalRecordDashboard = () => {
  const [showMedicalInfoModal, setShowMedicalInfoModal] = useState(false);
  const [showAppointmentHistoryModal, setShowAppointmentHistoryModal] = useState(false);
  const [medicalInfo, setMedicalInfo] = useState(null);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  
  const patientId = '5dac3f89-0660-4e2f-bb70-6786468ab3b3';

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
    try {
      const { data, error } = await supabase
        .from('patientrecord') // Ensure this is the correct table name
        .select('record_id, diagnosis, treatment_plan, prescription, follow_up_date, visit_date, height, weight, allergies')
        .eq('patient_id', patientId)
        .single();

      if (error) {
        console.error("Error fetching medical information:", error.message);
        setMedicalInfo(null); // Clear any previous data
      } else {
        setMedicalInfo(data);
      }
    } catch (error) {
      console.error("Unexpected error:", error.message);
      setMedicalInfo(null);
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

  return (
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
                <Link href="#" className="hover:underline">Logout</Link>
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
            {medicalInfo ? (
              <div className="space-y-4">
                {/* Displaying the medical information fields */}
                <div>
                  <label className="block text-gray-600 font-semibold">Diagnosis</label>
                  <input type="text" value={medicalInfo.diagnosis || "N/A"} readOnly className="w-full p-2 bg-gray-200 rounded-md" />
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
              <p>Loading...</p>
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
  );
};

export default PatientPersonalRecordDashboard;
