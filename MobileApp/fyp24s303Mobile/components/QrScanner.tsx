import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import {
    View, Text, StyleSheet, SafeAreaView, Pressable, Platform, StatusBar,
} from "react-native";
import { Session } from '@supabase/supabase-js';
import { useRef } from 'react';

export default function QrScanner({ session }: { session: Session }) {
    const qrLock = useRef(false);
    const [permission, requestPermission] = useCameraPermissions();

    const isPermissionGranted = Boolean(permission?.granted);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Scan QR Code</Text>
            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    facing="back"
                    onBarcodeScanned={({ data }) => {
                        console.log('onBarcodeScanned');
                        console.log(data);
                    }}
                />
            </View>
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
