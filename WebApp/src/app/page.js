'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import Pusher from 'pusher-js';
import axios from 'axios';
import Router from 'next/router';

// Initialize Pusher
const initPusher = () => {
  Pusher.logToConsole = true;
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

export default function HomePage() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval;
    const fetchQrCode = async () => {
      setLoading(true);
      try {
        const response = await axios.post('/api/qr-code', {});

        if (response.status !== 200) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = response.data;
        if (!data.channel_data_hash) {
          throw new Error('No QR Code found in the response');
        }

        setQrCodeUrl(data.channel_data_hash);
        setSessionId(data.sessionId);
        setIsExpired(false);
        setLoading(false);

        // Set interval based on token expiration (e.g., 10 mins)
        interval = setTimeout(fetchQrCode, 10 * 60 * 1000);
      } catch (error) {
        console.error('Error fetching QR code:', error);
        setErrorMessage('Could not load QR code. Please try again later.');
        setIsExpired(true);
      }
    };

    fetchQrCode();
    return () => {
      clearTimeout(interval);
    };
  }, []);

  useEffect(() => {
    console.log('Subscribing to Pusher channel:', sessionId);
    if (sessionId) {
  
      const pusher = initPusher();
      const channel = pusher.subscribe('private-' + sessionId);
  
      channel.bind('login-event', function (data) {
        handleLogin(data);
      });
  
      return () => {
        channel.unbind_all();
        channel.unsubscribe();
      };
    }
  }, [sessionId]);

  const handleLogin = async (data) => {
    const token = data.token;
    const user_id = data.user_id;
    console.log('Received token:', data.data);
    console.log('Received user_id:', data);
    // try {
    //   const res = await axios.post('/api/verify-token', { token, user_id });
    //   if (res.status === 200) {
    //     // Save token, set cookies, and navigate
    //     await Router.replace('/profile');
    //   }
    // } catch (e) {
    //   console.error(e);
    // }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Scan to Login</h1>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        {qrCodeUrl ? (
          <QRCodeSVG value={qrCodeUrl} size={192} className="mx-auto" />
        ) : (
          <p>Loading QR Code...</p>
        )}
        {sessionId && <p className="text-gray-500">Session ID: {sessionId}</p>}
        <button
          onClick={() => setLoading(true)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh QR Code
        </button>
        {isExpired && <p className="text-red-500">Session has expired. Please request a new QR Code.</p>}
        <div className="mt-4">
          <Link href="/register" className="text-gray-700 hover:underline">
            Don't have an account?
          </Link>
        </div>
      </div>
    </div>
  );
}
