"use client";
import React, { useState } from "react";
import Link from "next/link"; // Next.js Link for navigation

const ManageRoleDashboard = () => {
    const [searchTerm, setSearchTerm] = useState("");
const [users] = useState([
    { name: "John Doe", role: "Admin" },
    { name: "Jane Smith", role: "Doctor" },
    { name: "Emily Johnson", role: "Patient" },
]);

const filteredUsers = users.filter(
    (user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
);

return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header Section */}
    <header className="bg-blue-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Account</h1>
        <nav>
            <ul className="flex space-x-4">
            <li>
                <Link href="/SysAdmin/MainDashboard" className="hover:underline">
                Back
                </Link>
            </li>
            <li>
                <Link href="/app" className="hover:underline">
                Home
                </Link>
            </li>
            <li>
                <a href="#" className="hover:underline">
                Logout
                </a>
            </li>
            </ul>
        </nav>
        </div>
    </header>

      {/* Main Content Section */}
    <main className="flex-grow container mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Role Management</h2>

        {/* Search Box */}
        <div className="mb-4">
        <input
            type="text"
            className="w-full p-2 border border-gray-800 rounded-lg"
            placeholder="Search by name or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
        </div>

        {/* User List */}
        <h3 className="text-lg font-semibold text-gray-800 mb-4">All Users</h3>
        <ul className="border border-gray-600 rounded-lg divide-y divide-gray-600 bg-white text-gray-800">
        {filteredUsers.map((user, index) => (
            <li
            key={index}
            className="p-4 hover:bg-gray-300 border border-gray-600"
            >
            {user.name} - {user.role}
            </li>
        ))}
        </ul>
    </main>

      {/* Footer Section */}
    <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
        &copy; 2023 Role Management Dashboard. All rights reserved.
        </div>
    </footer>
    </div>
);
};

export default ManageRoleDashboard;