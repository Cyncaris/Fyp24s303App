'use client';

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from "qrcode.react";
import Pusher from 'pusher-js';
import RoleBasedRoute from '@/app/components/RoleBasedRoute'; // Import RoleBasedRoute component
import { ROLES } from '@/app/utils/roles'; // Import ROLES object

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

const Dashboard = () => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isQrModalVisible, setQrModalVisible] = useState(false);
  const router = useRouter();
  const [qrData, setQrData] = useState('');
  const [error, setError] = useState('');
  const [destinationRoute, setDestinationRoute] = useState('');
  const pusherRef = useRef(null);
  const channelRef = useRef(null);
  const routeRef = useRef(null);

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
  const handleQrAuthenticated = async (data) => {
    const currentRoute = routeRef.current;
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
      console.log('destinationRoute:', currentRoute);
      setQrModalVisible(false);
      if (currentRoute) {
        console.log('Navigating to:', currentRoute);
        switch (currentRoute) {
          case 'ManageAccount':
            router.push('/SysAdmin/ManageAccountDashboard');
            break;
          case 'ManageRole':
            router.push('/SysAdmin/ManageRoleDashboard');
            break;
          default:
            console.error('Unknown destination route:', currentRoute);
        }
      } else {
        console.error('No destination route specified');
      }
    }
  };

  const setupPusherChannel = (channelData) => {
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
      handleQrAuthenticated(data);
    });
    channelRef.current = channel;
  };


  // Function to handle clicking the link
  const handleLinkClick = async (route, event) => {
    event.preventDefault();
    setDestinationRoute(route);
    routeRef.current = route;
    console.log('Setting destination route to:', route);

    setLoading(true);
    const data = await getQRCode();
    if (data) {
      setupPusherChannel(data);
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

        const data = response.data;
        const userProfile = {
          username: data.user.username,
          role: data.user.role
        };

        setUser(userProfile);

      } catch (error) {
        if (error.response.status === 401) {
          // Clear auth state
          setUser(null);
          router.push('/unauthorized');
        }

        // Clear auth state
        setUser(null);
        document.cookie = 'authToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/unauthorized');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

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
              <a
                href="#"
                className="bg-blue-500 text-white p-4 rounded-lg shadow-md flex items-center justify-between hover:bg-blue-600 transition"
                onClick={(e) => handleLinkClick('ManageAccount', e)}
              >
                <span className="font-bold text-lg">Manage Account</span>
                <i className="fas fa-user-cog text-2xl"></i>
              </a>

              {/* Manage Role Link */}
              <a
                href="#"
                className="bg-blue-500 text-white p-4 rounded-lg shadow-md flex items-center justify-between hover:bg-blue-600 transition"
                onClick={(e) => handleLinkClick('ManageRole', e)}
              >
                <span className="font-bold text-lg">Manage Role</span>
                <i className="fas fa-users-cog text-2xl"></i>
              </a>
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
};

export default Dashboard;

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
