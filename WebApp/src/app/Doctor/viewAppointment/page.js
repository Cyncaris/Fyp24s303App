'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ViewAppointment() {
  // Example data for appointments
  const [appointments, setAppointments] = useState([
    { id: 1, doctorId: 'D456', patientId: 'P123', firstName: 'John', lastName: 'Doe', date: '08/09/2023', time: '15:30' },
    { id: 2, doctorId: 'D456', patientId: 'P456', firstName: 'Jane', lastName: 'Smith', date: '08/09/2023', time: '16:45' },
    { id: 3, doctorId: 'D456', patientId: 'P789', firstName: 'Emily', lastName: 'Johnson', date: '09/07/2023', time: '09:45' },
  ]);

  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleCloseDetails = () => {
    setSelectedAppointment(null);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="bg-green-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/Doctor/DoctorDashboard" className="hover:underline">Back</Link>
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
      <main className="flex-grow container mx-auto px-4 py-12">
        {/* Appointment Creation */}
        <div className="bg-white shadow-md rounded-lg p-8 w-full mb-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Appointment does not exist?</h3>
            <Link href="/Doctor/viewAppointment/createAppointment" className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 flex items-center">
              <span className="text-white">Create Appointment</span>
            </Link>
          </div>
        </div>

        {/* List of Appointments */}
        <div className="bg-white shadow-md rounded-lg p-8 w-full">
          <h3 className="text-xl font-bold text-gray-800 mb-4">List of Appointments</h3>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                onClick={() => handleAppointmentClick(appointment)}
                className="bg-gray-100 p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-200 transition duration-300 ease-in-out"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{appointment.firstName} {appointment.lastName}</h4>
                    <p className="text-gray-600">{appointment.date} at {appointment.time}</p>
                  </div>
                  <span className="text-blue-500 hover:underline">View Details</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed View of Selected Appointment */}
        {selectedAppointment && (
          <div className="mt-8 bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Appointment Details</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Doctor ID:</label>
              <p>{selectedAppointment.doctorId}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Patient ID:</label>
              <p>{selectedAppointment.patientId}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Name:</label>
              <p>{selectedAppointment.firstName} {selectedAppointment.lastName}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Visit Date:</label>
              <p>{selectedAppointment.date}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Visit Time:</label>
              <p>{selectedAppointment.time}</p>
            </div>

            {/* Edit & Cancel Buttons */}
            <div className="flex space-x-4 mt-6">
              <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">
                Cancel Appointment
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
                Edit Appointment
              </button>
            </div>
          </div>
        )}
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
