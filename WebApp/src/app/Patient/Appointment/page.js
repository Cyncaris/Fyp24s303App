'use client';  // Mark this component as a Client Component

import React from "react";
import Link from "next/link"; // Use Next.js Link for navigation
import styles from "../../styles/Patient.module.css"; // Import CSS Modules stylesheet as styles;
import { useState } from 'react';


export default function Appointment() {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');

    const openModal = () => setIsOpen(true);
    const closeModal = () => {
        console.log("Before closing modal: ", isOpen); // should be true
        setIsOpen(false);
        console.log("After closing modal: ", isOpen); // might still show true due to async nature of setState
    };

    const handleSave = () => {
        // Logic to save the appointment
        console.log({
            title,
            date,
            time,
            location
        });
        closeModal();
    };

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            {/* Header Section */}
            <header className="bg-black text-white py-4 shadow-lg">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Appointment</h1>
                    <nav>
                        <ul className="flex space-x-4">
                            <li>
                                <a href="/Patient/PatientDashboard" className="hover:underline">Home</a> {/* Link to home page */}
                            </li>
                            <li>
                                <a href="#" className="hover:underline">Logout</a> {/* Link to logout or similar action */}
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
                        <div onClick={openModal} className="hover:cursor-pointer bg-black text-white p-4 rounded-lg shadow-md w-2/5 justify-self-center" >
                            <label className="font-bold text-lg text-center">Create Appointment</label>

                        </div>
                    </div>
                </div>
                {isOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-md shadow-lg max-w-md w-full">
                            <h2 className="text-xl font-bold mb-4">Create a New Appointment</h2>
                            <form>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Title</label>
                                    <input
                                        type="text"
                                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
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
                                    <input
                                        type="text"
                                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        required
                                    />
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
                            </form>
                        </div>
                    </div>
                )}
                <div className="flex items-center justify-center mt-5 mb-5 container" >
                    <div className="w-3/4 md:w-1/2 bg-white shadow-lg rounded-lg p-4">
                        <table className="table-auto min-w-full border border-spacing-4">
                            <tbody>
                                <tr>
                                    <th>Appointment ID</th>
                                    <th>Title</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Location</th>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>Checkup</td>
                                    <td>2023-05-01</td>
                                    <td>10:00 AM</td>
                                    <td>Room 101</td>
                                </tr>
                            </tbody>
                        </table>
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
};