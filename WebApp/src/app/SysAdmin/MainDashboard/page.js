'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link"; // Use Next.js Link for navigation
import axios from "axios";
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from "qrcode.react";

import RoleBasedRoute from '@/app/components/RoleBasedRoute'; // Import RoleBasedRoute component
import { ROLES } from '@/app/utils/roles'; // Import ROLES object

const Dashboard = () => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [isQrModalVisible, setQrModalVisible] = useState(false);
  const router = useRouter();

  // Function to handle clicking the link
  const handleLinkClick = (event) => {
    event.preventDefault(); // Prevent the default link behavior
    setQrModalVisible(true); // Show the QR code modal
  };

  // Function to handle closing the modal
  const closeModal = () => {
    setQrModalVisible(false);
  };

  // Function to handle QR code authentication completion
  const handleQrAuthenticated = () => {
    setQrModalVisible(false);
    // Programmatically navigate to the restricted page after successful authentication
    router.push('/SysAdmin/ManageAccountDashboard');
  };

  const Logout = async () => {
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


  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify-token`, {
          withCredentials: true
        });

        if (!response.status === 200) {
          throw new Error('Failed to fetch user profile');
        }
        
        const data = response.data;
        const testuser =  {
          username: data.user.username,
          role: data.user.role
        }
        
        
        console.log(testuser);
        if (data.success) {
          setUser(testuser); // The user data from your verify-token endpoint
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}> {/* Only allow SysAdmin role */}
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="bg-blue-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <h2 className="text-lg">Welcome, {user.username}</h2> {/* Display user name */}
          <nav>
            <ul className="flex space-x-4">
              <li>
                <a href="#" className="hover:underline">Home</a> {/* Link to home page */}
              </li>
              <li>
                <a onClick={Logout} className="hover:underline">Logout</a> {/* Link to logout or similar action */}
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content Section */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Manage Your Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Manage Account Link */}
            <Link
              href="/SysAdmin/ManageAccountDashboard" // Path to the Manage Account page
              className="bg-blue-500 text-white p-4 rounded-lg shadow-md flex items-center justify-between hover:bg-blue-600 transition"
              onClick={handleLinkClick} // Handle the link click event
            >
              <span className="font-bold text-lg">Manage Account</span>
              <i className="fas fa-user-cog text-2xl"></i>
            </Link>

            {/* Manage Role Link */}
            <a
              href="/SysAdmin/ManageRoleDashboard" // Placeholder link, replace with actual URL if available
              className="bg-blue-500 text-white p-4 rounded-lg shadow-md flex items-center justify-between hover:bg-blue-600 transition"
            >
              <span className="font-bold text-lg">Manage Role</span>
              <i className="fas fa-users-cog text-2xl"></i>
            </a>
          </div>
        </div>
        {isQrModalVisible && (
        <QrCodeModal closeModal={closeModal} onQrAuthenticated={handleQrAuthenticated} />
      )}
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

export default Dashboard;

const QrCodeModal = ({ closeModal, onQrAuthenticated }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative">
        <h2 className="text-lg font-bold mb-4">Scan QR Code to Proceed</h2>
        
        {/* QR Code Component */}
        <QRCode value="https://your-backend.com/restricted-access?token=unique-token-here" className="mx-auto mb-4" />

        {/* Simulated Authentication (for demonstration purposes) */}
        <button
          onClick={() => {
            // Simulate successful QR authentication
            alert('QR Code Scanned and Authenticated!');
            onQrAuthenticated();
          }}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition mb-4"
        >
          Authenticate (Simulated)
        </button>

        {/* Close Modal Button */}
        <button
          onClick={closeModal}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};
