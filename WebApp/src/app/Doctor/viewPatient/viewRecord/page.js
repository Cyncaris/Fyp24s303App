'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ViewRecord() {
  const [searchTerm, setSearchTerm] = useState('');

  // Example patient data
  const patients = [
    { id: 'P123', name: 'John Doe' },
    { id: 'P456', name: 'Jane Smith' },
    { id: 'P789', name: 'Emily Johnson' }
  ];

  // Handle the change in the search input
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || patient.id.toString().includes(searchTerm)
  );

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="bg-green-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">View Patient Records</h1>
          <nav>
            <ul className="flex space-x-4">
              {/* Navigation Links */}
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
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="container mx-auto p-4">
          <h2 className="text-lg font-bold">Search Patient</h2>
          <input
            type="text"
            placeholder="Search by name or ID"
            value={searchTerm}
            onChange={handleSearchChange}
            className="border rounded-lg py-2 px-4 mb-4 w-full"
          />
          
          <h2 className="text-lg font-bold mb-2">Patient List</h2>
          <div className="bg-white shadow-md rounded-lg p-4">
            {filteredPatients.length > 0 ? (
              <ul className="space-y-2">
                {filteredPatients.map((patient) => (
                  <li key={patient.id} className="border-b last:border-b-0 pb-2 mb-2">
                    <Link href={`/patient/${patient.id}`} className="text-black hover:underline">
                      {patient.name} - {patient.id}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No patients found.</p>
            )}
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
