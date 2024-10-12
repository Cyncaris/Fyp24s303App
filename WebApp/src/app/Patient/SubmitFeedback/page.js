'use client';  // Mark this component as a Client Component

import React from "react";
import Link from "next/link"; // Use Next.js Link for navigation
import styles from "../../styles/Patient.module.css"; // Import CSS Modules stylesheet as styles

import { useState } from 'react';

export default function SubmitFeedback() {
    // Define state for form fields
    const [suggestion, setSuggestion] = useState('');
    const [issueFaced, setIssueFaced] = useState('');

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent page reload

        // Log form data (you can send it to an API instead)
        console.log({
            suggestion,
            issueFaced,
        });

        // Clear the form
        setSuggestion('');
        setIssueFaced('');
        alert('Feedback submitted successfully!');
    };

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            {/* Header Section */}
            <header className="bg-black text-white py-4 shadow-lg">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Feedback</h1>
                    <nav>
                        <ul className="flex space-x-4">
                            <li>
                                <a href="/Patient/PatientDashboard">Back</a> {/* Link to back to previous page */}
                            </li>
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
            <div className="bg-white contianer mx-auto px-4 border-solid mt-10 mb-5 border-2 rounded-sm">
                <h1 className='mt-5 mb-2 text-2xl text-center font-bold'>Share your Feedback!</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label className="" htmlFor="issueFaced">Issues Faced</label>
                        <input
                            className="bg-gray-100 h-12 w-full border border-gray-300 p-2 rounded-md text-base mb-2"
                            type="text"
                        />
                    </div>
                    <div>
                        <label className="" htmlFor="suggestion">Suggestion</label>
                        <textarea
                            className="bg-gray-100 h-40 w-full border border-gray-300 p-2 rounded-md text-base"
                            rows="5"
                        />  
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-5">
                        <button className="bg-black text-white p-4 rounded-lg shadow-md items-center justify-between hover:bg-blue-600 transition" type="submit">Submit</button>
                    </div>
                </form>
            </div>


            {/* Footer Section */}
            <footer className="bg-gray-800 text-white py-4">
                <div className="container mx-auto px-4 text-center">
                    &copy; 2023 Hospital App. All rights reserved.
                </div>
            </footer>
        </div>
    );
};
