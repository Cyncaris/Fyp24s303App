'use client';  // Mark this component as a Client Component

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import axios from 'axios';
import styles from "@/app/styles/Patient.module.css"; // Import CSS Modules stylesheet as styles
import { supabase } from '@/app/lib/supabaseClient'; // Import Supabase client
import RoleBasedRoute from '@/app/components/RoleBasedRoute'; // Import RoleBasedRoute component
import { ROLES } from '@/app/utils/roles'; // Import ROLES object // Import RoleBasedRoute component\

export default function Appointment() {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [patientId, setPatientId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [doctor, setDoctor] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [error, setError] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    const router = useRouter();

    // Predefined appointment types
    const appointmentTypes = [
        "Dental Checkup",
        "Physical Therapy",
        "Blood Pressure Check",
        "Cardiology Follow-up",
        "Vision Screening"
    ];

    // Predefined locations
    const locations = [
        "Room 101",
        "Room 102",
        "Room 201",
        "Room 305",
        "Room 410"
    ];

    const Logout = async () => {
        console.log('Logging out...');
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

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const handleSave = async () => {
        if (!patientId) {
            setErrorMessage('No patient ID available. Please try again.');
            return;
        }

        setErrorMessage('');
        try {
            const { data, error } = await supabase
                .from('appointments')
                .insert([
                    {
                        patient_id: patientId,
                        doctor_id: doctor,
                        title: title,
                        date: date,
                        time: time,
                        location: location,
                        is_upcoming: true
                    }
                ]);

            if (error) {
                setErrorMessage('Failed to save appointment: ' + error.message);
                return;
            }

            // Clear form fields and close modal
            setTitle('');
            setDate('');
            setTime('');
            setLocation('');
            setDoctor('');
            closeModal();

            // Fetch appointments again to update the list
            fetchAppointments(patientId);
        } catch (error) {
            setErrorMessage('Unexpected error: ' + error.message);
        }
    };

    const fetchListOfDoctors = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('useraccount')
                .select('id, first_name, last_name')
                .eq('role_id', '1');

            if (error) {
                console.error('Error fetching doctors:', error);
                setError('Failed to fetch list of doctors');
                setDoctors([]);
                return;
            }

            if (!data || data.length === 0) {
                setError('No doctors found');
                setDoctors([]);
                return;
            }

            setDoctors(data);
        } catch (err) {
            console.error('Unexpected error:', err);
            setError('An unexpected error occurred');
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    }

    const fetchAppointments = async (patientId) => {
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('patient_id', patientId)
            .eq('is_upcoming', true)  // Only fetch appointments where is_upcoming is true
            .order('date', { ascending: true });
        if (error) {
            setErrorMessage('Failed to fetch appointments: ' + error.message);
        } else {
            setAppointments(data);
        }
    };
    const handleCancel = async (appointmentId) => {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .delete()
                .eq('id', appointmentId);

            if (error) {
                setErrorMessage('Failed to cancel appointment: ' + error.message);
                return;
            }

            // Remove deleted appointment from the list
            setAppointments((prev) =>
                prev.filter((appointment) => appointment.id !== appointmentId)
            );
            setErrorMessage(''); // Clear any previous error message
        } catch (error) {
            setErrorMessage('Unexpected error: ' + error.message);
        }
    };


    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // Use the NEXT_PUBLIC_BACKEND_URL instead of relative path
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify-token`, {
                    withCredentials: true
                });
                if (response.status == 401) {
                    router.push('/unauthorized');
                    return;
                }

                if (!response.data.success) {
                    throw new Error('Verification failed');
                }

                const userId = response.data.user.userId;

                setPatientId(userId);

                fetchAppointments(userId);
            } catch (error) {
                if (error.response?.status === 401) {
                    // Clear auth state
                    setUser(null);
                    router.push('/unauthorized');
                }

                // Clear auth state
                // setUser(null);
                // document.cookie = 'authToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                // router.push('/unauthorized');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
        fetchListOfDoctors();
    }, [router]);
    const openConfirmModal = (appointmentId) => {
        setSelectedAppointmentId(appointmentId);
        setShowConfirmModal(true);
    };

    const closeConfirmModal = () => {
        setSelectedAppointmentId(null);
        setShowConfirmModal(false);
    };

    const confirmCancel = async () => {
        await handleCancel(selectedAppointmentId);
        closeConfirmModal();
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <RoleBasedRoute allowedRoles={[ROLES.PATIENT]}>
            <div className="bg-gray-100 min-h-screen flex flex-col">
                {/* Header Section */}
                <header className="bg-black text-white py-4 shadow-lg">
                    <div className="container mx-auto px-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold">Upcoming Appointments</h1>
                        <nav>
                            <ul className="flex space-x-4">
                                <li>
                                    <a href="/Patient">Back</a>
                                </li>
                                <li>
                                    <a href="/Patient/" className="hover:underline">Home</a>
                                </li>
                                <li>
                                    <a onClick={Logout} className="hover:underline">Logout</a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </header>
                {/* Main Content Section */}
                <main className="flex-grow container mx-auto px-4 py-8">
                    <div className={styles.AppointmentContainer}>
                        <div className="pt-6 pb-6 justify-self-center">
                            <h1 className="text-xl text-center font-bold">Book an Appointment?</h1>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                            <div onClick={openModal} className="hover:cursor-pointer bg-black text-white p-4 rounded-lg shadow-md w-2/5 justify-self-center">
                                <label className="font-bold text-lg text-center">Create Appointment</label>
                            </div>
                        </div>
                    </div>
                    {isOpen && (
                        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                            <div className="bg-white p-6 rounded-md shadow-lg max-w-md w-full">
                                <h2 className="text-xl font-bold mb-4">Create a New Appointment</h2>
                                <form onSubmit={(e) => e.preventDefault()}>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Title</label>
                                        <select
                                            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        >
                                            <option value="">Select an Appointment Type</option>
                                            {appointmentTypes.map((type) => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Date</label>
                                        <input
                                            type="date"
                                            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Time</label>
                                        <input
                                            type="time"
                                            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Location</label>
                                        <select
                                            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            required
                                        >
                                            <option value="">Select a Location</option>
                                            {locations.map((loc) => (
                                                <option key={loc} value={loc}>{loc}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Doctor</label>
                                        {loading ? (
                                            <div className="animate-pulse flex items-center justify-center h-10 bg-gray-100 rounded-md">
                                                <span className="text-gray-500">Loading doctors...</span>
                                            </div>
                                        ) : error ? (
                                            <div className="flex items-center justify-between p-2 border border-red-300 rounded-md bg-red-50">
                                                <span className="text-red-500">{error}</span>
                                                <button
                                                    onClick={fetchListOfDoctors}
                                                    className="text-sm text-blue-500 hover:text-blue-700"
                                                >
                                                    Retry
                                                </button>
                                            </div>
                                        ) : (
                                            <select
                                                className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={doctor}
                                                onChange={(e) => setDoctor(e.target.value)}
                                                required
                                            >
                                                <option value="">Select a Doctor</option>
                                                {doctors.map((dr) => (
                                                    <option key={dr.id} value={dr.id}>
                                                        Dr. {dr.first_name} {dr.last_name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                    <div className="flex justify-end space-x-4">
                                        <button
                                            type="button"
                                            onClick={handleSave}
                                            className="bg-green-500 text-white px-4 py-2 rounded-md"
                                        >
                                            Save Appointment
                                        </button>
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="bg-red-500 text-white px-4 py-2 rounded-md"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                    {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
                                </form>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center justify-center mt-5 mb-5 container">
                        <div className="w-3/4 md:w-1/2 bg-white shadow-lg rounded-lg p-4">
                            <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
                            <table className="table-auto min-w-full border border-spacing-4">
                                <thead>
                                    <tr>
                                        <th className="text-center">Title</th>
                                        <th className="text-center">Date</th>
                                        <th className="text-center">Time</th>
                                        <th className="text-center">Location</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((appointment) => (
                                        <tr
                                            key={appointment.id}
                                            className="hover:bg-gray-200 cursor-pointer"
                                            onClick={() => openConfirmModal(appointment.id)}
                                        >
                                            <td className="text-center">{appointment.title}</td>
                                            <td className="text-center">{appointment.date}</td>
                                            <td className="text-center">{appointment.time}</td>
                                            <td className="text-center">{appointment.location}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
                {/* Confirmation Modal */}
                {showConfirmModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-md shadow-lg max-w-md w-full">
                            <h2 className="text-xl font-bold mb-4">Confirm Cancellation</h2>
                            <p>Are you sure you want to cancel this appointment?</p>
                            <div className="flex justify-end space-x-4 mt-4">
                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded-md"
                                    onClick={confirmCancel}
                                >
                                    Yes, Cancel
                                </button>
                                <button
                                    className="bg-gray-500 text-white px-4 py-2 rounded-md"
                                    onClick={closeConfirmModal}
                                >
                                    No, Go Back
                                </button>
                            </div>
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
        </RoleBasedRoute>
    );
}
