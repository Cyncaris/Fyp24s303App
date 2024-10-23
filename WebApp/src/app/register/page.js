"use client"
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // Adjust the path to your Supabase client
import crypto from 'crypto'; // For encryption

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Function to generate a random QR secret key
  const generateQrSecretKey = () => {
    return crypto.randomBytes(16).toString('hex'); // Generate a random 16-byte string
  };

  // Function to encrypt the QR secret key
  const encryptQrSecretKey = (qrSecretKey) => {
    const cipher = crypto.createCipher('aes-256-ctr', 'secret-password'); // Replace 'secret-password' with a proper secret key
    let encrypted = cipher.update(qrSecretKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Step 1: Generate and encrypt QR secret key
      const qrSecretKey = generateQrSecretKey();
      const encryptedQrSecretKey = encryptQrSecretKey(qrSecretKey);

      // Step 2: Register the user using Supabase auth (creates entry in auth.users)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            qr_secret_key: encryptedQrSecretKey, // Add QR secret key to metadata
            role_id: 2, // Set role_id to 2 by default
          }
        }
      });

      if (signUpError) {
        setError('Registration failed: ' + signUpError.message);
        return;
      }

      setSuccess('Registration successful!');
    } catch (err) {
      setError('Unexpected error: ' + err.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-8 bg-white rounded-lg shadow-lg text-center w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-left mb-2 font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-left mb-2 font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-left mb-2 font-semibold">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-left mb-2 font-semibold">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
