'use client';  // Mark this component as a Client Component

import React, { useState, useEffect } from "react";
import { supabase } from '@/app/lib/supabaseClient'; // Import Supabase client
import RoleBasedRoute from '@/app/components/RoleBasedRoute'; // Import RoleBasedRoute component
import { ROLES } from '@/app/utils/roles'; // Import ROLES object
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function SubmitFeedback() {
    // Define state for form fields
    const [suggestion, setSuggestion] = useState('');
    const [issueFaced, setIssueFaced] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [patientId, setPatientId] = useState(null);
    const router = useRouter();

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
                        patient_id: patientId // Replace with actual patient_id, perhaps from user session
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
    const handleLogout = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/logout`,
                {},
                { withCredentials: true }
            );

            if (response.status === 200) {
                router.push('/');
            } else {
                throw new Error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
            setError('Failed to logout. Please try again.');
        } finally {
            setLoading(false);
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

    }, [router]);

    return (
        <RoleBasedRoute allowedRoles={[ROLES.PATIENT]}>
            <div className="bg-gray-100 min-h-screen flex flex-col">
                {/* Header Section */}
                <header className="bg-black text-white py-4 shadow-lg">
                    <div className="container mx-auto px-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold">Feedback</h1>
                        <nav>
                            <ul className="flex space-x-4">
                                <li>
                                    <a href="/Patient">Back</a>
                                </li>
                                <li>
                                    <a href="/Patient" className="hover:underline">Home</a>
                                </li>
                                <li>
                                    <a onClick={handleLogout} className="hover:underline">Logout</a>
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
        </RoleBasedRoute>
    );
};
