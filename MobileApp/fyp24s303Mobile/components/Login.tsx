import React, { useState } from 'react';
import { Alert, StyleSheet, View, AppState } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { supabase } from '../lib/supabase';
import { Button, Input } from '@rneui/themed';

AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh();
    } else {
        supabase.auth.stopAutoRefresh();
    }
});

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signInWithEmail() {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert(error.message);
            setLoading(false);
            return;
        }

        // Check if the user is first-time (e.g., through metadata or another flag)
        const { user } = data;
        const isFirstTimeUser = user?.user_metadata?.isFirstTimeUser || false;

        if (isFirstTimeUser) {
            Alert.alert('First time user, please complete registration.');
            // Redirect to registration flow (replace with your registration navigation)
            // navigation.navigate('Registration');
        } else {
            // Proceed with biometric authentication if it's not the first time
            authenticateWithBiometrics();
        }
        setLoading(false);
    }

    async function authenticateWithBiometrics() {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (!hasHardware || !isEnrolled) {
                Alert.alert('Biometric authentication is not available or enrolled.');
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate with Biometrics',
                fallbackLabel: 'Enter Passcode',
            });

            if (result.success) {
                Alert.alert('Authentication successful!');
                console.log("Login successful, navigating to QrScanner.");
                // Proceed to the main app or dashboard screen
                // navigation.navigate('Dashboard');
            } else {
                Alert.alert('Biometric authentication failed.');
            }
        } catch (error) {
            console.error('Biometric error:', error);
        }
    }

    return (
        <View style={styles.container}>
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Input
                    label="Email"
                    leftIcon={{ type: 'font-awesome', name: 'envelope' }}
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    placeholder="email@address.com"
                    autoCapitalize="none"
                />
            </View>
            <View style={styles.verticallySpaced}>
                <Input
                    label="Password"
                    leftIcon={{ type: 'font-awesome', name: 'lock' }}
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    secureTextEntry={true}
                    placeholder="Password"
                    autoCapitalize="none"
                />
            </View>
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Button title="Sign in" disabled={loading} onPress={signInWithEmail} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 40,
        padding: 12,
    },
    verticallySpaced: {
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: 'stretch',
    },
    mt20: {
        marginTop: 20,
    },
});
