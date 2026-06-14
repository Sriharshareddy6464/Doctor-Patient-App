import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { adminService, AdminStats } from '@/services/admin';
import { StatCard } from '@/components/StatCard';
import { Avatar } from '@/components/Avatar';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Colors, Fonts, Spacing, Radii, Shadows } from '@/constants/theme';

export default function AdminDashboardScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) return <LoadingScreen />;

  const adminName = user?.name || 'Admin';

  return (
    <View style={styles.container}>
      {/* Floating Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerLeft}>
          <Avatar name={adminName} size={48} />
          <View style={styles.headerInfo}>
            <Text style={styles.greeting}>Welcome, {adminName.split(' ')[0]} 👋</Text>
            <Text style={styles.subtitle}>Administrator Portal</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
            {stats && stats.pendingApprovals > 0 && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchStats();
            }}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Revenue Card (Flat bordered style) */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueInfo}>
            <Text style={styles.revenueTitle}>Total Revenue</Text>
            <Text style={styles.revenueValue}>₹{(stats?.totalRevenue || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.revenueIconWrap}>
            <Ionicons name="wallet" size={24} color={Colors.primary} />
          </View>
        </View>

        {/* Doctors Stats Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>User & Doctor Statistics</Text>
        </View>

        <View style={styles.row}>
          <StatCard
            title="Total Doctors"
            value={stats?.totalDoctors || 0}
            icon="medical"
            color={Colors.primary}
          />
          <StatCard
            title="Active Doctors"
            value={stats?.activeDoctors || 0}
            icon="checkmark-circle"
            color={Colors.success}
          />
        </View>

        <View style={styles.row}>
          <StatCard
            title="Awaiting Approval"
            value={stats?.pendingApprovals || 0}
            icon="hourglass"
            color={Colors.warning}
          />
          <StatCard
            title="Total Patients"
            value={stats?.totalPatients || 0}
            icon="people"
            color={Colors.accent}
          />
        </View>

        {/* Appointments Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Appointment Statistics</Text>
        </View>

        <View style={styles.row}>
          <StatCard
            title="Total Bookings"
            value={stats?.totalAppointments || 0}
            icon="calendar"
            color={Colors.primary}
          />
          <StatCard
            title="Confirmed"
            value={stats?.confirmedAppointments || 0}
            icon="checkmark"
            color={Colors.info}
          />
        </View>

        <View style={styles.row}>
          <StatCard
            title="Completed"
            value={stats?.completedAppointments || 0}
            icon="checkmark-done"
            color={Colors.success}
          />
          <StatCard
            title="Cancelled"
            value={stats?.cancelledAppointments || 0}
            icon="close-circle"
            color={Colors.danger}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerInfo: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: Radii.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    paddingTop: Spacing.sm,
  },
  revenueCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  revenueInfo: {
    flex: 1,
  },
  revenueTitle: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  revenueValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  revenueIconWrap: {
    width: 46,
    height: 46,
    borderRadius: Radii.xs,
    backgroundColor: Colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    marginVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
});

