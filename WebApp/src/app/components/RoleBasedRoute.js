// components/RoleBasedRoute.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const RoleBasedRoute = ({ children, allowedRoles, requireRestricted = false }) => {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Get user info from your server
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify-token`, {
                    withCredentials: true
                });
                const userRole = response.data.user.role;
                const restricted = response.data.user.restricted;
              
                if (!allowedRoles.includes(userRole) || (requireRestricted && !restricted)) {
                    console.log('Unauthorized access attempt');
                    router.push('/unauthorized'); // Create this page
                    return;
                }

                setIsAuthorized(true);
            } catch (error) {
                console.error('Auth check failed:', error);
                router.push('/unauthorized'); // Create this page
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router, allowedRoles, requireRestricted]);

    if (loading) {
        return <div>Loading...</div>; // Or your loading component
    }

    return isAuthorized ? children : null;
};

export default RoleBasedRoute;