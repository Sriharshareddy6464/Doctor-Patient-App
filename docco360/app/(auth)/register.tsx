import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Colors, Fonts, Spacing, Radii, Shadows } from '@/constants/theme';
import { ApiError } from '@/services/api';

type Role = 'PATIENT' | 'DOCTOR';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('PATIENT');
  const [specialization, setSpecialization] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim() || firstName.trim().length < 2) newErrors.firstName = 'Required';
    if (!lastName.trim() || lastName.trim().length < 2) newErrors.lastName = 'Required';
    if (!phone.trim()) newErrors.phone = 'Required';
    else if (phone.trim().length < 7) newErrors.phone = 'Invalid';
    if (!email.trim()) newErrors.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email';
    if (!password) newErrors.password = 'Required';
    else if (password.length < 8) newErrors.password = 'Must be at least 8 chars';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      newErrors.password = 'Too weak';
    if (role === 'DOCTOR' && !specialization.trim())
      newErrors.specialization = 'Required';
    if (!agreed) newErrors.agreed = 'You must agree to the terms';
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

    if (score <= 2) return { level: 1, label: 'Weak', color: Colors.danger };
    if (score <= 3) return { level: 2, label: 'Fair', color: Colors.warning };
    if (score <= 4) return { level: 3, label: 'Good', color: Colors.primary };
    return { level: 4, label: 'Strong', color: Colors.success };
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const { requiresApproval } = await register(
        fullName,
        email.trim().toLowerCase(),
        password,
        role,
        phone.trim(),
        role === 'DOCTOR' ? specialization.trim() : undefined,
      );
      if (requiresApproval) {
        router.replace('/(auth)/pending-approval');
      } else {
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
    <SafeAreaView style={styles.container}>
      {/* Mobile Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.topHeaderLeft}>
          <Ionicons name="leaf" size={24} color={Colors.primary} />
          <Text style={styles.topHeaderTitle}>Docco360</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWrapper}>
            {/* Header & Branding */}
            <View style={styles.header}>
              <Text style={styles.appName}>Create an account</Text>
              <Text style={styles.tagline}>Please complete your profile to continue</Text>
            </View>

            {/* Role Selection Tabs */}
            <View style={styles.roleTabsContainer}>
              <TouchableOpacity
                style={[styles.roleTab, role === 'PATIENT' && styles.roleTabActive]}
                onPress={() => setRole('PATIENT')}
              >
                <Text style={[styles.roleTabText, role === 'PATIENT' && styles.roleTabTextActive]}>Patient</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleTab, role === 'DOCTOR' && styles.roleTabActive]}
                onPress={() => setRole('DOCTOR')}
              >
                <Text style={[styles.roleTabText, role === 'DOCTOR' && styles.roleTabTextActive]}>Doctor / Provider</Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {errors.general && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={18} color={Colors.danger} />
                  <Text style={styles.errorBannerText}>{errors.general}</Text>
                </View>
              )}

              <View style={styles.row}>
                <View style={styles.col}>
                  <Input
                    label="First Name"
                    placeholder="Jane"
                    autoCapitalize="words"
                    value={firstName}
                    onChangeText={setFirstName}
                    error={errors.firstName}
                  />
                </View>
                <View style={styles.col}>
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    autoCapitalize="words"
                    value={lastName}
                    onChangeText={setLastName}
                    error={errors.lastName}
                  />
                </View>
              </View>

              <Input
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                icon="call-outline"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                error={errors.phone}
              />

              <Input
                label="Email Address"
                placeholder="jane.doe@example.com"
                icon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
              />

              <View style={styles.passwordContainer}>
                <Input
                  label="Password"
                  placeholder="••••••••"
                  icon="lock-closed-outline"
                  secureTextEntry={!showPassword}
                  rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  value={password}
                  onChangeText={setPassword}
                  error={errors.password}
                />
                {/* Strength Meter */}
                {password.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBarsRow}>
                      {[1, 2, 3, 4].map((i) => (
                        <View
                          key={i}
                          style={[
                            styles.strengthBar,
                            {
                              backgroundColor:
                                i <= strength.level ? strength.color : Colors.borderLight,
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={[styles.strengthLabel, { color: Colors.textTertiary }]}>
                      {strength.label}
                    </Text>
                  </View>
                )}
              </View>

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

              <TouchableOpacity 
                style={styles.termsContainer}
                activeOpacity={0.7}
                onPress={() => setAgreed(!agreed)}
              >
                <View style={[styles.checkbox, agreed && styles.checkboxActive, errors.agreed && { borderColor: Colors.danger }]}>
                  {agreed && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
                <Text style={styles.termsText}>
                  I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>.
                </Text>
              </TouchableOpacity>

              <Button
                title="Create Account"
                onPress={handleRegister}
                loading={loading}
                fullWidth
                size="lg"
                style={styles.submitButton}
              />
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or register with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Logins */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                <Ionicons name="logo-google" size={20} color="#EA4335" />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                <Ionicons name="logo-apple" size={20} color="#000" />
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    backgroundColor: Colors.background,
  },
  topHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  topHeaderTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  appName: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    fontWeight: '400',
    textAlign: 'center',
  },
  roleTabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.borderLight,
    borderRadius: Radii.md,
    padding: 4,
    marginBottom: Spacing.xl,
  },
  roleTab: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radii.sm - 2,
    alignItems: 'center',
  },
  roleTabActive: {
    backgroundColor: Colors.surface,
    ...Shadows.sm,
  },
  roleTabText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  roleTabTextActive: {
    color: Colors.primary,
  },
  form: {
    marginBottom: Spacing.lg,
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
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  col: {
    flex: 1,
  },
  passwordContainer: {
    marginBottom: Spacing.xs,
  },
  strengthContainer: {
    marginTop: 4,
    paddingHorizontal: 4,
  },
  strengthBarsRow: {
    flexDirection: 'row',
    gap: 4,
    height: 6,
    marginBottom: 4,
  },
  strengthBar: {
    flex: 1,
    borderRadius: Radii.full,
  },
  strengthLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'right',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: Spacing.xs,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: Fonts.sizes.xs,
    color: Colors.textTertiary,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  socialButtonText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
    color: Colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  footerText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: Fonts.sizes.md,
    color: Colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
