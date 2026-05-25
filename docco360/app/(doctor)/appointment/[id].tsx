import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { doctorService } from '@/services/doctor';
import { Avatar } from '@/components/Avatar';
import { Badge, getStatusBadgeVariant } from '@/components/Badge';
import { Button } from '@/components/Button';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Colors, Fonts, Spacing, Radii, Shadows, Gradients } from '@/constants/theme';
import type { Appointment } from '@/services/doctor';

export default function DoctorAppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await doctorService.getAppointments();
        const found = data.find((a) => a.id === id);
        setAppointment(found || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleJoin = async () => {
    setActionLoading(true);
    try {
      const callData = await doctorService.joinCall(id!);
      Alert.alert(
        'Call Connected 📞',
        `Channel: ${callData.channelName}\nRole: ${callData.role}\nExpires in: ${callData.expiresIn}s`,
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnd = async () => {
    setActionLoading(true);
    try {
      await doctorService.endCall(id!);
      Alert.alert('Call Ended', 'Appointment marked as completed.');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!appointment) return <LoadingScreen message="Appointment not found" />;

  const patient = appointment.patient;
  const slot = appointment.timeSlot;
  const canJoin = appointment.status === 'CONFIRMED' && appointment.callStatus !== 'COMPLETED';
  const canEnd = appointment.callStatus === 'IN_PROGRESS';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + Spacing.md }]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textInverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointment Details</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusRow}>
          <Badge label={appointment.status} variant={getStatusBadgeVariant(appointment.status)} />
          <Badge label={appointment.callStatus} variant={getStatusBadgeVariant(appointment.callStatus)} />
        </View>

        {patient && (
          <View style={[styles.card, Shadows.md]}>
            <View style={styles.cardRow}>
              <Avatar name={patient.name} size={52} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{patient.name}</Text>
                <Text style={styles.cardEmail}>{patient.email}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={[styles.card, Shadows.md]}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={18} color={Colors.primary} />
            <Text style={styles.infoText}>
              {slot?.date ? new Date(slot.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ''}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={18} color={Colors.primary} />
            <Text style={styles.infoText}>{slot?.startTime} - {slot?.endTime}</Text>
          </View>
        </View>

        {appointment.notes && (
          <View style={[styles.card, Shadows.md]}>
            <Text style={styles.sectionTitle}>Patient Notes</Text>
            <Text style={styles.notesText}>{appointment.notes}</Text>
          </View>
        )}

        <View style={styles.actions}>
          {canJoin && (
            <Button
              title="Join Video Call"
              onPress={handleJoin}
              loading={actionLoading}
              fullWidth
              size="lg"
              icon={<Ionicons name="videocam" size={20} color={Colors.textInverse} />}
            />
          )}
          {canEnd && (
            <Button
              title="End Call"
              onPress={handleEnd}
              loading={actionLoading}
              fullWidth
              size="lg"
              variant="danger"
              icon={<Ionicons name="call" size={20} color={Colors.danger} />}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.textInverse, marginTop: Spacing.md },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  statusRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  card: { backgroundColor: Colors.card, borderRadius: Radii.lg, padding: Spacing.xl, marginBottom: Spacing.md },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardInfo: { marginLeft: Spacing.md, flex: 1 },
  cardName: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text },
  cardEmail: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  infoText: { fontSize: Fonts.sizes.md, color: Colors.textSecondary },
  notesText: { fontSize: Fonts.sizes.md, color: Colors.text, lineHeight: Fonts.lineHeights.md },
  actions: { gap: Spacing.md, marginTop: Spacing.lg },
});
