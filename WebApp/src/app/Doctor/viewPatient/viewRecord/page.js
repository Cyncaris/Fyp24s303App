'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ViewRecord() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Example patient data with records
  const patients = [
    {
      id: 'P123',
      name: 'John Doe',
      record: {
        recordId: 1,
        doctorId: 'D456',
        visitDate: '01/09/2023',
        diagnosis: 'Flu',
        treatmentPlan: 'Rest and Hydration',
        prescription: 'Paracetamol',
        followUpDate: '08/09/2023',
      },
    },
    {
      id: 'P456',
      name: 'Jane Smith',
      record: {
        recordId: 2,
        doctorId: 'D456',
        visitDate: '15/09/2023',
        diagnosis: 'Back Pain',
        treatmentPlan: 'Physical Therapy',
        prescription: 'Ibuprofen',
        followUpDate: '22/09/2023',
      },
    },
    {
      id: 'P789',
      name: 'Emily Johnson',
      record: {
        recordId: 3,
        doctorId: 'D456',
        visitDate: '01/10/2023',
        diagnosis: 'Allergy',
        treatmentPlan: 'Antihistamines',
        prescription: 'Cetirizine',
        followUpDate: '07/10/2023',
      },
    },
  ];

  // Handle the change in the search input
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toString().includes(searchTerm)
  );

  // Handle patient selection
  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
  };

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
                  <li
                    key={patient.id}
                    className="border-b last:border-b-0 pb-2 mb-2 cursor-pointer"
                    onClick={() => handlePatientClick(patient)}
                  >
                    <span className="text-black hover:underline">
                      {patient.name} - {patient.id}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No patients found.</p>
            )}
          </div>

          {/* Patient Record Details */}
          {selectedPatient && (
            <div className="mt-8 bg-white shadow-md rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">Patient Record Details</h2>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Record ID:</label>
                <p>{selectedPatient.record.recordId}</p>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Patient ID:</label>
                <p>{selectedPatient.id}</p>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Doctor ID:</label>
                <p>{selectedPatient.record.doctorId}</p>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Visit Date:</label>
                <p>{selectedPatient.record.visitDate}</p>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Diagnosis:</label>
                <p>{selectedPatient.record.diagnosis}</p>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Treatment Plan:</label>
                <p>{selectedPatient.record.treatmentPlan}</p>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Prescription:</label>
                <p>{selectedPatient.record.prescription}</p>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Follow-up Date:</label>
                <p>{selectedPatient.record.followUpDate}</p>
              </div>
              
              {/* Edit Record Button */}
              <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg w-full">
                Edit Record
              </button>
            </div>
          )}
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