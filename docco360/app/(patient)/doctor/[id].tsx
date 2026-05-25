import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { patientService, DoctorListing } from '@/services/patient';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Colors, Fonts, Spacing, Radii, Shadows, Gradients } from '@/constants/theme';
import type { TimeSlot } from '@/services/doctor';

export default function DoctorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [doctor, setDoctor] = useState<DoctorListing | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      full: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate().toString(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const data = await patientService.getDoctorById(id!);
        setDoctor(data);
      } catch (error) {
        console.error('Failed to fetch doctor:', error);
        Alert.alert('Error', 'Failed to load doctor details');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  const fetchSlots = useCallback(
    async (date: string) => {
      setSlotsLoading(true);
      setSelectedSlot(null);
      try {
        const data = await patientService.getDoctorSlots(id!, date);
        setSlots(data.slots || []);
      } catch (error: any) {
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    },
    [id],
  );

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    fetchSlots(date);
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    setBooking(true);
    try {
      const result = await patientService.bookAppointment(selectedSlot.id, notes || undefined);
      Alert.alert(
        'Appointment Booked! 🎉',
        `Payment: ₹${result.payment.amount} ${result.payment.status}\nTransaction: ${result.payment.transactionId}`,
        [{ text: 'View Appointments', onPress: () => router.replace('/(patient)/(tabs)/appointments') }],
      );
    } catch (error: any) {
      Alert.alert('Booking Failed', error.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!doctor) return null;

  const profile = doctor.profile;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + Spacing.md }]}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textInverse} />
          </TouchableOpacity>

          <View style={styles.doctorHeader}>
            <Avatar name={doctor.user.name} size={80} color="rgba(255,255,255,0.25)" />
            <Text style={styles.doctorName}>Dr. {doctor.user.name}</Text>
            {profile?.specializations && (
              <Text style={styles.specialization}>{profile.specializations.join(' • ')}</Text>
            )}
          </View>

          <View style={styles.statsRow}>
            {profile?.experience != null && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profile.experience}+</Text>
                <Text style={styles.statLabel}>Years Exp</Text>
              </View>
            )}
            {profile?.consultationFee != null && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>₹{profile.consultationFee}</Text>
                <Text style={styles.statLabel}>Fee</Text>
              </View>
            )}
            {profile?.availableFrom && profile?.availableTo && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {profile.availableFrom}
                </Text>
                <Text style={styles.statLabel}>to {profile.availableTo}</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Bio */}
          {profile?.bio && (
            <View style={[styles.card, Shadows.sm]}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </View>
          )}

          {/* Qualifications */}
          {profile?.qualifications && profile.qualifications.length > 0 && (
            <View style={[styles.card, Shadows.sm]}>
              <Text style={styles.sectionTitle}>Qualifications</Text>
              {profile.qualifications.map((q, i) => (
                <View key={i} style={styles.qualRow}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                  <Text style={styles.qualText}>{q}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Date Selector */}
          <View style={[styles.card, Shadows.sm]}>
            <Text style={styles.sectionTitle}>Book Appointment</Text>
            <Text style={styles.dateLabel}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {dates.map((d) => (
                <TouchableOpacity
                  key={d.full}
                  style={[styles.dateChip, selectedDate === d.full && styles.dateChipActive]}
                  onPress={() => handleDateSelect(d.full)}
                >
                  <Text style={[styles.dateDay, selectedDate === d.full && styles.dateDayActive]}>
                    {d.day}
                  </Text>
                  <Text style={[styles.dateNum, selectedDate === d.full && styles.dateNumActive]}>
                    {d.date}
                  </Text>
                  <Text style={[styles.dateMonth, selectedDate === d.full && styles.dateMonthActive]}>
                    {d.month}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Time Slots */}
            {selectedDate && (
              <View style={styles.slotsSection}>
                <Text style={styles.dateLabel}>Available Slots</Text>
                {slotsLoading ? (
                  <Text style={styles.loadingText}>Loading slots...</Text>
                ) : slots.length === 0 ? (
                  <Text style={styles.noSlots}>No available slots for this date</Text>
                ) : (
                  <View style={styles.slotsGrid}>
                    {slots.map((slot) => (
                      <TouchableOpacity
                        key={slot.id}
                        style={[
                          styles.slotChip,
                          selectedSlot?.id === slot.id && styles.slotChipActive,
                        ]}
                        onPress={() => setSelectedSlot(slot)}
                      >
                        <Text
                          style={[
                            styles.slotTime,
                            selectedSlot?.id === slot.id && styles.slotTimeActive,
                          ]}
                        >
                          {slot.startTime}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Notes */}
            {selectedSlot && (
              <View style={styles.notesSection}>
                <Text style={styles.dateLabel}>Notes (optional)</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Describe your symptoms or reason for visit..."
                  placeholderTextColor={Colors.textTertiary}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  maxLength={500}
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Book Button */}
      {selectedSlot && (
        <View style={[styles.bookBar, { paddingBottom: insets.bottom + Spacing.md }]}>
          <View style={styles.bookInfo}>
            <Text style={styles.bookDate}>{selectedDate}</Text>
            <Text style={styles.bookTime}>
              {selectedSlot.startTime} - {selectedSlot.endTime}
            </Text>
          </View>
          <Button
            title={`Book • ₹${profile?.consultationFee || 0}`}
            onPress={handleBook}
            loading={booking}
            size="md"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  doctorHeader: { alignItems: 'center', marginTop: Spacing.lg },
  doctorName: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.textInverse, marginTop: Spacing.md },
  specialization: { fontSize: Fonts.sizes.md, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: Spacing.xxl },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.textInverse },
  statLabel: { fontSize: Fonts.sizes.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  content: { padding: Spacing.lg },
  card: { backgroundColor: Colors.card, borderRadius: Radii.lg, padding: Spacing.xl, marginBottom: Spacing.lg },
  sectionTitle: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  bioText: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, lineHeight: Fonts.lineHeights.md },
  qualRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  qualText: { fontSize: Fonts.sizes.md, color: Colors.text, flex: 1 },
  dateLabel: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.md },
  dateScroll: { marginBottom: Spacing.lg },
  dateChip: {
    width: 64, alignItems: 'center', paddingVertical: Spacing.md, marginRight: Spacing.sm,
    borderRadius: Radii.md, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surfaceAlt,
  },
  dateChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dateDay: { fontSize: Fonts.sizes.xs, fontWeight: '600', color: Colors.textSecondary },
  dateDayActive: { color: 'rgba(255,255,255,0.8)' },
  dateNum: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.text, marginVertical: 2 },
  dateNumActive: { color: Colors.textInverse },
  dateMonth: { fontSize: Fonts.sizes.xs, color: Colors.textTertiary },
  dateMonthActive: { color: 'rgba(255,255,255,0.7)' },
  slotsSection: { marginTop: Spacing.sm },
  loadingText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, textAlign: 'center', paddingVertical: Spacing.lg },
  noSlots: { fontSize: Fonts.sizes.sm, color: Colors.textTertiary, textAlign: 'center', paddingVertical: Spacing.lg },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  slotChip: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: Radii.sm,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surfaceAlt,
  },
  slotChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  slotTime: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.text },
  slotTimeActive: { color: Colors.textInverse },
  notesSection: { marginTop: Spacing.xl },
  notesInput: {
    backgroundColor: Colors.surfaceAlt, borderRadius: Radii.md, borderWidth: 1,
    borderColor: Colors.border, padding: Spacing.lg, fontSize: Fonts.sizes.md,
    color: Colors.text, minHeight: 80, textAlignVertical: 'top',
  },
  bookBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 8,
  },
  bookInfo: {},
  bookDate: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.text },
  bookTime: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, marginTop: 2 },
});
