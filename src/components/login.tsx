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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../context/auth-context';

WebBrowser.maybeCompleteAuthSession();

interface LoginOverlayProps {
  onLoginSuccess: () => void;
}

const GoogleLogo = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" style={styles.googleIcon}>
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </Svg>
);

export function LoginOverlay({ onLoginSuccess }: LoginOverlayProps) {
  const { loginWithEmail, signUpWithEmail, loginWithGoogleCredential } = useAuth();

  const [view, setView] = useState<'login' | 'signup'>('login');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      await loginWithEmail(email, password);
      onLoginSuccess();
    } catch (err: any) {
      let msg = 'Failed to sign in. Please check your credentials.';
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
        msg = 'No account found with this email or incorrect password.';
      } else if (err?.code === 'auth/wrong-password') {
        msg = 'Incorrect password. Please try again.';
      } else if (err?.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
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
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      await signUpWithEmail(name, email, password, phone);
      onLoginSuccess();
    } catch (err: any) {
      let msg = 'Failed to create account.';
      if (err?.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please log in instead.';
      } else if (err?.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters.';
      } else if (err?.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      const clientId = '206964995281-ptvbp435s376lo8nu92mpkmc1b8h2mm7.apps.googleusercontent.com';
      const redirectUrl = 'https://rapid-route-passenger.firebaseapp.com/__/auth/handler';
      const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(clientId)}` +
        `&response_type=id_token%20token` +
        `&scope=${encodeURIComponent('openid profile email')}` +
        `&redirect_uri=${encodeURIComponent(redirectUrl)}` +
        `&nonce=${encodeURIComponent(nonce)}` +
        `&prompt=select_account`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

      if (result.type === 'success' && result.url) {
        const urlHash = result.url.split('#')[1] || result.url.split('?')[1] || '';
        const searchParams = new URLSearchParams(urlHash);
        const idToken = searchParams.get('id_token');
        const accessToken = searchParams.get('access_token');

        if (idToken) {
          await loginWithGoogleCredential(idToken);
          onLoginSuccess();
          return;
        } else if (accessToken) {
          const userResp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const googleUser = await userResp.json();
          if (googleUser && googleUser.email) {
            onLoginSuccess();
            return;
          }
        }
      }
    } catch (err: any) {
      console.log('Google login feedback:', err?.message);
      if (err?.message && !err.message.includes('dismiss') && !err.message.includes('cancel')) {
        setError(err.message);
      }
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
                <Text style={styles.subtitle}>Enter your email and password to continue</Text>

                {/* Error Message */}
                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {/* Input Fields */}
                <View style={styles.inputContainer}>
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
                    placeholder="Password"
                    placeholderTextColor="#8A95A5"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    editable={!isSubmitting}
                  />
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

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Google Sign-in Button */}
                <Pressable
                  style={styles.googleButton}
                  onPress={handleGoogleLogin}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#0E90E6" size="small" />
                  ) : (
                    <>
                      <GoogleLogo />
                      <Text style={styles.googleText}>Continue with Google</Text>
                    </>
                  )}
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
                  <TextInput
                    style={styles.input}
                    placeholder="Password (at least 6 chars)"
                    placeholderTextColor="#8A95A5"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    editable={!isSubmitting}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#8A95A5"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    editable={!isSubmitting}
                  />
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

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Google Sign-in Button */}
                <Pressable
                  style={styles.googleButton}
                  onPress={handleGoogleLogin}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#0E90E6" size="small" />
                  ) : (
                    <>
                      <GoogleLogo />
                      <Text style={styles.googleText}>Sign up with Google</Text>
                    </>
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleText: {
    color: '#334155',
    fontSize: 15,
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
