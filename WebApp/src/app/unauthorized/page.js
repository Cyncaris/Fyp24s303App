"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

const Unauthorized = () => {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
        <p className="text-gray-700 mb-6">
          You do not have permission to view this page. Please log in with the correct credentials.
        </p>
        <button
          onClick={handleLoginRedirect}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
