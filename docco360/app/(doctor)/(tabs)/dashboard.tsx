import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { doctorService } from '@/services/doctor';
import { AppointmentCard } from '@/components/AppointmentCard';
import { StatCard } from '@/components/StatCard';
import { LoadingScreen, EmptyState } from '@/components/LoadingScreen';
import { Colors, Fonts, Spacing, Gradients } from '@/constants/theme';
import type { Appointment } from '@/services/doctor';

export default function DoctorDashboardScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = useCallback(async () => {
    try {
      const data = await doctorService.getAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleJoinCall = async (id: string) => {
    try {
      const callData = await doctorService.joinCall(id);
      Alert.alert(
        'Call Started',
        `Connected to channel: ${callData.channelName}\nRole: ${callData.role}\nToken received successfully.`,
      );
      fetchAppointments();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join call');
    }
  };

  const handleEndCall = async (id: string) => {
    try {
      await doctorService.endCall(id);
      Alert.alert('Call Ended', 'The appointment has been marked as completed.');
      fetchAppointments();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to end call');
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(
    (a) => a.timeSlot?.date === today && a.status === 'CONFIRMED',
  );
  const upcomingCount = appointments.filter((a) => a.status === 'CONFIRMED').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={appointments.filter((a) => a.status === 'CONFIRMED')}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* Header */}
            <LinearGradient
              colors={Gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}
            >
              <Text style={styles.greeting}>
                Welcome, Dr. {user?.name?.split(' ')[0]} 👋
              </Text>
              <Text style={styles.subtitle}>
                {todayAppointments.length > 0
                  ? `You have ${todayAppointments.length} appointment(s) today`
                  : 'No appointments scheduled for today'}
              </Text>
            </LinearGradient>

            {/* Stats */}
            <View style={styles.statsRow}>
              <StatCard
                title="Upcoming"
                value={upcomingCount}
                icon="calendar"
                gradient={Gradients.primary}
              />
              <StatCard
                title="Completed"
                value={completedCount}
                icon="checkmark-circle"
                color={Colors.success}
              />
            </View>

            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          </>
        }
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            role="doctor"
            onJoinCall={() => handleJoinCall(item.id)}
            onEndCall={() => handleEndCall(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchAppointments();
            }}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No Upcoming Appointments"
            subtitle="Set up your time slots in the Schedule tab to start receiving bookings"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.textInverse },
  subtitle: { fontSize: Fonts.sizes.md, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginTop: -Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  list: { paddingBottom: Spacing.xxxl, paddingHorizontal: Spacing.lg },
});
