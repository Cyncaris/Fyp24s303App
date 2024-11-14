import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { View, AppState } from 'react-native';
import Login from '@/components/Login';
import QrScanner from '@/components/QrScanner';
import { Session } from '@supabase/supabase-js';

const SESSION_TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export default function App() {
    const [session, setSession] = useState<Session | null>(null);
    let sessionTimeout: NodeJS.Timeout;

    const resetSessionTimeout = () => {
        clearTimeout(sessionTimeout);
        sessionTimeout = setTimeout(() => {
            setSession(null); // Log out after timeout
            supabase.auth.signOut(); // Clear session from Supabase
        }, SESSION_TIMEOUT_DURATION);
    };

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            resetSessionTimeout();
        };

        fetchSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                resetSessionTimeout();
            } else {
                clearTimeout(sessionTimeout);
            }
        });

        return () => {
            clearTimeout(sessionTimeout);
            subscription?.unsubscribe(); // Cleanup on unmount
        };
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener("change", state => {
            if (state === "active" && session) resetSessionTimeout(); // Reset timeout on app active
        });

        return () => subscription.remove();
    }, [session]);

    return (
        <View style={{ flex: 1 }}>
            {session ? (
                <QrScanner session={session} />
            ) : (
                <Login />
            )}
        </View>
    );
}
