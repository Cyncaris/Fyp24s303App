"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link"; // Next.js Link for navigation
import { supabase } from "@/app/lib/supabaseClient";
import RoleBasedRoute from '@/app/components/RoleBasedRoute'; // Import RoleBasedRoute component
import { ROLES } from '@/app/utils/roles'; // Import ROLES object // Ensure the correct path for Supabase client
import { useRouter } from "next/navigation";
import axios from "axios";

const AccessRecord = () => {
    const [records, setRecords] = useState([]); // Store fetched records
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    // Logout Function
    const handleLogout = async () => {
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

    // Fetch access records from Supabase
    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const { data, error } = await supabase
                    .from("useraccount") // Replace with your actual table name
                    .select("id, email, first_name, last_name, is_active, created_at");
                if (error) {
                    throw error;
                }
                setRecords(data); // Set the records retrieved from Supabase
            } catch (err) {
                setError("Failed to fetch records: " + err.message);
            }
        };
        fetchRecords();
    }, []);

    // Handle search
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter records based on search term
    const filteredRecords = records.filter((record) => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
            (record.first_name?.toLowerCase() || "").includes(searchTermLower) ||
            (record.last_name?.toLowerCase() || "").includes(searchTermLower) ||
            (record.email?.toLowerCase() || "").includes(searchTermLower)
        );
    });
    // Handle suspend account
    const handleSuspend = async (userId) => {
        try {
            const { error } = await supabase
                .from("useraccount") // Assuming this is your users table
                .update({ is_active: false }) // Update the user's active status
                .eq("id", userId); // Use the 'id' to identify the user to update

            if (error) {
                throw error;
            }

            // Update local state to immediately reflect the change
            const updatedRecords = records.map((record) =>
                record.id === userId ? { ...record, is_active: false } : record
            );
            setRecords(updatedRecords); // Set the updated records

        } catch (err) {
            setError("Failed to suspend account: " + err.message);
        }
    };

    return (
        <RoleBasedRoute allowedRoles={[ROLES.ADMIN]} requireRestricted={true}>
            <div className="bg-gray-100 min-h-screen flex flex-col">
                {/* Header Section */}
                <header className="bg-blue-600 text-white py-4 shadow-lg">
                    <div className="container mx-auto px-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold">Access Record</h1>
                        <nav>
                            <ul className="flex space-x-4">
                                {/* Navigation Links */}
                                <li>
                                    <a href="/SysAdmin/ManageAccountDashboard">Back</a>
                                </li>
                                <li>
                                    <Link href="/SysAdmin/MainDashboard" className="hover:underline">
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <button onClick={handleLogout} className="hover:underline">
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </header>

                {/* Main Content Section */}
                <main className="flex-grow container mx-auto px-4 py-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Account Management</h2>

                    {/* Search Box */}
                    <div className="mb-4">
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-800 rounded-lg"
                            placeholder="Search by first name, last name, or email"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>

                    {/* Table of Records */}
                    <table className="w-full table-auto bg-white shadow-md rounded-lg">
                        <thead className="border border-black">
                            <tr className="bg-white text-gray-800">
                                <th className="px-4 py-2">Record ID</th>
                                <th className="px-4 py-2">First Name</th>
                                <th className="px-4 py-2">Last Name</th>
                                <th className="px-4 py-2">Email</th>
                                <th className="px-4 py-2">Active</th>
                                <th className="px-4 py-2">Created At</th>
                                <th className="px-4 py-2">Actions</th> {/* Add Actions column */}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.length > 0 ? (
                                filteredRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-700 text-gray-900">
                                        <td className="border border-gray-900 px-4 py-2">{record.id}</td>
                                        <td className="border border-gray-900 px-4 py-2">{record.first_name}</td>
                                        <td className="border border-gray-900 px-4 py-2">{record.last_name}</td>
                                        <td className="border border-gray-900 px-4 py-2">{record.email}</td>
                                        <td className="border border-gray-900 px-4 py-2">{record.is_active ? "Yes" : "No"}</td>
                                        <td className="border border-gray-900 px-4 py-2">{record.created_at}</td>
                                        <td className="border border-gray-900 px-4 py-2">
                                            {/* Suspend Account Button */}
                                            {record.is_active && (
                                                <button
                                                    className="bg-red-500 text-white px-4 py-2 rounded"
                                                    onClick={() => handleSuspend(record.id)}
                                                >
                                                    Suspend Account
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center text-gray-500 py-4">
                                        No records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                </main>

                {/* Footer Section */}
                <footer className="bg-gray-800 text-white py-4">
                    <div className="container mx-auto px-4 text-center">
                        &copy; 2023 Access Records. All rights reserved.
                    </div>
                </footer>
            </div>
        </RoleBasedRoute>
    );
};

export default AccessRecord;
