import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { View } from 'react-native';
import Login from '@/components/Login';
import QrScanner from '@/components/QrScanner';
import { Session } from '@supabase/supabase-js';

export default function App() {
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
        };

        fetchSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            subscription?.unsubscribe(); // Cleanup on unmount
        };
    }, []);

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
