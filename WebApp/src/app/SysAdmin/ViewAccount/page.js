"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link"; // Next.js Link for navigation
import { supabase } from '@/app/lib/supabaseClient'; // Ensure this path matches your Supabase client setup
import RoleBasedRoute from '@/app/components/RoleBasedRoute'; // Import RoleBasedRoute component
import { ROLES } from '@/app/utils/roles'; // Import ROLES object 

const ViewAccount = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editableUser, setEditableUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [users, setUsers] = useState([]); 
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch users from Supabase on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('useraccount') // Ensure you are using the correct table
          .select('id, email, first_name, last_name, role_id, is_active, created_at'); // Adjust fields based on your table structure

        if (error) {
          throw new Error(error.message);
        }

        setUsers(data); // Set the user data retrieved from Supabase
      } catch (err) {
        setError('Failed to fetch users: ' + err.message);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle user selection
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setEditableUser(user); // Set the editable user to start editing
    setIsEditing(false); // Start in view mode
    setSuccessMessage(''); // Clear previous success messages
  };

  // Handle edit mode toggle
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableUser({
      ...editableUser,
      [name]: value,
    });
  };

  // Handle save changes to Supabase
  const handleSaveChanges = async () => {
    setError('');
    try {
      const { data, error } = await supabase
        .from('useraccount') // Use the correct table
        .update({
          first_name: editableUser.first_name,
          last_name: editableUser.last_name,
          role_id: parseInt(editableUser.role_id), // Make sure role_id is an integer
          is_active: editableUser.is_active === 'Yes', // Converting the 'Yes'/'No' string to boolean
        })
        .eq('id', editableUser.id); // Use the 'id' to identify the user to update

      if (error) {
        throw error;
      }

      // Update the users state to reflect changes immediately
      const updatedUsers = users.map(user => 
        user.id === editableUser.id ? { ...user, ...editableUser } : user
      );
      setUsers(updatedUsers);

      setSuccessMessage('Account updated successfully!');
      setIsEditing(false); // Go back to view mode after saving
    } catch (err) {
      setError('Failed to update account: ' + err.message);
    }
  };

  return (
    <RoleBasedRoute allowedRoles={[ROLES.ADMIN]} requireRestricted={true}>
      <div className="bg-gray-100 min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-blue-600 text-white py-4 shadow-lg">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">View Account</h1>
            <nav>
              <ul className="flex space-x-4">
                <li>
                    <a href="/SysAdmin/ManageAccountDashboard">Back</a>
                </li>
                <li>
                  <Link href="/SysAdmin/MainDashboard" className="hover:underline">Home</Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">Logout</Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Account Management</h2>

            {/* Search Box */}
            <div className="mb-6">
              <label htmlFor="search" className="block text-gray-700 font-bold mb-2">Search Users</label>
              <input
                type="text"
                id="search"
                name="search"
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-800"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500 mb-6">{error}</p>}
            {successMessage && <p className="text-green-500 mb-6">{successMessage}</p>}

            {/* List of Users */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">All Users</h3>
              <div className="h-48 overflow-y-auto border border-gray-800 rounded-lg p-2">
                <ul id="user-list">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <li
                        key={user.email}
                        className="p-2 border-b border-gray-800 cursor-pointer hover:bg-gray-100 text-gray-800"
                        onClick={() => handleUserClick(user)}
                      >
                        {user.first_name ? user.first_name : 'N/A'} {user.last_name ? user.last_name : ''} - {user.email}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No users found</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Account Details */}
            {selectedUser && (
              <div id="account-details">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Account Details</h3>
                
                {/* Editable Fields */}
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full p-2 border border-gray-800 rounded-lg text-gray-700"
                    value={editableUser.email}
                    disabled
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="first_name" className="block text-gray-700 font-bold mb-2">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                    value={editableUser.first_name || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="last_name" className="block text-gray-700 font-bold mb-2">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                    value={editableUser.last_name || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="role_id" className="block text-gray-700 font-bold mb-2">Role</label>
                  <select
                    id="role_id"
                    name="role_id"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={editableUser.role_id || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  >
                    <option value="1">Doctor</option>
                    <option value="2">Patient</option>
                    <option value="3">SysAdmin</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="is_active" className="block text-gray-700 font-bold mb-2">Is Active?</label>
                  <select
                    id="is_active"
                    name="is_active"
                    className="w-full p-2 border border-gray-300 rounded-lg text-gray-700"
                    value={editableUser.is_active ? 'Yes' : 'No'}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {/* Toggle Edit/Save */}
                <div className="flex space-x-4">
                  {isEditing ? (
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg w-full"
                      onClick={handleSaveChanges}
                    >
                      Save Changes
                    </button>
                  ) : (
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full"
                      onClick={handleEditToggle}
                    >
                      Edit Account
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-4">
          <div className="container mx-auto px-4 text-center">
            &copy; 2023 Hospital App. All rights reserved.
          </div>
        </footer>
      </div>
    </RoleBasedRoute>
  );
};

export default ViewAccount;
