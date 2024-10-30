import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import {
    View, Text, StyleSheet, SafeAreaView, Pressable, Linking,
    Platform,
    StatusBar,
} from "react-native";
import { Link, Stack } from "expo-router";
import { Session } from '@supabase/supabase-js';
import { useRef } from 'react';

export default function QrScanner({ session }: { session: Session }) {
    console.log('QrScanner');
    const qrLock = useRef(false);
    const [permission, requestPermission] = useCameraPermissions();

    const isPermissionGranted = Boolean(permission?.granted);

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: "Overview", headerShown: false }} />
            <Text style={styles.title}>QR Code Scanner</Text>
            <View style={{ gap: 20 }}>
                <Pressable onPress={requestPermission}>
                    <Text style={styles.buttonStyle}>Request Permissions</Text>
                </Pressable>
                <SafeAreaView style={StyleSheet.absoluteFillObject}>
                    <Stack.Screen
                        options={{
                            title: "Overview",
                            headerShown: false,
                        }}
                    />
                    {Platform.OS === "android" ? <StatusBar hidden /> : null}
                    <CameraView
                        style={StyleSheet.absoluteFillObject}
                        facing="back"
                        onBarcodeScanned={({ data }) => {
                           console.log('onBarcodeScanned');
                           console.log(data);
                        }}
                    />
                </SafeAreaView>
                <Pressable disabled={!isPermissionGranted}>
                    <Text
                        style={[
                            styles.buttonStyle,
                            { opacity: !isPermissionGranted ? 1 : 1 },
                        ]}
                    >
                        Scan Code
                    </Text>
                </Pressable>

            </View>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "black",
        justifyContent: "space-around",
        paddingVertical: 80,
    },
    title: {
        color: "white",
        fontSize: 40,
    },
    buttonStyle: {
        color: "#0E7AFE",
        fontSize: 20,
        textAlign: "center",
    },
});