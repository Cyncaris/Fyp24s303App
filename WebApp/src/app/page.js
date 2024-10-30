'use client';  // Mark this component as a Client Component

import { useState, useEffect } from 'react';
import Link from 'next/link'; // Import Link for navigation
import Image from 'next/image';

export default function HomePage() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isExpired, setIsExpired] = useState(false); // State to manage expiration status

  const fetchQrCode = async () => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.qrCodeDataUrl) {
        throw new Error('No QR Code found in the response');
      }

      setQrCodeUrl(data.qrCodeDataUrl);
      setSessionId(data.sessionId);
      setIsExpired(false); // Reset expiration status on successful fetch
    } catch (error) {
      console.error('Error fetching QR code:', error);
      setErrorMessage(error.message);
      setIsExpired(true); // Set expiration status if there's an error
    }
  };

  useEffect(() => {
    fetchQrCode(); // Initial fetch for QR code

    // Set a timeout to change isExpired after the JWT expires
    const expirationTimeout = setTimeout(() => {
      setIsExpired(true); // Set expiration status after the token's lifespan (e.g., 10 minutes)
    }, 1 * 60 * 1000); // Set this based on your JWT expiration time

    return () => {
      clearTimeout(expirationTimeout); // Cleanup timeout on unmount
    };
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Scan to Login</h1>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        {qrCodeUrl ? (
          <Image src={qrCodeUrl} alt="QR Code" className="mx-auto w-48 h-48" />
        ) : (
          <p>Loading QR Code...</p>
        )}
        {/* Optionally display the session ID */}
        {sessionId && <p className="text-gray-500">Session ID: {sessionId}</p>}
        {/* Manual Refresh Button */}
        <button
          onClick={fetchQrCode}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh QR Code
        </button>
        {isExpired && <p className="text-red-500">Session has expired. Please request a new QR Code.</p>}
        
        {/* Make the entire text clickable */}
        <div className="mt-4">
          <Link href="/register" className="text-gray-700 hover:underline">
            Don`&apos;`t have an account?
          </Link>
        </div>
      </div>
    </div>
  );
}
