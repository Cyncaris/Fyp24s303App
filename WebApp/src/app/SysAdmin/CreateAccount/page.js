
import React from "react";
import Link from "next/link"; // Use Next.js Link for navigation

const CreateAccount = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="bg-blue-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <nav>
            <ul className="flex space-x-4">
              {/* Navigation Links */}
              <li>
                <Link href="/SysAdmin/MainDashboard" className="hover:underline">Home</Link> {/* Link to main dashboard */}
              </li>
              <li>
                <Link href="/app" className="hover:underline">Logout</Link> {/* Link to logout or home */}
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content Section */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Create a New Account</h2>
          <form>
            {/* Email Input */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            {/* Password Input */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              />
            </div>
            {/* First Name Input */}
            <div className="mb-4">
              <label htmlFor="first-name" className="block text-gray-700 font-bold mb-2">First Name</label>
              <input
                type="text"
                id="first-name"
                name="first-name"
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              />
            </div>
            {/* Last Name Input */}
            <div className="mb-4">
              <label htmlFor="last-name" className="block text-gray-700 font-bold mb-2">Last Name</label>
              <input
                type="text"
                id="last-name"
                name="last-name"
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              />
            </div>
            {/* Role Selector */}
            <div className="mb-4">
              <label htmlFor="role" className="block text-gray-700 font-bold mb-2">Role</label>
              <select
                id="role"
                name="role"
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                required
              >
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="receptionist">Receptionist</option>
              </select>
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full"
            >
              Create Account
            </button>
          </form>
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

export default CreateAccount;
