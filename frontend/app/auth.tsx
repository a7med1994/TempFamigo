import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useStore } from '../store/useStore';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const { setUser } = useStore();

  const handleEmailContinue = () => {
    if (email.trim()) {
      // For now, create a simple user profile
      const newUser = {
        id: `user_${Date.now()}`,
        name: email.split('@')[0],
        email: email,
        kidsAges: [],
        location: {
          city: 'Melbourne',
          coordinates: { lat: -37.8136, lng: 144.9631 },
        },
        avatar: '',
        bio: '',
      };
      setUser(newUser);
      router.replace('/(tabs)');
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Mock social login
    const newUser = {
      id: `user_${Date.now()}`,
      name: `${provider} User`,
      email: `user@${provider.toLowerCase()}.com`,
      kidsAges: [],
      location: {
        city: 'Melbourne',
        coordinates: { lat: -37.8136, lng: 144.9631 },
      },
      avatar: '',
      bio: '',
    };
    setUser(newUser);
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo/Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🌳 Famigo</Text>
          <Text style={styles.tagline}>Discover. Connect. Play.</Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Join the family fun!</Text>
          <Text style={styles.subtitle}>
            Connect with local families and discover amazing activities
          </Text>

          {/* Social Login Buttons */}
          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialLogin('Google')}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialLogin('Apple')}
            >
              <Ionicons name="logo-apple" size={20} color="#000000" />
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email Option */}
          {!showEmailInput ? (
            <TouchableOpacity
              style={styles.emailButton}
              onPress={() => setShowEmailInput(true)}
            >
              <Text style={styles.emailButtonText}>Continue with Email</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.emailForm}>
              <TextInput
                style={styles.emailInput}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
              />
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  !email.trim() && styles.continueButtonDisabled,
                ]}
                onPress={handleEmailContinue}
                disabled={!email.trim()}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Terms */}
          <Text style={styles.terms}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 48,
    fontWeight: '700',
    color: '#0C3B2E',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#6D9773',
    fontWeight: '600',
  },
  content: {
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0C3B2E',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  socialButtons: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C3B2E',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
  },
  emailButton: {
    backgroundColor: '#6D9773',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emailForm: {
    gap: 12,
  },
  emailInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0C3B2E',
  },
  continueButton: {
    backgroundColor: '#6D9773',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  terms: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});
