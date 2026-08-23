import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { Ionicons } from '@expo/vector-icons';


interface LoginOverlayProps {
  onLoginSuccess: () => void;
}

import { useAuth } from '../context/auth-context';

export function LoginOverlay({ onLoginSuccess }: LoginOverlayProps) {
  const { loginWithEmail, signUpWithEmail } = useAuth();

  const [view, setView] = useState<'login' | 'signup'>('login');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogin = async () => {
    const identifier = email.trim();
    if (!identifier || !password) {
      setError('Please enter your phone number or email and password.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      // Call Context Login to update user state and persistence
      await loginWithEmail(identifier, password);
      onLoginSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid phone number/email or password.');
      Alert.alert('Login Failed', err.message || 'Invalid phone number/email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 3) {
      setError('Password must be at least 3 characters long');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      // Call Context Sign Up to register and then auto-login
      await signUpWithEmail(name.trim(), email.trim(), password, phone.trim());
      Alert.alert('Registration Successful', 'Your account has been created successfully!');
      onLoginSuccess();
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
      Alert.alert('Signup Error', err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };



  const toggleView = () => {
    setView(view === 'login' ? 'signup' : 'login');
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <SafeAreaView style={styles.overlayContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.formContainer}>
            {view === 'login' ? (
              // LOGIN VIEW
              <>
                {/* Title Section */}
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>Enter your phone number or email to continue</Text>

                {/* Error Message */}
                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {/* Input Fields */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Phone number or email"
                    placeholderTextColor="#8A95A5"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    editable={!isSubmitting}
                  />
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Password"
                      placeholderTextColor="#8A95A5"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      editable={!isSubmitting}
                    />
                    <Pressable
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={22}
                        color="#8A95A5"
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Continue Button */}
                <Pressable
                  style={styles.continueButton}
                  onPress={handleLogin}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.continueText}>Log in</Text>
                  )}
                </Pressable>

                {/* Forgot Password */}
                <Pressable style={styles.linkButton} disabled={isSubmitting}>
                  <Text style={styles.linkText}>Forgot password?</Text>
                </Pressable>

              </>
            ) : (
              // SIGNUP VIEW
              <>
                {/* Title Section */}
                <Text style={styles.title}>Create an account</Text>
                <Text style={styles.subtitle}>Sign up to start tracking buses and booking seats</Text>

                {/* Error Message */}
                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {/* Input Fields */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#8A95A5"
                    value={name}
                    onChangeText={setName}
                    editable={!isSubmitting}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor="#8A95A5"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    editable={!isSubmitting}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone number (+94 7X XXX XXXX)"
                    placeholderTextColor="#8A95A5"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    editable={!isSubmitting}
                  />
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Password (at least 6 chars)"
                      placeholderTextColor="#8A95A5"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      editable={!isSubmitting}
                    />
                    <Pressable
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={22}
                        color="#8A95A5"
                      />
                    </Pressable>
                  </View>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Confirm Password"
                      placeholderTextColor="#8A95A5"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      editable={!isSubmitting}
                    />
                    <Pressable
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={22}
                        color="#8A95A5"
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Continue Button */}
                <Pressable
                  style={styles.continueButton}
                  onPress={handleSignUp}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.continueText}>Sign up</Text>
                  )}
                </Pressable>

              </>
            )}

            {/* Toggle Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupLabel}>
                {view === 'login' ? "Don't have an account? " : 'Already have an account? '}
              </Text>
              <Pressable onPress={toggleView} disabled={isSubmitting}>
                <Text style={styles.signupText}>
                  {view === 'login' ? 'Sign up' : 'Log in'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FAFBFD',
    zIndex: 99999,
    elevation: 99999,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 24,
    lineHeight: 22,
    textAlign: 'left',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
  },
  inputContainer: {
    gap: 12,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
  },
  passwordWrapper: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    top: 15,
    zIndex: 10,
  },
  continueButton: {
    backgroundColor: '#0E90E6',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0E90E6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  continueText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  linkButton: {
    alignSelf: 'center',
    paddingVertical: 6,
    marginBottom: 20,
  },
  linkText: {
    color: '#0E90E6',
    fontSize: 14,
    fontWeight: '700',
  },

  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupLabel: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  signupText: {
    color: '#0E90E6',
    fontSize: 14,
    fontWeight: '800',
  },
});
