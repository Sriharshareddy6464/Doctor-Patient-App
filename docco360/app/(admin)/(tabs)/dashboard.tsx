import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { adminService, AdminStats } from '@/services/admin';
import { StatCard } from '@/components/StatCard';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Colors, Fonts, Spacing, Gradients } from '@/constants/theme';

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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchStats(); }}
          tintColor={Colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={Gradients.dark}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}
      >
        <Text style={styles.greeting}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Welcome, {user?.name}</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Revenue Card */}
        <View style={styles.row}>
          <StatCard
            title="Total Revenue"
            value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
            icon="wallet"
            gradient={Gradients.primary}
          />
        </View>

        {/* Doctors */}
        <Text style={styles.sectionTitle}>Doctors</Text>
        <View style={styles.row}>
          <StatCard title="Total" value={stats?.totalDoctors || 0} icon="medkit" color={Colors.primary} />
          <StatCard title="Active" value={stats?.activeDoctors || 0} icon="checkmark-circle" color={Colors.success} />
        </View>
        <View style={styles.row}>
          <StatCard
            title="Pending Approval"
            value={stats?.pendingApprovals || 0}
            icon="hourglass"
            color={Colors.warning}
          />
          <StatCard title="Patients" value={stats?.totalPatients || 0} icon="people" color={Colors.accent} />
        </View>

        {/* Appointments */}
        <Text style={styles.sectionTitle}>Appointments</Text>
        <View style={styles.row}>
          <StatCard title="Total" value={stats?.totalAppointments || 0} icon="calendar" color={Colors.primary} />
          <StatCard title="Confirmed" value={stats?.confirmedAppointments || 0} icon="checkmark" color={Colors.info} />
        </View>
        <View style={styles.row}>
          <StatCard title="Completed" value={stats?.completedAppointments || 0} icon="checkmark-done" color={Colors.success} />
          <StatCard title="Cancelled" value={stats?.cancelledAppointments || 0} icon="close-circle" color={Colors.danger} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxl,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  greeting: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.textInverse },
  subtitle: { fontSize: Fonts.sizes.md, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  content: { padding: Spacing.lg, paddingTop: Spacing.xl },
  sectionTitle: {
    fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text,
    marginTop: Spacing.lg, marginBottom: Spacing.md,
  },
  row: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
});
