import React from "react";
import Link from "next/link"; // Use Next.js Link for navigation

const Dashboard = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="bg-blue-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <a href="#" className="hover:underline">Home</a> {/* Link to home page */}
              </li>
              <li>
                <a href="#" className="hover:underline">Logout</a> {/* Link to logout or similar action */}
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
      </main>

      {/* Footer Section */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          &copy; 2023 Hospital App. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
