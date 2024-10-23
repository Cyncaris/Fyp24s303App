'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="bg-white text-gray-800 py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <nav>
            <ul className="flex space-x-4">
              {/* Navigation Links */}
              <li>
                <Link href="/Doctor/DoctorDashboard" className="hover:underline text-blue-600">Home</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content Section */}
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Welcome!!</h1>
        <div className="bg-white shadow-lg rounded-lg p-8 w-full mx-0">
          <h3 className="text-xl font-bold text-gray-800 mb-8">Manage Your Dashboard</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link href="/Doctor/viewPatient" className="bg-blue-500 w-full items-center border px-3 py-4 rounded-lg text-lg font-semibold shadow hover:bg-blue-600 text-white transition-all duration-300">
              View Patients
            </Link>
            <Link href="/Doctor/viewAppointment" className="bg-blue-500 w-full items-center border px-3 py-4 rounded-lg text-lg font-semibold shadow hover:bg-blue-600 text-white transition-all duration-300">
              View Appointments
            </Link>
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
