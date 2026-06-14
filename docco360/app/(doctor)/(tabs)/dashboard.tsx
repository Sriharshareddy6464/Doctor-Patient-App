import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { doctorService } from '@/services/doctor';
import { AppointmentCard } from '@/components/AppointmentCard';
import { StatCard } from '@/components/StatCard';
import { Avatar } from '@/components/Avatar';
import { LoadingScreen, EmptyState } from '@/components/LoadingScreen';
import { Colors, Fonts, Spacing, Radii, Gradients, Shadows } from '@/constants/theme';
import type { Appointment } from '@/services/doctor';

export default function DoctorDashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
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

  const handleJoinCall = async (appointment: Appointment) => {
    try {
      const callData = await doctorService.joinCall(appointment.id);
      router.push({
        pathname: '/call',
        params: {
          appointmentId: appointment.id,
          channelName: callData.channelName,
          token: callData.token,
          appId: callData.appId,
          uid: String(callData.uid),
          role: callData.role,
          remoteName: appointment.patient?.name || 'Patient',
          remoteRole: 'patient',
          appointmentDate: appointment.timeSlot?.date || '',
          appointmentTime: `${appointment.timeSlot?.startTime || ''} - ${appointment.timeSlot?.endTime || ''}`,
        },
      });
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

  const doctorName = user?.name || 'Doctor';
  const displayTitle = user?.doctorProfile?.specializations?.join(', ') || 'Medical Specialist';

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerLeft}>
          <Avatar name={doctorName} size={48} />
          <View style={styles.headerInfo}>
            <Text style={styles.greeting}>Dr. {doctorName.split(' ')[0]} 👋</Text>
            <Text style={styles.subtitle}>{displayTitle}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
            {todayAppointments.length > 0 && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={appointments.filter((a) => a.status === 'CONFIRMED')}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* Status strip */}
            <View style={styles.statusStrip}>
              <Ionicons name="pulse" size={14} color="#000" />
              <Text style={styles.statusStripText}>Available</Text>
              <View style={styles.statusStripDot} />
            </View>

            {/* Quick-action cards */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.cardsScroll}
            >
              {/* Card 1: Incoming Queue */}
              <View style={styles.quickCard}>
                <View style={styles.quickCardHeader}>
                  <Text style={styles.quickCardLabel}>INCOMING QUEUE</Text>
                  <Ionicons name="people" size={18} color="#000" />
                </View>
                <Text style={styles.quickCardDesc}>
                  Patients scheduled for consultations. Launch secure video calls instantly.
                </Text>
                {todayAppointments.length > 0 && (
                  <View style={styles.quickCardBadge}>
                    <Text style={styles.quickCardBadgeText}>
                      {todayAppointments.length} patient{todayAppointments.length !== 1 ? 's' : ''} queued
                    </Text>
                  </View>
                )}
                <View style={styles.quickCardButton}>
                  <Text style={styles.quickCardButtonText}>View Queue</Text>
                  <Ionicons name="arrow-forward" size={14} color="#000" />
                </View>
              </View>

              {/* Card 2: Schedule Availability */}
              <TouchableOpacity 
                style={styles.quickCard}
                onPress={() => router.push('/(doctor)/(tabs)/schedule')}
                activeOpacity={0.8}
              >
                <View style={styles.quickCardHeader}>
                  <Text style={styles.quickCardLabel}>SCHEDULE AVAILABILITY</Text>
                  <Ionicons name="calendar" size={18} color="#000" />
                </View>
                <Text style={styles.quickCardDesc}>
                  Configure your working hours and generate 30-minute slots for patients to book.
                </Text>
                <View style={styles.quickCardButton}>
                  <Text style={styles.quickCardButtonText}>Manage Slots</Text>
                  <Ionicons name="arrow-forward" size={14} color="#000" />
                </View>
              </TouchableOpacity>

              {/* Card 3: Clinic Profile */}
              <TouchableOpacity 
                style={styles.quickCard}
                onPress={() => router.push('/(doctor)/(tabs)/profile')}
                activeOpacity={0.8}
              >
                <View style={styles.quickCardHeader}>
                  <Text style={styles.quickCardLabel}>CLINIC PROFILE</Text>
                  <Ionicons name="settings" size={18} color="#000" />
                </View>
                <Text style={styles.quickCardDesc}>
                  Update your public credentials, specialties, and professional bio.
                </Text>
                <View style={styles.quickCardButton}>
                  <Text style={styles.quickCardButtonText}>Edit Information</Text>
                  <Ionicons name="arrow-forward" size={14} color="#000" />
                </View>
              </TouchableOpacity>
            </ScrollView>

            <Text style={styles.sectionTitle}>Upcoming Queue</Text>
          </View>
        }
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            role="doctor"
            onJoinCall={() => handleJoinCall(item)}
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
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  listHeader: {
    paddingTop: Spacing.sm,
  },
  statusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  statusStripText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: '#555555',
  },
  statusStripDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000000',
    marginLeft: 4,
  },
  cardsScroll: {
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
  quickCard: {
    width: 260,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 4,
    padding: Spacing.lg,
    justifyContent: 'flex-start',
  },
  quickCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  quickCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#555555',
    letterSpacing: 1,
  },
  quickCardDesc: {
    fontSize: 12,
    color: '#777777',
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  quickCardBadge: {
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: '#f5f5f5',
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  quickCardBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000000',
  },
  quickCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignSelf: 'flex-start',
    marginTop: 'auto',
  },
  quickCardButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
});

