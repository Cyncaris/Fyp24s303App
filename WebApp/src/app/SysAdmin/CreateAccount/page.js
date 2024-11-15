"use client"; // Ensure this component runs on the client-side
import React, { useState } from 'react';
import Link from 'next/link'; // Adjust the Link path if necessary
import { supabase } from '@/app/lib/supabaseClient';
import crypto from 'crypto'; // For encryption
import { useRouter } from "next/navigation";
import axios from 'axios';

const CreateAccount = () => {
  // State variables for form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('SysAdmin'); // Default to 'SysAdmin'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Logout Function
  const handleLogout = async () => {
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

  
  // Function to generate a random QR secret key
  const generateQrSecretKey = () => {
    return crypto.randomBytes(16).toString('hex'); // Generate a random 16-byte string
  };

  // Function to encrypt the QR secret key
  const encryptQrSecretKey = (qrSecretKey) => {
    const cipher = crypto.createCipher('aes-256-ctr', 'secret-password'); // Replace 'secret-password' with a secure key
    let encrypted = cipher.update(qrSecretKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  };

  // Determine the role_id based on the selected role
  const getRoleId = (role) => {
    switch (role) {
      case 'Doctor':
        return 1;
      case 'Patient':
        return 2;
      case 'SysAdmin':
        return 3;
      default:
        return 3; // Default to 'Patient' if none selected
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Step 1: Generate and encrypt QR secret key
      const qrSecretKey = generateQrSecretKey();
      const encryptedQrSecretKey = encryptQrSecretKey(qrSecretKey);

      // Step 2: Register the user using Supabase auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            qr_secret_key: encryptedQrSecretKey, // Store encrypted QR secret key
            role_id: getRoleId(role), // Get role_id based on selected role
          },
        },
      });

      if (signUpError) {
        setError('Registration failed: ' + signUpError.message);
        return;
      }

      setSuccess('Account created successfully!');
    } catch (err) {
      setError('Unexpected error: ' + err.message);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="bg-blue-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/SysAdmin/MainDashboard" className="hover:underline">
                  Home
                </Link>
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
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Create a New Account</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}
          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            {/* Password Input */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            {/* First Name Input */}
            <div className="mb-4">
              <label htmlFor="first-name" className="block text-gray-700 font-bold mb-2">
                First Name
              </label>
              <input
                type="text"
                id="first-name"
                name="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            {/* Last Name Input */}
            <div className="mb-4">
              <label htmlFor="last-name" className="block text-gray-700 font-bold mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="last-name"
                name="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            {/* Role Selector */}
            <div className="mb-4">
              <label htmlFor="role" className="block text-gray-700 font-bold mb-2">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="SysAdmin">SysAdmin</option>
                <option value="Doctor">Doctor</option>
                <option value="Patient">Patient</option>
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
