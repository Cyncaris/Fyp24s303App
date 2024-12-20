import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import {
    View, Text, StyleSheet, SafeAreaView, Pressable, Button,
} from "react-native";
import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { supabase } from '../lib/supabase';

export default function QrScanner({ session }: { session: Session }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    // Check and request permission when component loads
    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, [permission]);

    const isPermissionGranted = Boolean(permission?.granted);
    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        setScanned(true);

        try {
            const isAuthenticated = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate with Biometrics',
                fallbackLabel: 'Enter Passcode',
            });

            if (!isAuthenticated.success) {
                alert('Authentication failed!');
                supabase.auth.signOut();
                return;
            }
        } catch (error) {
            console.error('Error:', error);
        }

        const channel = `${data}`;
        const user_id = session.user?.id;

        try {
            let resp = await fetch(`https://mobileappbackend-production-2851.up.railway.app/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'channel': channel,
                    'user_id': user_id,
                }),
            });
            if (resp.ok) {
                alert('Session authenticated!');
            } else {
                alert('Session authentication failed!');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleLogout = async () => {
        console.log('Logging out...');
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Error signing out:', error);
            alert('Error signing out!');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Scan QR Code</Text>
            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    facing="back"
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                />
            </View>
            {scanned && (
                <View style={styles.buttonContainer}>
                    <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
                </View>
            )}
            <View style={styles.buttonContainer}>
                <Pressable
                    style={styles.logoutButton}
                    disabled={!isPermissionGranted}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
        paddingVertical: 80,
    },
    title: {
        color: "#1c1c1e",
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    cameraContainer: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: "black",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 40,
    },
    camera: {
        width: "100%",
        height: "100%",
        backgroundColor: "lightgray",
    },
    buttonContainer: {
        marginBottom: 20, // Add space between buttons
    },
    logoutButton: {
        backgroundColor: "#000000",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: "center",
    },
    logoutButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
