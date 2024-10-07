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
            <div className={styles.container}>
                <h1 className='heading1'>Share your Feedback!</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label className="fb_label" htmlFor="issueFaced">Issues Faced</label>
                        <input
                            type="text"
                            id="issueFaced"
                            value={issueFaced}
                            onChange={(e) => setIssueFaced(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="fb_label" htmlFor="suggestion">Suggestion</label>
                        <textarea
                            id="suggestion"
                            value={suggestion}
                            onChange={(e) => setSuggestion(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Submit</button>
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
