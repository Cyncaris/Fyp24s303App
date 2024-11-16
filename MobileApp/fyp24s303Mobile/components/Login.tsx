import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View, AppState, Image } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { supabase } from '../lib/supabase';
import { Button, Input } from '@rneui/themed';

const SESSION_TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    let sessionTimeout: NodeJS.Timeout;

    useEffect(() => {
        // Clear timeout on component unmount
        return () => clearTimeout(sessionTimeout);
    }, []);

    const resetSessionTimeout = () => {
        clearTimeout(sessionTimeout);
        sessionTimeout = setTimeout(async () => {
            await supabase.auth.signOut();
            Alert.alert('Session Expired', 'Please log in again.');
        }, SESSION_TIMEOUT_DURATION);
    };

    // Handle app state changes
    useEffect(() => {
        let lastActiveTimestamp = Date.now();

        const subscription = AppState.addEventListener('change', async (state) => {
            if (state === 'active') {
                const currentTime = Date.now();
                const inactiveTime = currentTime - lastActiveTimestamp;

                if (inactiveTime >= SESSION_TIMEOUT_DURATION) {
                    await supabase.auth.signOut();
                    Alert.alert('Session Expired', 'Please log in again.');
                } else {
                    resetSessionTimeout();
                    supabase.auth.startAutoRefresh();
                }
            } else {
                lastActiveTimestamp = Date.now();
                supabase.auth.stopAutoRefresh();
            }
        });

        return () => {
            subscription.remove();
            clearTimeout(sessionTimeout);
        };
    }, []);

    async function signInWithEmail() {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert("Incorrect Credentials!");
            setLoading(false);
            return;
        }

        const { user } = data;
        const isFirstTimeUser = user?.user_metadata?.isFirstTimeUser || false;

        if (isFirstTimeUser) {
            Alert.alert('First time user, please complete registration.');
        } else {
            authenticateWithBiometrics();
        }
        
        // Start session timeout on successful login
        resetSessionTimeout();
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
                resetSessionTimeout(); // Reset timeout after successful biometric auth
            } else {
                supabase.auth.signOut();
                Alert.alert('Biometric authentication failed.');
            }
        } catch (error) {
            console.error('Biometric error:', error);
        }
    }

    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/images/logofyp.png')}
                style={styles.logo}
                resizeMode="contain"
            />
            <View style={styles.inputContainer}>
                <Input
                    label="Email"
                    leftIcon={{ type: 'font-awesome', name: 'envelope' }}
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    placeholder="Enter your email"
                    autoCapitalize="none"
                />
            </View>
            <View style={styles.inputContainer}>
                <Input
                    label="Password"
                    leftIcon={{ type: 'font-awesome', name: 'lock' }}
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    secureTextEntry={true}
                    placeholder="Enter your password"
                    autoCapitalize="none"
                />
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    title="Login"
                    disabled={loading}
                    onPress={signInWithEmail}
                    buttonStyle={styles.loginButton}
                    titleStyle={styles.loginButtonText}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#ffffff',
    },
    logo: {
        width: 200,
        height: 100,
        marginBottom: 20,
    },
    inputContainer: {
        width: '100%',
        marginVertical: 10,
    },
    buttonContainer: {
        width: '100%',
        marginTop: 20,
    },
    loginButton: {
        backgroundColor: '#1A76D2', // Vibrant blue color
        borderRadius: 8,
        height: 50,
    },
    loginButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff', // Keep the text white for contrast
    },
});