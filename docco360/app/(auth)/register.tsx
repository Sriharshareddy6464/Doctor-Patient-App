import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Colors, Fonts, Spacing, Radii, Gradients } from '@/constants/theme';
import { ApiError } from '@/services/api';

type Role = 'PATIENT' | 'DOCTOR';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('PATIENT');
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    else if (phone.trim().length < 7) newErrors.phone = 'Enter a valid phone number';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      newErrors.password = 'Must contain uppercase, lowercase, and number';
    if (role === 'DOCTOR' && !specialization.trim())
      newErrors.specialization = 'Please enter your medical specialization';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: Colors.border };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: score, label: 'Weak', color: Colors.danger };
    if (score <= 3) return { level: score, label: 'Fair', color: Colors.warning };
    if (score <= 4) return { level: score, label: 'Good', color: Colors.primary };
    return { level: score, label: 'Strong', color: Colors.success };
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const { requiresApproval } = await register(
        name.trim(),
        email.trim().toLowerCase(),
        password,
        role,
        phone.trim(),
        role === 'DOCTOR' ? specialization.trim() : undefined,
      );
      if (requiresApproval) {
        // Doctor — navigate to the waiting screen, do NOT log them in
        router.replace('/(auth)/pending-approval');
      } else {
        // Patient — tokens are stored, route through index to the dashboard
        router.replace('/');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.errors) {
          setErrors(error.errors);
        } else {
          setErrors({ general: error.message });
        }
      } else {
        setErrors({ general: 'Connection failed. Please check your network.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textInverse} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Join Docco360 today</Text>
        </LinearGradient>

        {/* Form */}
        <View style={styles.form}>
          {/* Role Selector */}
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>I am a</Text>
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[styles.roleOption, role === 'PATIENT' && styles.roleActive]}
                onPress={() => setRole('PATIENT')}
              >
                <Ionicons
                  name="person"
                  size={18}
                  color={role === 'PATIENT' ? Colors.textInverse : Colors.textSecondary}
                />
                <Text
                  style={[styles.roleText, role === 'PATIENT' && styles.roleTextActive]}
                >
                  Patient
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleOption, role === 'DOCTOR' && styles.roleActive]}
                onPress={() => setRole('DOCTOR')}
              >
                <Ionicons
                  name="medkit"
                  size={18}
                  color={role === 'DOCTOR' ? Colors.textInverse : Colors.textSecondary}
                />
                <Text
                  style={[styles.roleText, role === 'DOCTOR' && styles.roleTextActive]}
                >
                  Doctor
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {role === 'DOCTOR' && (
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle" size={18} color={Colors.primary} />
              <Text style={styles.infoBannerText}>
                Doctor accounts require a 2-step admin approval before you can start practicing.
              </Text>
            </View>
          )}

          {errors.general && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={Colors.danger} />
              <Text style={styles.errorBannerText}>{errors.general}</Text>
            </View>
          )}

          <Input
            label="Full Name"
            placeholder="Enter your full name"
            icon="person-outline"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
            error={errors.name}
          />

          <Input
            label="Phone Number"
            placeholder="Enter your phone number"
            icon="call-outline"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            error={errors.phone}
          />

          <Input
            label="Email"
            placeholder="Enter your email"
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="Create a strong password"
            icon="lock-closed-outline"
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowPassword(!showPassword)}
            value={password}
            onChangeText={setPassword}
            error={errors.password}
          />

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBar}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthSegment,
                      {
                        backgroundColor:
                          i <= strength.level ? strength.color : Colors.borderLight,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>
                {strength.label}
              </Text>
            </View>
          )}

          {/* Doctor-only: Specialization */}
          {role === 'DOCTOR' && (
            <Input
              label="Medical Specialization"
              placeholder="e.g. Cardiologist, Dermatologist"
              icon="briefcase-outline"
              autoCapitalize="words"
              value={specialization}
              onChangeText={setSpecialization}
              error={errors.specialization}
            />
          )}

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            size="lg"
          />

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => router.back()}
          >
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={styles.linkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 36,
    paddingHorizontal: Spacing.xxl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  headerSubtitle: {
    fontSize: Fonts.sizes.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
  },
  form: {
    padding: Spacing.xxl,
    paddingTop: Spacing.xxl,
  },
  roleContainer: {
    marginBottom: Spacing.xl,
  },
  roleLabel: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.md,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.sm,
    gap: Spacing.sm,
  },
  roleActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  roleText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  roleTextActive: {
    color: Colors.textInverse,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryFaded,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  infoBannerText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    flex: 1,
    fontWeight: '500',
    lineHeight: Fonts.lineHeights.sm,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dangerLight,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  errorBannerText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.danger,
    flex: 1,
    fontWeight: '500',
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  strengthBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 3,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  linkText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
  },
  linkBold: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
