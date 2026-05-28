import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Fonts, Spacing, Radii, Gradients } from '@/constants/theme';

export default function VerificationPendingScreen() {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();

    const animateDot = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.delay(800),
        ]),
      ).start();

    animateDot(dot1, 0);
    animateDot(dot2, 250);
    animateDot(dot3, 500);
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={['#EEF2FF', '#F0FDF4', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Animated icon */}
        <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
          <Animated.View style={[styles.iconRing, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <Ionicons name="shield-checkmark" size={52} color="#fff" />
            </LinearGradient>
          </Animated.View>
        </Animated.View>

        {/* Waiting dots */}
        <View style={styles.dotsRow}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
          ))}
        </View>

        <Text style={styles.title}>Documents Under Review</Text>
        <Text style={styles.subtitle}>Please wait for confirmation</Text>

        {/* Info card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.stepIcon}>
              <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>Account Verified</Text>
              <Text style={styles.stepDesc}>Your basic account has been approved by our team.</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardRow}>
            <View style={styles.stepIcon}>
              <Ionicons name="document-text-outline" size={22} color={Colors.warning} />
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>Details Submitted</Text>
              <Text style={styles.stepDesc}>Your professional details and license number are being reviewed.</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardRow}>
            <View style={styles.stepIcon}>
              <Ionicons name="time-outline" size={22} color={Colors.warning} />
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>Under Verification</Text>
              <Text style={styles.stepDesc}>Our admin team is verifying your credentials. This usually takes 24–48 hours.</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardRow}>
            <View style={styles.stepIcon}>
              <Ionicons name="lock-closed-outline" size={22} color={Colors.textSecondary} />
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>Practice Access</Text>
              <Text style={styles.stepDesc}>Once fully approved, you can start receiving patient appointments.</Text>
            </View>
          </View>
        </View>

        <View style={styles.noticeBanner}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
          <Text style={styles.noticeText}>
            You will be notified once your documents are verified. Check back after 24–48 hours.
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.xxl },
  iconRing: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(245,158,11,0.08)',
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg,
  },
  iconGradient: {
    width: 96, height: 96, borderRadius: 48,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
  },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.xl },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.warning },
  title: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text, textAlign: 'center', letterSpacing: -0.5, marginBottom: Spacing.xs },
  subtitle: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, textAlign: 'center', fontWeight: '500', marginBottom: Spacing.xxl },
  card: { width: '100%', backgroundColor: Colors.surface, borderRadius: Radii.lg, padding: Spacing.xl, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.borderLight, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  stepIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  stepText: { flex: 1 },
  stepTitle: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  stepDesc: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, lineHeight: Fonts.lineHeights.sm },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.md },
  noticeBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, backgroundColor: Colors.primaryFaded, borderRadius: Radii.md, padding: Spacing.md, width: '100%', marginBottom: Spacing.xl },
  noticeText: { flex: 1, fontSize: Fonts.sizes.xs, color: Colors.primary, fontWeight: '500', lineHeight: Fonts.lineHeights.sm },
  logoutButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderRadius: Radii.full, borderWidth: 1.5, borderColor: Colors.danger, backgroundColor: 'transparent' },
  logoutButtonText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.danger },
});
