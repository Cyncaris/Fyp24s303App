"use client"; // Mark this component as a Client Component

import React, { useState } from "react";
import Link from "next/link"; // Use Next.js Link for navigation if applicable

const ViewAccount = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  // Sample user data
  const users = [
    { name: "John Doe", email: "john.doe@example.com", role: "Doctor", latestActivity: "2023-10-01 14:30:00", isActive: "Yes" },
    { name: "Jane Smith", email: "jane.smith@example.com", role: "Nurse", latestActivity: "2023-10-02 09:15:00", isActive: "No" },
    { name: "Emily Johnson", email: "emily.johnson@example.com", role: "Receptionist", latestActivity: "2023-10-03 11:45:00", isActive: "Yes" },
  ];

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">View Account</h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/SysAdmin/MainDashboard" className="hover:underline">Home</Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">Logout</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Account Management</h2>

          {/* Search Box */}
          <div className="mb-6">
            <label htmlFor="search" className="block text-gray-700 font-bold mb-2">Search Users</label>
            <input
              type="text"
              id="search"
              name="search"
              className="w-full p-2 border border-gray-300 rounded-lg text-gray-800"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* List of Users */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">All Users</h3>
            <div className="h-48 overflow-y-auto border border-gray-800 rounded-lg p-2">
              <ul id="user-list">
                {filteredUsers.map(user => (
                  <li
                    key={user.email}
                    className="p-2 border-b border-gray-800 cursor-pointer hover:bg-gray-100 text-gray-800"
                    onClick={() => handleUserClick(user)}
                  >
                    {user.name} - {user.email}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Account Details */}
          {selectedUser && (
            <div id="account-details">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Account Details</h3>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full p-2 border border-gray-800 rounded-lg text-gray-700"
                  value={selectedUser.email}
                  disabled
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                  value="********" // Placeholder
                  disabled
                />
              </div>
              <div className="mb-4">
                <label htmlFor="first-name" className="block text-gray-700 font-bold mb-2">First Name</label>
                <input
                  type="text"
                  id="first-name"
                  name="first-name"
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                  value={selectedUser.name.split(' ')[0]}
                  disabled
                />
              </div>
              <div className="mb-4">
                <label htmlFor="last-name" className="block text-gray-700 font-bold mb-2">Last Name</label>
                <input
                  type="text"
                  id="last-name"
                  name="last-name"
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                  value={selectedUser.name.split(' ')[1] || ''}
                  disabled
                />
              </div>
              <div className="mb-4">
                <label htmlFor="role" className="block text-gray-700 font-bold mb-2">Role</label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                  value={selectedUser.role}
                  disabled
                />
              </div>
              <div className="mb-4">
                <label htmlFor="latest-activity" className="block text-gray-700 font-bold mb-2">Latest Activity</label>
                <input
                  type="text"
                  id="latest-activity"
                  name="latest-activity"
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                  value={selectedUser.latestActivity}
                  disabled
                />
              </div>
              <div className="mb-4">
                <label htmlFor="is-active" className="block text-gray-700 font-bold mb-2">Is Active?</label>
                <input
                  type="text"
                  id="is-active"
                  name="is-active"
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                  value={selectedUser.isActive}
                  disabled
                />
              </div>
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full">
                Edit Account
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          &copy; 2023 Hospital App. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default ViewAccount;
