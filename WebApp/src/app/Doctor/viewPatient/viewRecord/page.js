'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';
import RoleBasedRoute from '@/app/components/RoleBasedRoute'; // Import RoleBasedRoute component
import { ROLES } from '@/app/utils/roles'; // Import ROLES object 

export default function ViewRecord() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchPatients = async () => {
      const { data, error } = await supabase
        .from('patientrecord')
        .select(`
    record_id,
    patient_id,
    diagnosis,
    doctor_id,
    visit_date,
    treatment_plan,
    prescription,
    follow_up_date,
    useraccount:patient_id ( first_name, last_name ),
    doctor:doctor_id ( first_name, last_name )
  `);

      if (error) {
        console.error('Error fetching patients:', error);
      } else {
        const formattedPatients = data.map((patient) => ({
          id: patient.patient_id,
          name: `${patient.useraccount.first_name} ${patient.useraccount.last_name}`,
          record: {
            recordId: patient.record_id,
            doctorId: patient.doctor_id,
            visitDate: patient.visit_date,
            diagnosis: patient.diagnosis,
            treatmentPlan: patient.treatment_plan,
            prescription: patient.prescription,
            followUpDate: patient.follow_up_date,
            patientName: `${patient.useraccount.first_name} ${patient.useraccount.last_name}`,
            doctorName: `${patient.doctor.first_name} ${patient.doctor.last_name}`
          },
        }));

        setPatients(formattedPatients);
      }
    };

    fetchPatients();
  }, []);

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
    setFormData({
      visitDate: patient.record.visitDate,
      diagnosis: patient.record.diagnosis,
      treatmentPlan: patient.record.treatmentPlan,
      prescription: patient.record.prescription,
      followUpDate: patient.record.followUpDate,
    });
    setEditMode(false);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle edit record submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from('patientrecord')
      .update({
        visit_date: formData.visitDate,
        diagnosis: formData.diagnosis,
        treatment_plan: formData.treatmentPlan,
        prescription: formData.prescription,
        follow_up_date: formData.followUpDate,
        last_update_at: new Date().toISOString(),
      })
      .eq('patient_id', selectedPatient.id);

    if (error) {
      console.error('Error updating record:', error);
    } else {
      setSelectedPatient({
        ...selectedPatient,
        record: {
          ...selectedPatient.record,
          ...formData,
        },
      });
      setEditMode(false);
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


  return (
    <RoleBasedRoute allowedRoles={[ROLES.DOCTOR]} requireRestricted={true}>
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
                <a onClick={Logout} className="hover:underline">Logout</a> 
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
                      {patient.name} - {patient.id.slice(0, 4)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No patients found.</p>
            )}
          </div>

          {/* Patient Record Details */}
          {selectedPatient && !editMode && (
            <div className="mt-8 bg-white shadow-md rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">Patient Record Details</h2>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Record ID:</label>
                <p>{selectedPatient.record.recordId}</p>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Patient Name:</label>
                <p>{selectedPatient.record.patientName}</p>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Doctor Name:</label>
                <p>{selectedPatient.record.doctorName}</p>
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
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg w-full"
                onClick={() => setEditMode(true)}
              >
                Edit Record
              </button>
            </div>
          )}

          {/* Edit Patient Record Form */}
          {selectedPatient && editMode && (
            <form onSubmit={handleEditSubmit} className="mt-8 bg-white shadow-md rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">Edit Patient Record</h2>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Visit Date:</label>
                <input
                  type="date"
                  name="visitDate"
                  value={formData.visitDate}
                  onChange={handleInputChange}
                  className="border rounded-lg py-2 px-4 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Diagnosis:</label>
                <input
                  type="text"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  className="border rounded-lg py-2 px-4 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Treatment Plan:</label>
                <input
                  type="text"
                  name="treatmentPlan"
                  value={formData.treatmentPlan}
                  onChange={handleInputChange}
                  className="border rounded-lg py-2 px-4 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Prescription:</label>
                <input
                  type="text"
                  name="prescription"
                  value={formData.prescription}
                  onChange={handleInputChange}
                  className="border rounded-lg py-2 px-4 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Follow-up Date:</label>
                <input
                  type="date"
                  name="followUpDate"
                  value={formData.followUpDate}
                  onChange={handleInputChange}
                  className="border rounded-lg py-2 px-4 w-full"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-600"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-600 ml-2"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-gray-200 py-4 text-center">
        <p className="text-gray-600">© 2024 Your Hospital. All Rights Reserved.</p>
      </footer>
    </div>
    </RoleBasedRoute>
  );
}
