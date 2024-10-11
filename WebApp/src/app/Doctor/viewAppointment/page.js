'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ViewAppointment() {
  // Example data for appointments
  const [appointments, setAppointments] = useState([
    { id: 1, name: 'John Doe', date: '02/05/2023', time: '15:30' },
    { id: 2, name: 'Jane Smith', date: '02/05/2023', time: '16:45' },
    { id: 3, name: 'Emily Johnson', date: '03/07/2023', time: '09:45' },
  ]);

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
          <div className="space-y-2">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="bg-gray-100 p-4 rounded-lg shadow-sm">
                {appointment.name} - {appointment.date} - {appointment.time}
              </div>
            ))}
          </div>
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
