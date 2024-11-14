"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link"; // Next.js Link for navigation
import { supabase } from "@/app/lib/supabaseClient"; // Adjust the path to your Supabase client
import RoleBasedRoute from '@/app/components/RoleBasedRoute'; // Import RoleBasedRoute component
import { ROLES } from '@/app/utils/roles'; // Import ROLES object 
import { useRouter } from "next/navigation";




const ManageRoleDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]); // For storing fetched users
  const [selectedUser, setSelectedUser] = useState(null); // To track the selected user for editing
  const [newRole, setNewRole] = useState(""); // To store the updated role
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

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



  // Role mapping function
  const mapRoleIdToRole = (role_id) => {
    switch (role_id) {
      case 1:
        return "Doctor";
      case 2:
        return "Patient";
      case 3:
        return "SysAdmin";
      default:
        return "Unknown";
    }
  };


  // Reverse role mapping for updates (convert role names back to ID)
  const mapRoleToRoleId = (role) => {
    switch (role.toLowerCase()) {
      case "doctor":
        return 1;
      case "patient":
        return 2;
      case "sysadmin":
        return 3;
      default:
        return null;
    }
  };

  // Fetch users from Supabase on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("useraccount") // Replace with your actual table name
          .select("id, first_name, last_name, role_id"); // Adjust fields based on your table structure

        if (error) {
          throw error;
        }

        // Map role_id to human-readable roles
        const usersWithRoles = data.map((user) => ({
          ...user,
          role: mapRoleIdToRole(user.role_id),
        }));

        setUsers(usersWithRoles); // Set the users data fetched from Supabase
      } catch (err) {
        setError("Failed to fetch users: " + err.message);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle user selection for role editing
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setNewRole(user.role); // Set the current role to the dropdown
    setSuccessMessage(""); // Clear previous success messages
  };

  // Handle role update in Supabase
  const handleRoleUpdate = async () => {
    const updatedRoleId = mapRoleToRoleId(newRole); // Convert role name back to role_id

    if (updatedRoleId === null) {
      setError("Invalid role. Please select a valid role from the dropdown.");
      return;
    }

    try {
      const { error } = await supabase
        .from("useraccount") // Replace with your actual table name
        .update({ role_id: updatedRoleId }) // Update the role_id field
        .eq("id", selectedUser.id); // Identify the user to update by their id

      if (error) {
        throw error;
      }

      // Update the local users state to reflect the changes immediately
      const updatedUsers = users.map((user) =>
        user.id === selectedUser.id ? { ...user, role: newRole } : user
      );
      setUsers(updatedUsers);

      setSuccessMessage("Role updated successfully!");
      setTimeout(() => {
        setSuccessMessage(""); // Clear success message after 3 seconds
      }, 3000);

      setSelectedUser(null); // Close the edit form after successful update
    } catch (err) {
      setError("Failed to update role: " + err.message);
    }
  };

  return (
    <RoleBasedRoute allowedRoles={[ROLES.ADMIN]} requireRestricted={true}>
      <div className="bg-gray-100 min-h-screen flex flex-col">
        {/* Header Section */}
        <header className="bg-blue-600 text-white py-4 shadow-lg">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Role Management</h1>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link href="/SysAdmin/MainDashboard" className="hover:underline">
                    Back
                  </Link>
                </li>
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
          <h2 className="text-xl font-bold text-gray-800 mb-4">Search User</h2>

          {/* Search Box */}
          <div className="mb-4">
            <input
              type="text"
              className="w-full p-2 border border-gray-800 rounded-lg"
              placeholder="Search by name or role"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* User List */}
          <h3 className="text-lg font-semibold text-gray-800 mb-4">All Users</h3>
          <ul className="border border-gray-600 rounded-lg divide-y divide-gray-600 bg-white text-gray-800">
            {filteredUsers.map((user) => (
              <li
                key={user.id}
                className="p-4 hover:bg-gray-300 border border-gray-600 cursor-pointer"
                onClick={() => handleUserClick(user)}
              >
                {user.first_name} {user.last_name} - Role: {user.role}
              </li>
            ))}
          </ul>

          {/* Role Editing Form */}
          {selectedUser && (
            <div className="mt-6 bg-white p-6 shadow-md rounded-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Edit Role for {selectedUser.first_name} {selectedUser.last_name}</h3>
              <div className="mb-4">
                <label htmlFor="role" className="block text-gray-700 font-bold mb-2">New Role</label>
                <select
                  id="role"
                  name="role"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Patient">Patient</option>
                  <option value="SysAdmin">SysAdmin</option>
                </select>
              </div>
              <button
                onClick={handleRoleUpdate}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                Update Role
              </button>
              {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}
              {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
          )}
        </main>

        {/* Footer Section */}
        <footer className="bg-gray-800 text-white py-4">
          <div className="container mx-auto px-4 text-center">
            &copy; 2023 Role Management Dashboard. All rights reserved.
          </div>
        </footer>
      </div>
    </RoleBasedRoute>
  );
};

export default ManageRoleDashboard;
