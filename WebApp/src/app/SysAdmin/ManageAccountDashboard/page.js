"use client";
import RoleBasedRoute from '@/app/components/RoleBasedRoute'; // Import RoleBasedRoute component
import { ROLES } from '@/app/utils/roles'; // Import ROLES object
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import axios from "axios";

const ManageAccountDashboard = () => {
  const router = useRouter();
  const [error, setError] = useState(""); // Add this at the top
  

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

  return (
    <RoleBasedRoute allowedRoles={[ROLES.ADMIN]} requireRestricted={true}>  {/* Check if the user is a System Admin */}
      <div className="bg-gray-100 min-h-screen flex flex-col">
        {/* Header Section */}
        <header className="bg-blue-600 text-white py-4 shadow-lg">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Manage Account Dashboard</h1>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <a href="MainDashboard" className="hover:underline">Home</a> {/* Link to main dashboard */}
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
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Manage Your Account</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* View Access Record Link */}
              <a
                href="/SysAdmin/AccessRecord"
                className="bg-blue-500 text-white p-4 rounded-lg shadow-md flex items-center justify-between hover:bg-blue-600 transition"
              >
                <span className="font-bold text-lg">View Access Record</span>
                <i className="fas fa-file-alt text-2xl"></i>
              </a>
              {/* View Account Link */}
              <a
                href="/SysAdmin/ViewAccount"
                className="bg-blue-500 text-white p-4 rounded-lg shadow-md flex items-center justify-between hover:bg-blue-600 transition"
              >
                <span className="font-bold text-lg">View Account</span>
                <i className="fas fa-user text-2xl"></i>
              </a>
              {/* Create Account Link */}
              <a
                href="/SysAdmin/CreateAccount" // Link to the Create Account page
                className="bg-blue-500 text-white p-4 rounded-lg shadow-md flex items-center justify-between hover:bg-blue-600 transition"
              >
                <span className="font-bold text-lg">Create Account</span>
                <i className="fas fa-user-plus text-2xl"></i>
              </a>
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
    </RoleBasedRoute>
  );
};

export default ManageAccountDashboard;
