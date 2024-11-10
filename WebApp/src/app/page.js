'use client';

import { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import Pusher from 'pusher-js';
import axios from "axios";
import { useRouter } from 'next/navigation';

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

export default function Login() {
  const [qrData, setQrData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pusherRef = useRef(null);
  const channelRef = useRef(null);
  const router = useRouter();

  const getQRCode = async () => {
    try {
      const res = await axios.post('/api/qr-code');
      console.log('QR Code API Response:', res);
      console.log('QR Code API Response Data:', res.data.data.sessionId);
      if (res.data.success) {
        setQrData(res.data.data.sessionId);
        console.log('QR Data Set:', res.data.data);
        return res.data.data;
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (e) {
      console.error('QR Code fetch error:', e);
      setError('Failed to fetch QR Code. Please try again.');
    }
    return null;
  };

  const validateQRCode = async (channel) => {
    try {
      const res = await axios.post('/api/validate-qr', { channel });
      if (res.data.success) {
        console.log('Session is valid:', res.data);
        return true;
      } else {
        console.warn('Validation failed:', res.data.msg);
        setError(res.data.msg);
        return false;
      }
    } catch (error) {
      console.error("Error validating session:", error);
      setError('Error validating session. Please try again.');
      return false;
    }
  };

  const handleLogin = async (data) => {
    console.log('Received login data:', data.token);

    try {
      // if (!data?.channel) {
      //   throw new Error('Invalid login data');
      // }

      // Validate the QR code session before logging in
      const isValidSession = await validateQRCode(data.token);
      if (!isValidSession) {
        console.warn("Session validation failed. Please refresh the QR code.");
        return;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
      return;
    }
    const user = await axios.get('/api/get-user', { params: { user_id: data.user_id } });
    console.log('User data:', user.data.data.name);

    try {
      const tokenResponse = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gen-token`, {
        userId: data.user_id,
        username: user.data.data.name // Make sure this matches your user data structure
      }, {
        withCredentials: true // Important for handling cookies
      });

      if (!tokenResponse.data.success) {
        throw new Error('Failed to generate token');
      }

      console.log('Token generated successfully');

      // // Store user info if needed (avoid storing sensitive data)
      // localStorage.setItem('user_info', JSON.stringify({
      //   userId: data.user_id,
      //   role: user.data.data.role_id
      // }));

      // Handle routing based on role
      const userRole = user.data.data.role_id;
      switch (userRole) {
        case 1:
          console.log('Redirecting to Doctor dashboard...');
          router.push('/Doctor/MainDashboard');
          break;
        case 2:
          console.log('Redirecting to Patient dashboard...');
          router.push('/Patient');
          break;
        case 3:
          console.log('Redirecting to Admin dashboard...');
          router.push('/SysAdmin/MainDashboard');
          break;
        default:
          console.error('Invalid user role:', userRole);
          setError('Login failed: Invalid user role');
          return;
      }

    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      setError('Failed to create session. Please try again.');
    }

  };

  const setupPusherChannel = (channelData) => {
    // Clean up existing connection
    if (channelRef.current) {
      channelRef.current.unbind_all();
      channelRef.current.unsubscribe();
    }

    // Initialize Pusher if not already done
    if (!pusherRef.current) {
      pusherRef.current = initPusher();
    }

    // Subscribe to the channel
    const channel = pusherRef.current.subscribe(`private-${channelData.sessionId}`);

    console.log('Subscribing to channel:', `private-${channelData.sessionId}`);

    channel.bind('pusher:subscription_succeeded', () => {
      console.log('Successfully subscribed to channel');
    });

    channel.bind('pusher:subscription_error', (error) => {
      console.error('Pusher subscription error:', error);
      setError('Connection error. Please refresh.');
    });

    channel.bind('login-event', function (data) {
      console.log('Received login event:', data);
      handleLogin(data);
    });

    channelRef.current = channel;
  };

  const refreshQRCode = async () => {
    setLoading(true);
    setError(null);
    const data = await getQRCode();
    if (data) {
      setupPusherChannel(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshQRCode();

    // Refresh QR code every 10 minutes
    const intervalId = setInterval(refreshQRCode, 10 * 60 * 1000);

    return () => {
      clearInterval(intervalId);
      if (channelRef.current) {
        channelRef.current.unbind_all();
        channelRef.current.unsubscribe();
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Scan to Login</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center space-y-4">
          {isLoading ? (
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent" />
          ) : qrData ? (
            <div className="p-4 bg-white rounded-lg border">
              <QRCodeSVG value={qrData} size={256} level="H" />
              <div className="mt-2 text-sm text-gray-500 text-center">
                Scan with your mobile app
              </div>
            </div>
          ) : (
            <div>Failed to load QR code</div>
          )}

          <button
            onClick={refreshQRCode}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh QR Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
