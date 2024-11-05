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

        const { user } = data;
        const isFirstTimeUser = user?.user_metadata?.isFirstTimeUser || false;

        if (isFirstTimeUser) {
            Alert.alert('First time user, please complete registration.');
        } else {
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
            } else {
                Alert.alert('Biometric authentication failed.');
            }
        } catch (error) {
            console.error('Biometric error:', error);
        }
    }

    return (
        <View style={styles.container}>
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
            <View style={styles.rememberMeContainer}>
                <Button 
                    title="Remember me" 
                    type="clear" 
                    titleStyle={styles.rememberMeText} 
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
    inputContainer: {
        width: '100%',
        marginVertical: 10,
    },
    rememberMeContainer: {
        alignItems: 'flex-start',
        width: '100%',
        paddingVertical: 10,
    },
    rememberMeText: {
        color: '#333',
        fontSize: 16,
    },
    buttonContainer: {
        width: '100%',
        marginTop: 20,
    },
    loginButton: {
        backgroundColor: '#000000',
        borderRadius: 8,
        height: 50,
    },
    loginButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
