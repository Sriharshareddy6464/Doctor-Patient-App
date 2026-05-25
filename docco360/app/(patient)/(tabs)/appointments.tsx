import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { patientService } from '@/services/patient';
import { AppointmentCard } from '@/components/AppointmentCard';
import { LoadingScreen, EmptyState } from '@/components/LoadingScreen';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { Appointment } from '@/services/doctor';

export default function PatientAppointmentsScreen() {
  const insets = useSafeAreaInsets();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = useCallback(async () => {
    try {
      const data = await patientService.getAppointments();
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
      const callData = await patientService.joinCall(id);
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
      await patientService.endCall(id);
      Alert.alert('Call Ended', 'The appointment has been marked as completed.');
      fetchAppointments();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to end call');
    }
  };

  const sections = [
    {
      title: 'Upcoming',
      data: appointments.filter((a) => a.status === 'CONFIRMED'),
    },
    {
      title: 'Completed',
      data: appointments.filter((a) => a.status === 'COMPLETED'),
    },
    {
      title: 'Cancelled',
      data: appointments.filter((a) => a.status === 'CANCELLED'),
    },
  ].filter((s) => s.data.length > 0);

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Text style={styles.title}>My Appointments</Text>
        <Text style={styles.subtitle}>{appointments.length} total</Text>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            role="patient"
            onJoinCall={() => handleJoinCall(item.id)}
            onEndCall={() => handleEndCall(item.id)}
          />
        )}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
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
            title="No Appointments"
            subtitle="Book your first appointment by browsing available doctors"
          />
        }
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
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
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  list: {
    padding: Spacing.lg,
  },
});
