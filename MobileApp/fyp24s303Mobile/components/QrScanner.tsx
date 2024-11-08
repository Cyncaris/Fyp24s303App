import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import {
    View, Text, StyleSheet, SafeAreaView, Pressable, Button, StatusBar,
} from "react-native";
import { Session } from '@supabase/supabase-js';
import { useRef, useState } from 'react';

export default function QrScanner({ session }: { session: Session }) {
    const qrLock = useRef(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    const isPermissionGranted = Boolean(permission?.granted);

    const handleBarCodeScanned = async ({data }: { data: string }) => {
        setScanned(true);
        alert(`Barcode with type and data ${data} has been scanned!`);
        const channel = `${data}`;
        const userName = session.user?.email;
        // fetch need to be on same network aka same wifi
        try {
            let resp = await fetch('http://192.168.50.13:3000/api/authenticate-qr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'channel': channel,
                    'user_id': userName, 
                }),
            });
            
            if (resp.ok) {
                alert('Session authenticated!');
            } else {
                alert('Session authentication failed!');
            }
        }catch (error) {
            console.error('Error:', error);
        }
    };

    // const onScanned = async (sessionId) => {
    //     // Perform authentication, e.g., biometrics
    //     const isAuthenticated = await performBiometricAuthentication();
    //     if (isAuthenticated) {
    //       // Send authenticated session ID to backend
    //       await fetch('http://localhost:3000/api/authenticate-session', {
    //         method: 'POST',
    //         headers: {
    //           'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ sessionId }),
    //       });
    //     }
    //   };

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
            {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
            <Pressable
                style={styles.logoutButton}
                disabled={!isPermissionGranted}
                onPress={requestPermission}
            >
                <Text style={styles.logoutButtonText}>Logout</Text>
            </Pressable>
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
    logoutButton: {
        backgroundColor: "#000000",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    logoutButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
