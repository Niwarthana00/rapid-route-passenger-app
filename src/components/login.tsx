import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';

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
  const [view, setView] = useState<'login' | 'signup'>('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    onLoginSuccess();
  };

  const handleSignUp = () => {
    if (!email || !phone || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    onLoginSuccess();
  };

  const handleGoogleLogin = () => {
    setError('');
    onLoginSuccess();
  };

  const toggleView = () => {
    setView(view === 'login' ? 'signup' : 'login');
    setError('');
    // Clear passwords
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
                    autoCorrect={false}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (error) setError('');
                    }}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#8A95A5"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (error) setError('');
                    }}
                  />
                </View>

                {/* Continue Button */}
                <Pressable onPress={handleLogin} style={styles.continueButton}>
                  <Text style={styles.continueText}>Continue</Text>
                </Pressable>

                {/* Option Link */}
                <Pressable onPress={() => {}} style={styles.linkButton}>
                  <Text style={styles.linkText}>Login with OTP instead</Text>
                </Pressable>
              </>
            ) : (
              // SIGN UP VIEW
              <>
                {/* Title Section */}
                <Text style={styles.title}>Create account</Text>
                <Text style={styles.subtitle}>Fill in details to set up your profile</Text>

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
                    autoCorrect={false}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (error) setError('');
                    }}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone number"
                    placeholderTextColor="#8A95A5"
                    keyboardType="phone-pad"
                    autoCorrect={false}
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text);
                      if (error) setError('');
                    }}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Create password"
                    placeholderTextColor="#8A95A5"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (error) setError('');
                    }}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm password"
                    placeholderTextColor="#8A95A5"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (error) setError('');
                    }}
                  />
                </View>

                {/* Continue Button */}
                <Pressable onPress={handleSignUp} style={styles.continueButton}>
                  <Text style={styles.continueText}>Sign up</Text>
                </Pressable>
              </>
            )}

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Button */}
            <Pressable onPress={handleGoogleLogin} style={styles.googleButton}>
              <GoogleLogo />
              <Text style={styles.googleText}>Continue with Google</Text>
            </Pressable>

            {/* Toggle Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupLabel}>
                {view === 'login' ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <Pressable onPress={toggleView}>
                <Text style={styles.signupText}>
                  {view === 'login' ? "Sign up" : "Log in"}
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FAFBFD',
    zIndex: 999, // Render above everything else
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
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    color: '#8A95A5',
    marginBottom: 32,
    textAlign: 'left',
    lineHeight: 22,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'left',
  },
  inputContainer: {
    gap: 16,
    marginBottom: 24,
  },
  input: {
    height: 56,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10, // Reduced curve to 10
    paddingHorizontal: 18,
    fontSize: 15,
    color: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  continueButton: {
    backgroundColor: '#0E90E6', // Brand Blue color
    borderRadius: 10, // Reduced curve to 10
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#0E90E6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  continueText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  linkButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    marginBottom: 24,
  },
  linkText: {
    color: '#0E90E6', // Brand Blue color
    fontSize: 15,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#8A95A5',
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10, // Reduced curve to 10
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
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
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupLabel: {
    color: '#8A95A5',
    fontSize: 15,
    fontWeight: '500',
  },
  signupText: {
    color: '#0E90E6', // Brand Blue color
    fontSize: 15,
    fontWeight: '700',
  },
});
