'use client';  // Mark this component as a Client Component

import React from "react";
import Link from "next/link"; // Use Next.js Link for navigation
import styles from "../../styles/Patient.module.css"; // Import CSS Modules stylesheet as styles

import { useState } from 'react';

export default function Appointment(){
    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            {/* Header Section */}
            <header className="bg-black text-white py-4 shadow-lg">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Appointment</h1>
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
        {/* Footer Section */}
        <footer className="bg-gray-800 text-white py-4">
                <div className="container mx-auto px-4 text-center">
                    &copy; 2023 Hospital App. All rights reserved.
                </div>
            </footer>
        </div>
    );
};