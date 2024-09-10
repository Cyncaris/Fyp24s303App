"use client"; // Mark the component as a Client Component

import { useRouter } from "next/navigation"; // Import from next/navigation
import React from "react";

const LandingPage = () => {
  const router = useRouter();

  const handleRedirect = () => {
    router.push("/MainDashboard"); // Redirect to MainDashboard
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8 text-black ">Welcome to the Landing Page</h1>
      <button
        onClick={handleRedirect}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition"
      >
        Go to Main Dashboard
      </button>
    </div>
  );
};

export default LandingPage;
