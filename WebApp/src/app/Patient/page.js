"use client";

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

const PatientDashboard = () => {
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
  const handleQrAuthenticated = async (data,route) => {
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
      router.push('/Patient/PersonalRecord');
    }
  };
  const setupPusherChannel = (channelData,route) => {
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
      handleQrAuthenticated(data,route);
    });
    channelRef.current = channel;
  };


  // Function to handle clicking the link
  const handleLinkClick = async (route, event) => {
    event.preventDefault();


    setLoading(true);
    const data = await getQRCode();
    if (data) {
      setupPusherChannel(data,route);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <RoleBasedRoute allowedRoles={[ROLES.PATIENT]}>
      <div className="bg-gray-100 min-h-screen flex flex-col">
        <header className="bg-black text-white py-4 shadow-lg">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Patient Dashboard</h1>
            {user && <h2 className="text-lg">Welcome, {user.username}</h2>}
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link href="/Patient" className="hover:underline">
                    Home
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={handleLogout}
                    disabled={loading}
                    className="hover:underline disabled:opacity-50"
                  >
                    {loading ? 'Logging out...' : 'Logout'}
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <main className="flex-grow container mx-auto px-4 py-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Manage Your Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button  
                href="/Patient/PersonalRecord"
                onClick={(e) => handleLinkClick('PersonalRecord', e)}
                className="bg-black text-white p-4 rounded-lg shadow-md flex items-center justify-between hover:bg-gray-800 transition duration-300"
              >
                <span className="font-bold text-lg">View Personal Record</span>
                <i className="fas fa-user text-2xl"></i>
              </button>

              <Link
                href="/Patient/Appointment"
                className="bg-black text-white p-4 rounded-lg shadow-md flex items-center justify-between hover:bg-gray-800 transition duration-300"
              >
                <span className="font-bold text-lg">View Appointment</span>
                <i className="fas fa-calendar-alt text-2xl"></i>
              </Link>

              <Link
                href="/Patient/SubmitFeedback"
                className="bg-black text-white p-4 rounded-lg shadow-md flex items-center justify-between hover:bg-gray-800 transition duration-300"
              >
                <span className="font-bold text-lg">Submit Feedback</span>
                <i className="fas fa-comment text-2xl"></i>
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

        <footer className="bg-gray-800 text-white py-4">
          <div className="container mx-auto px-4 text-center">
            &copy; {new Date().getFullYear()} Hospital App. All rights reserved.
          </div>
        </footer>
      </div>
    </RoleBasedRoute>
  );
};

export default PatientDashboard;

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