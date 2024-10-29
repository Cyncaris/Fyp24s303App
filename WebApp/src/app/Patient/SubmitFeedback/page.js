'use client';  // Mark this component as a Client Component

import React from "react";
import Link from "next/link"; // Use Next.js Link for navigation
import { supabase } from "@/app/lib/supabaseClient"; // Import Supabase client
import styles from "../../styles/Patient.module.css"; // Import CSS Modules stylesheet as styles

import { useState } from 'react';

export default function SubmitFeedback() {
    // Define state for form fields
    const [suggestion, setSuggestion] = useState('');
    const [issueFaced, setIssueFaced] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent page reload
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const { data, error } = await supabase
                .from('feedback')
                .insert([
                    {
                        issues_faced: issueFaced,
                        suggestion: suggestion,
                        patient_id: 'your_patient_id' // Replace with actual patient_id, perhaps from user session
                    }
                ]);

            if (error) {
                setErrorMessage('Failed to submit feedback: ' + error.message);
            } else {
                setSuccessMessage('Feedback submitted successfully!');
                // Clear the form
                setSuggestion('');
                setIssueFaced('');
            }
        } catch (err) {
            setErrorMessage('An unexpected error occurred: ' + err.message);
        } finally {
            setLoading(false);
        }
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
                                <a href="/Patient/PatientDashboard">Back</a>
                            </li>
                            <li>
                                <a href="/Patient/PatientDashboard" className="hover:underline">Home</a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">Logout</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>
            <div className="flex items-center justify-center mt-5 mb-5">
                <div className="bg-white container px-4 border-solid border-2 rounded-sm">
                    <h1 className='mt-5 mb-2 text-2xl text-center font-bold'>Share your Feedback!</h1>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label className="" htmlFor="issueFaced">Issues Faced</label>
                            <input
                                className="bg-gray-100 h-12 w-full border border-gray-300 p-2 rounded-md text-base mb-2"
                                type="text"
                                id="issueFaced"
                                value={issueFaced}
                                onChange={(e) => setIssueFaced(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="" htmlFor="suggestion">Suggestion</label>
                            <textarea
                                className="bg-gray-100 h-40 w-full border border-gray-300 p-2 rounded-md text-base"
                                rows="5"
                                id="suggestion"
                                value={suggestion}
                                onChange={(e) => setSuggestion(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-5">
                            <button
                                className="bg-black text-white p-4 rounded-lg shadow-md items-center justify-between hover:bg-blue-600 transition"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                    {errorMessage && <p className="text-red-500 text-center mt-2">{errorMessage}</p>}
                    {successMessage && <p className="text-green-500 text-center mt-2">{successMessage}</p>}
                </div>
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
