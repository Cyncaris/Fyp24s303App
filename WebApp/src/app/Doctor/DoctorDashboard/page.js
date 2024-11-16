'use client';

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Pusher from 'pusher-js';
import { QRCodeSVG } from "qrcode.react";
import RoleBasedRoute from '@/app/components/RoleBasedRoute';
import { ROLES } from '@/app/utils/roles';

const initPusher = () => {
  Pusher.logToConsole = false;
  return new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    encrypted: true,
    channelAuthorization: {
      endpoint: '/api/Pusher/auth',
      transport: 'ajax',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  });
};


export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isQrModalVisible, setQrModalVisible] = useState(false);
  const router = useRouter();
  const [qrData, setQrData] = useState('');
  const pusherRef = useRef(null);
  const channelRef = useRef(null);

  const getQRCode = async () => {
    try {
      const res = await axios.post('/api/qr-code');

      if (res.data.success) {
        const qr_url = `${res.data.data.sessionId}`;
        setQrData(qr_url);
        return qr_url;
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (e) {
      console.error('QR Code fetch error:', e);
      setError('Failed to fetch QR Code. Please try again.');
    }
    return null;
  };

  // Function to handle QR code authentication completion
  const handleQrAuthenticated = async (data, route) => {
    const currentRoute = route;
    try {

      const tokeUpdate = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/update-token`, {
        userId: data.user_id,
      }, {
        withCredentials: true // Important for handling cookies
      });

      if (!tokeUpdate.data.success) {
        throw new Error('Failed to generate token');
      }
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      setError('Failed to create session. Please try again.');
    }
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify-token`, {
      withCredentials: true
    });

    if (response.status !== 200) {
      throw new Error('Failed to verify token');
    } else {
      router.push('/Doctor/viewPatient');
    }
  };
  const setupPusherChannel = (channelData, route) => {
    // Clean up existing connection
    ;
    if (channelRef.current) {
      channelRef.current.unbind_all();
      channelRef.current.unsubscribe();
    }

    // Initialize Pusher if not already done
    if (!pusherRef.current) {
      pusherRef.current = initPusher();
    }

    // Subscribe to the channel
    const channel = pusherRef.current.subscribe(`private-${channelData}`);

    channel.bind('pusher:subscription_succeeded', () => {

    });
    channel.bind('pusher:subscription_error', (error) => {
      console.error('Pusher subscription error:', error);
      setError('Connection error. Please refresh.');
    });
    channel.bind('login-event', function (data) {
      handleQrAuthenticated(data, route);
    });
    channelRef.current = channel;
  };


  // Function to handle clicking the link
  const handleLinkClick = async (route, event) => {
    event.preventDefault();
    setLoading(true);
    const data = await getQRCode();
    if (data) {
      setupPusherChannel(data, route);
    }
    setQrModalVisible(true);
    setLoading(false);
  };

  // Function to handle closing the modal
  const closeModal = () => {
    if (channelRef.current) {
      channelRef.current.unbind_all();
      channelRef.current.unsubscribe();
    }
    if (pusherRef.current) {
      pusherRef.current.disconnect();
    }
    setQrModalVisible(false);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify-token`, {
          withCredentials: true
        });

        if (response.status === 401) {
          router.push('/unauthorized');
          return;
        }

        if (!response.data.success) {
          throw new Error('Verification failed');
        }

        const data = response.data;
        const userProfile = {
          username: data.user.username,
          role: data.user.role
        };

        setUser(userProfile);
      } catch (error) {
        console.error('Profile fetch error:', error);
        if (error.response?.status === 401) {
          router.push('/unauthorized');
        }
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <RoleBasedRoute allowedRoles={[ROLES.DOCTOR]} requireRestricted={false}>

      <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="bg-green-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {user && <h2 className="text-lg">Welcome, {user.username}</h2>}
          <nav>
            <ul className="flex space-x-4">
              {/* Navigation Links */}
              <li>
                <Link href="/Doctor/DoctorDashboard" className="hover:underline">Home</Link>
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
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full mx-0">
          <h3 className="text-xl font-bold text-gray-800 mb-8">Manage Your Dashboard</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <a 
            onClick={(e) => handleLinkClick('ViewPatient', e)}
            className="bg-green-600 w-full items-center border px-3 py-4 rounded-lg text-lg font-semibold shadow hover:shadow-md text-white transition-all duration-300">
              View Patients
            </a>
            <Link href="/Doctor/viewAppointment" 
            className="bg-green-600 w-full items-center border px-3 py-4 rounded-lg text-lg font-semibold shadow hover:shadow-md text-white transition-all duration-300">
              View Appointments
            </Link>
          </div>
        </div>
        {isQrModalVisible && (
            <QrCodeModal
              qrData={qrData} // Pass qrData as prop
              error={error}   // Pass error as prop
              loading={loading} // Pass loading as prop
              closeModal={closeModal} />
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
}

const QrCodeModal = ({ qrData, error, loading, closeModal }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative">
        <h2 className="text-lg font-bold mb-4">Scan QR Code to Proceed</h2>

        {error && (
          <div className="text-red-500 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center mb-4">
            <span>Loading QR code...</span>
          </div>
        ) : qrData ? (
          <div className="mb-4">
            <QRCodeSVG value={qrData} className="mx-auto" />
          </div>
        ) : (
          <div className="text-gray-500 mb-4">
            No QR code available
          </div>
        )}


        {/* Close Modal Button */}
        <button
          onClick={closeModal}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
};