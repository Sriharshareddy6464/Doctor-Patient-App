import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { doctorService } from '@/services/doctor';
import { Button } from '@/components/Button';
import { Colors, Fonts, Spacing, Radii, Shadows } from '@/constants/theme';
import type { TimeSlot } from '@/services/doctor';

export default function DoctorScheduleScreen() {
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [createdSlots, setCreatedSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      full: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate().toString(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });

  // Generate time options (every 30 min from 06:00 to 22:00)
  const timeOptions = Array.from({ length: 33 }, (_, i) => {
    const h = Math.floor(i / 2) + 6;
    const m = (i % 2) * 30;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  });

  const handleCreateSlots = async () => {
    if (!selectedDate) {
      Alert.alert('Select Date', 'Please select a date first');
      return;
    }
    if (startTime >= endTime) {
      Alert.alert('Invalid Time', 'End time must be after start time');
      return;
    }
    setLoading(true);
    try {
      const slots = await doctorService.createTimeSlots(selectedDate, startTime, endTime);
      setCreatedSlots(slots);
      Alert.alert('Success', `${slots.length} time slot(s) created for ${selectedDate}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create time slots');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Text style={styles.title}>Manage Schedule</Text>
        <Text style={styles.subtitle}>Configure your available time slots</Text>
      </View>

      {/* Date Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {dates.map((d) => (
            <TouchableOpacity
              key={d.full}
              style={[styles.dateChip, selectedDate === d.full && styles.dateChipActive]}
              onPress={() => {
                setSelectedDate(d.full);
                setCreatedSlots([]);
              }}
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
      </View>

      {/* Time Range */}
      <View style={[styles.card, Shadows.md]}>
        <Text style={styles.sectionTitle}>Working Hours</Text>
        <Text style={styles.helperText}>
          Slots will be auto-generated in 30-minute intervals
        </Text>

        <View style={styles.timeRow}>
          <View style={styles.timeCol}>
            <Text style={styles.timeLabel}>Start Time</Text>
            <ScrollView style={styles.timePicker} nestedScrollEnabled>
              {timeOptions.map((t) => (
                <TouchableOpacity
                  key={`start-${t}`}
                  style={[styles.timeOption, startTime === t && styles.timeOptionActive]}
                  onPress={() => setStartTime(t)}
                >
                  <Text
                    style={[styles.timeText, startTime === t && styles.timeTextActive]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.timeDivider}>
            <Ionicons name="arrow-forward" size={20} color={Colors.textTertiary} />
          </View>

          <View style={styles.timeCol}>
            <Text style={styles.timeLabel}>End Time</Text>
            <ScrollView style={styles.timePicker} nestedScrollEnabled>
              {timeOptions.map((t) => (
                <TouchableOpacity
                  key={`end-${t}`}
                  style={[styles.timeOption, endTime === t && styles.timeOptionActive]}
                  onPress={() => setEndTime(t)}
                >
                  <Text
                    style={[styles.timeText, endTime === t && styles.timeTextActive]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.summary}>
          <Ionicons name="time" size={16} color={Colors.primary} />
          <Text style={styles.summaryText}>
            {selectedDate || '(select date)'} • {startTime} → {endTime}
          </Text>
        </View>

        <Button
          title="Create Time Slots"
          onPress={handleCreateSlots}
          loading={loading}
          fullWidth
          size="lg"
          disabled={!selectedDate}
        />
      </View>

      {/* Created Slots */}
      {createdSlots.length > 0 && (
        <View style={[styles.card, Shadows.md]}>
          <Text style={styles.sectionTitle}>
            Created Slots ({createdSlots.length})
          </Text>
          <View style={styles.slotsGrid}>
            {createdSlots.map((slot) => (
              <View
                key={slot.id}
                style={[
                  styles.slotChip,
                  slot.isBooked ? styles.slotBooked : styles.slotAvailable,
                ]}
              >
                <Text
                  style={[
                    styles.slotTime,
                    slot.isBooked ? styles.slotTimeBooked : styles.slotTimeAvailable,
                  ]}
                >
                  {slot.startTime} - {slot.endTime}
                </Text>
                {slot.isBooked && (
                  <Ionicons name="lock-closed" size={12} color={Colors.textTertiary} />
                )}
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
  section: { padding: Spacing.lg },
  sectionTitle: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  helperText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginBottom: Spacing.lg },
  card: { backgroundColor: Colors.card, borderRadius: Radii.lg, padding: Spacing.xl, marginHorizontal: Spacing.lg, marginBottom: Spacing.lg },

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

  timeRow: { flexDirection: 'row', marginBottom: Spacing.lg },
  timeCol: { flex: 1 },
  timeDivider: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.xxl },
  timeLabel: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm },
  timePicker: { maxHeight: 180, borderRadius: Radii.sm, borderWidth: 1, borderColor: Colors.border },
  timeOption: { paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  timeOptionActive: { backgroundColor: Colors.primaryFaded },
  timeText: { fontSize: Fonts.sizes.md, color: Colors.text, textAlign: 'center' },
  timeTextActive: { color: Colors.primary, fontWeight: '700' },

  summary: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg, padding: Spacing.md, backgroundColor: Colors.primaryFaded, borderRadius: Radii.sm },
  summaryText: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.primary },

  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  slotChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radii.sm },
  slotAvailable: { backgroundColor: Colors.successLight },
  slotBooked: { backgroundColor: Colors.surfaceAlt },
  slotTime: { fontSize: Fonts.sizes.xs, fontWeight: '600' },
  slotTimeAvailable: { color: Colors.success },
  slotTimeBooked: { color: Colors.textTertiary },
});
