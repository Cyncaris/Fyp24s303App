import React, { useState } from 'react';
import { Image, StyleSheet, TextInput, Button, Platform, Alert } from 'react-native';
import axios from 'axios'; // Make sure to install axios

import { HelloWave } from '@/components/HelloWave'; 
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface LoginScreenProps {
  navigation: any; // Adjust type according to your navigation setup
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true); // Set loading state

    try {
      const response = await axios.post('https://your-api-url.com/login', {
        email,
        password,
      });

      // Assuming the response contains a token or user info
      const { token } = response.data;

      // Store the token (you can use AsyncStorage or a state management library)
      // Example with AsyncStorage:
      // await AsyncStorage.setItem('userToken', token);

      // Navigate to the home screen after successful login
      navigation.navigate('Home');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login failed', 'Please check your email and password and try again.');
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Welcome Back!</ThemedText>

      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </ThemedView>

      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />
      
      <ThemedText style={styles.footerText}>
        Don't have an account? 
        <ThemedText type="defaultSemiBold" onPress={() => navigation.navigate('SignUp')}> Sign Up</ThemedText>
      </ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF', 
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  footerText: {
    marginTop: 16,
    textAlign: 'center',
  },
});

export default LoginScreen;
