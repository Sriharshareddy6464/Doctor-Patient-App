import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Colors, Fonts, Spacing, Radii, Shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function PendingApprovalScreen() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="time-outline" size={48} color={Colors.warning} />
          </View>
          
          <Text style={styles.title}>
            Account Pending Approval
          </Text>
          
          <Text style={styles.subtitle}>
            Thank you for registering as a doctor on Docco360. Your application is currently under review by our administration team.
          </Text>
          
          <Text style={styles.description}>
            This process typically takes 1-2 business days. We will notify you via email once your account has been approved and activated.
          </Text>
          
          <Button
            title="Back to Login"
            onPress={handleLogout}
            fullWidth
            variant="outline"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryFaded,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    ...Shadows.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.warningLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Fonts.lineHeights.md,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: Fonts.lineHeights.sm,
    marginBottom: Spacing.xxl,
  },
});

