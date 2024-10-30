'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export default function ViewAppointment() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    doctor_id: '',
    patient_id: '',
    title: '',
    date: '',
    time: '',
    location: '',
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          doctor_id,
          patient_id,
          title,
          date,
          time,
          location,
          useraccount:patient_id ( first_name, last_name )
        `);

      if (error) {
        console.error("Error fetching appointments:", error);
      } else {
        setAppointments(data);
      }
    };
    fetchAppointments();
  }, []);

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      doctor_id: appointment.doctor_id,
      patient_id: appointment.patient_id,
      title: appointment.title,
      date: appointment.date,
      time: appointment.time,
      location: appointment.location,
    });
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData({
      doctor_id: selectedAppointment.doctor_id,
      patient_id: selectedAppointment.patient_id,
      title: selectedAppointment.title,
      date: selectedAppointment.date,
      time: selectedAppointment.time,
      location: selectedAppointment.location,
    });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSaveChanges = async () => {
    const { id } = selectedAppointment;

    if (!formData.title || !formData.date || !formData.time || !formData.location) {
      alert("Please fill in all the required fields.");
      return;
    }

    const { error } = await supabase
      .from('appointments')
      .update({
        doctor_id: formData.doctor_id,
        patient_id: formData.patient_id,
        title: formData.title,
        date: formData.date,
        time: formData.time,
        location: formData.location,
      })
      .eq('id', id);

    if (error) {
      console.error("Error updating appointment:", error);
    } else {
      setAppointments((prev) => 
        prev.map(appointment => 
          appointment.id === id ? { ...appointment, ...formData } : appointment
        )
      );
      setIsEditing(false);
      alert("Appointment updated successfully!");
    }
  };

  const handleCancelAppointment = async () => {
    const { id } = selectedAppointment;

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error canceling appointment:", error);
    } else {
      setAppointments((prev) => prev.filter(appointment => appointment.id !== id));
      setSelectedAppointment(null);
      alert("Appointment canceled successfully!");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <header className="bg-green-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <nav>
            <ul className="flex space-x-4">
              <li><Link href="/Doctor/DoctorDashboard" className="hover:underline">Back</Link></li>
              <li><Link href="/Doctor/DoctorDashboard" className="hover:underline">Home</Link></li>
              <li><Link href="/" className="hover:underline">Logout</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="bg-white shadow-md rounded-lg p-8 w-full mb-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Appointment does not exist?</h3>
            <Link href="/Doctor/viewAppointment/createAppointment" className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 flex items-center">
              <span className="text-white">Create Appointment</span>
            </Link>
          </div>
        </div>

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
                    <h4 className="text-lg font-semibold text-gray-900">
                      {appointment.useraccount?.first_name} {appointment.useraccount?.last_name} - {appointment.location}
                    </h4>
                    <p className="text-gray-600">{appointment.date} at {appointment.time}</p>
                  </div>
                  <span className="text-blue-500 hover:underline">View Details</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedAppointment && (
          <div className="mt-8 bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Appointment Details</h2>
            
            {/* Appointment Details Section */}
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Doctor ID:</label>
              <p>{selectedAppointment.doctor_id}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Patient ID:</label>
              <p>{selectedAppointment.patient_id}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Name:</label>
              <p>{selectedAppointment.useraccount?.first_name} {selectedAppointment.useraccount?.last_name}</p>
            </div>

    {/* Editable Fields */}
    {isEditing ? (
      <>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="border border-gray-300 p-2 rounded-lg w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Location:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="border border-gray-300 p-2 rounded-lg w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Visit Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="border border-gray-300 p-2 rounded-lg w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Visit Time:</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            className="border border-gray-300 p-2 rounded-lg w-full"
          />
        </div>
      </>
    ) : (
      <>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Title:</label>
          <p>{selectedAppointment.title}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Location:</label>
          <p>{selectedAppointment.location}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Visit Date:</label>
          <p>{selectedAppointment.date}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Visit Time:</label>
          <p>{selectedAppointment.time}</p>
        </div>
      </>
    )}

    {/* Action Buttons */}
    <div className="flex space-x-4 mt-6">
      {!isEditing && (
        <button
          onClick={handleCancelAppointment}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Cancel Appointment
        </button>
      )}
      {isEditing ? (
        <>
          <button
            onClick={handleSaveChanges}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Save Changes
          </button>
          <button
            onClick={handleCancelEdit}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Cancel Edit
          </button>
        </>
      ) : (
        <button
          onClick={handleEditClick}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Edit Appointment
        </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
