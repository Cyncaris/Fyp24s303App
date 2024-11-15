
'use client';

import Link from 'next/link';
import RoleBasedRoute from '@/app/components/RoleBasedRoute'; // Import RoleBasedRoute component
import { ROLES } from '@/app/utils/roles'; // Import ROLES object 

export default function ViewPatient() {
    // Function to clear all cookies
    const clearCookies = () => {
      const cookies = document.cookie.split(";"); // Get all cookies
      cookies.forEach((cookie) => {
        const name = cookie.split("=")[0].trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`; // Overwrite with an expired date
      });
    };
  
    // Logout Function
    const handleLogout = async () => {
      try {
        const { error } = await supabase.auth.signOut(); // End the session
        if (error) {
          setError("Failed to log out: " + error.message);
          return;
        }
        clearCookies(); // Clear cookies after signing out
        router.push("/"); // Redirect to the login page
      } catch (err) {
        setError("An unexpected error occurred during logout: " + err.message);
      }
    }; 
  return (
    <RoleBasedRoute allowedRoles={[ROLES.DOCTOR]} requireRestricted={false}>
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="bg-green-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <nav>
            <ul className="flex space-x-4">
              {/* Navigation Links */}
              <li>
                <Link href="/Doctor/DoctorDashboard" className="hover:underline">Back</Link>
              </li>
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
        <div className="bg-white shadow-md rounded-lg p-8 w-full mx-0">
          <h3 className="text-xl font-bold text-gray-800 mb-8">Manage Your Account</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link href="/Doctor/viewPatient/viewRecord" className="bg-green-600 w-full items-center border px-3 py-4 rounded-lg text-lg font-semibold shadow hover:shadow-md transition-all duration-300">
              <span className="text-white">View Patient Records</span>
            </Link>
            <Link href="/Doctor/viewPatient/createRecord" className="bg-green-600 w-full items-center border px-3 py-4 rounded-lg text-lg font-semibold shadow hover:shadow-md transition-all duration-300">
              <span className="text-white">Create Patient Records</span>
            </Link>
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
}
