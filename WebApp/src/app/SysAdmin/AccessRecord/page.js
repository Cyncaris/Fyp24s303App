"use client";
import React, { useState } from "react";
import Link from "next/link"; // Next.js Link for navigation

const AccessRecord = () => {
const [records] = useState([
    { id: 1, userId: "P123", role: "Patient", time: "05:30", date: "2023-09-01", status: "Success", duration: "5m30s", device: "iOS" },
    { id: 2, userId: "D456", role: "Doctor", time: "15:30", date: "2023-09-01", status: "Fail", duration: "10m55s", device: "Android" },
]);

const [searchTerm, setSearchTerm] = useState("");

const handleSearch = (e) => {
    setSearchTerm(e.target.value);
};

const filteredRecords = records.filter(
    (record) =>
    record.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.role.toLowerCase().includes(searchTerm.toLowerCase())
);

return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header Section */}
    <header className="bg-blue-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Access Record</h1>
        <nav>
            <ul className="flex space-x-4">
              {/* Navigation Links */}
            <li>
                <Link href="/SysAdmin/MainDashboard" className="hover:underline">
                Home
                </Link>
            </li>
            <li>
                <Link href="/app" className="hover:underline">
                Logout
                </Link>
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
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={handleSearch}
        />
        </div>

        {/* Table of Records */}
        <table className="w-full table-auto bg-white shadow-md rounded-lg">
        <thead className="border border-black">
            <tr className="bg-white text-gray-800">
            <th className="px-4 py-2">Record ID</th>
            <th className="px-4 py-2">User ID</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Time</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Login Status</th>
            <th className="px-4 py-2">Session Duration</th>
            <th className="px-4 py-2">Device Type</th>
            </tr>
        </thead>
        <tbody>
            {filteredRecords.map((record) => (
            <tr key={record.id} className="hover:bg-gray-700 text-gray-900">
                <td className="border border-gray-900 px-4 py-2">{record.id}</td>
                <td className="border border-gray-900 px-4 py-2">{record.userId}</td>
                <td className="border border-gray-900 px-4 py-2">{record.role}</td>
                <td className="border border-gray-900 px-4 py-2">{record.time}</td>
                <td className="border border-gray-900 px-4 py-2">{record.date}</td>
                <td className="border border-gray-900 px-4 py-2">{record.status}</td>
                <td className="border border-gray-900 px-4 py-2">{record.duration}</td>
                <td className="border border-gray-900 px-4 py-2">{record.device}</td>
            </tr>
            ))}
        </tbody>
        </table>
    </main>

      {/* Footer Section */}
    <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
        &copy; 2023 Access Records. All rights reserved.
        </div>
    </footer>
    </div>
);
};

export default AccessRecord;
