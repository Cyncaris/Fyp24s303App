'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import RoleBasedRoute from '@/app/components/RoleBasedRoute'; // Import RoleBasedRoute component
import { ROLES } from '@/app/utils/roles'; // Import ROLES object 

export default function ViewAppointment() {
  const router = useRouter(); 
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [doctorId, setDoctorId] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    doctor_id: '',
    patient_id: '',
    title: '',
    date: '',
    time: '',
    location: '',
  });
  
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

      setDoctorId(userId);
      return userId;
    } catch (error) {
      console.error('Profile fetch error:', error);
      if (error.response?.status === 401) {
        router.push('/unauthorized');
      }
      setError('Failed to load user profile');
      return null;
    }
  };

  const fetchAppointments = async (docId) => {  // Add docId parameter
    if (!docId) {
      console.log('No doctor ID available');
      return;
    }
  
    try {
      setLoading(true);
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
          patient:useraccount!patient_id(
            first_name,
            last_name
          )
        `)
        .eq('doctor_id', docId)  // Use passed docId
        .order('date', { ascending: true });
  
      if (error) {
        console.error("Error fetching appointments:", error);
        throw error;
      }
  
      setAppointments(data || []);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      setError("Failed to fetch appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      const userId = await fetchUserProfile();
      if (userId) {
        await fetchAppointments(userId);
      }
    };

    initializePage();
  }, [router]);
  
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
      alert("Failed to update appointment. Please try again.");
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
      alert("Failed to cancel appointment. Please try again.");
    } else {
      setAppointments((prev) => prev.filter(appointment => appointment.id !== id));
      setSelectedAppointment(null);
      alert("Appointment canceled successfully!");
    }
  };

  return (
    <RoleBasedRoute allowedRoles={[ROLES.DOCTOR]} requireRestricted={false}>
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <header className="bg-green-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <nav>
            <ul className="flex space-x-4">
              <li><Link href="/Doctor/DoctorDashboard" className="hover:underline">Back</Link></li>
              <li><Link href="/Doctor/DoctorDashboard" className="hover:underline">Home</Link></li>
              <li><button onClick={Logout} className="hover:underline">Logout</button></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="bg-white shadow-md rounded-lg p-8 w-full mb-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Appointment Management</h3>
            <Link href="/Doctor/viewAppointment/createAppointment" className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 flex items-center">
              <span className="text-white">Create Appointment</span>
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-8 w-full">
          <h3 className="text-xl font-bold text-gray-800 mb-4">List of Appointments</h3>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={fetchAppointments}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No appointments found</p>
              <Link 
                href="/Doctor/viewAppointment/createAppointment" 
                className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700"
              >
                Create Your First Appointment
              </Link>
            </div>
          ) : (
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
                        {appointment.patient ? 
                          `${appointment.patient.first_name} ${appointment.patient.last_name}` : 
                          'Unknown Patient'} - {appointment.location}
                      </h4>
                      <p className="text-gray-600">
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </p>
                    </div>
                    
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedAppointment && (
          <div className="mt-8 bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Appointment Details</h2>
          
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Patient Name:</label>
              <p>
                {selectedAppointment.patient ? 
                  `${selectedAppointment.patient.first_name} ${selectedAppointment.patient.last_name}` : 
                  'Unknown Patient'}
              </p>
            </div>

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
                  <p>{new Date(selectedAppointment.date).toLocaleDateString()}</p>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">Visit Time:</label>
                  <p>{selectedAppointment.time}</p>
                </div>
              </>
            )}

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
    </RoleBasedRoute>
  );
}