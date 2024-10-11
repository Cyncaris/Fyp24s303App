'use client';

import Link from 'next/link';

export default function CreateRecord() {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="bg-green-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Create Patient Records</h1>
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
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Patien Record</h2>
          <form>
            {/* Record ID Input */}
            <div className="mb-4">
              <label htmlFor="recordID" className="block text-gray-700 font-bold mb-2">Record ID</label>
              <input
                type="text"
                id="recordID"
                name="recordID"
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
                name="patientID"
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              />
            </div>
            {/* Doctor ID Input */}
            <div className="mb-4">
              <label htmlFor="doctorID" className="block text-gray-700 font-bold mb-2">Doctor ID</label>
              <input
                type="text"
                id="doctorID"
                name="doctorID"
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              />
            </div>
            {/* Visit Date Input */}
            <div className="mb-4">
              <label htmlFor="visitDate" className="block text-gray-700 font-bold mb-2">Visit Date</label>
              <input
                type="text"
                id="visitDate"
                name="visitDate"
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              />
            </div>
            {/* Diagnosis Input */}
            <div className="mb-4">
              <label htmlFor="diagnosis" className="block text-gray-700 font-bold mb-2">Diagnosis</label>
              <textarea
                type="text"
                id="diagnosis"
                name="diagnosis"
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              > </textarea>
            </div>
            {/* Treatment Plan Input */}
            <div className="mb-4">
              <label htmlFor="treatment" className="block text-gray-700 font-bold mb-2">Treatment Plan</label>
              <textarea
                type="text"
                id="treatment"
                name="treatment"
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              > </textarea>
            </div>
            {/* Prescription Input */}
            <div className="mb-4">
              <label htmlFor="prescription" className="block text-gray-700 font-bold mb-2">Prescriptions</label>
              <textarea
                type="text"
                id="prescription"
                name="prescription"
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              > </textarea>
            </div>
            {/* Follow Up Input */}
            <div className="mb-4">
              <label htmlFor="followUpDate" className="block text-gray-700 font-bold mb-2">Follow-up Date</label>
              <input
                type="text"
                id="followUpDate"
                name="followUpDate"
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
  );
}
