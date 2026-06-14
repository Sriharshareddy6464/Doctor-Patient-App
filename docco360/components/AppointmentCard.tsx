import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radii, Shadows } from '@/constants/theme';
import { Avatar } from './Avatar';
import { Badge, getStatusBadgeVariant } from './Badge';
import type { Appointment } from '@/services/doctor';

interface AppointmentCardProps {
  appointment: Appointment;
  role: 'patient' | 'doctor' | 'admin';
  onPress?: () => void;
  onJoinCall?: () => void;
  onEndCall?: () => void;
  onCancel?: () => void;
}

export function AppointmentCard({
  appointment,
  role,
  onPress,
  onJoinCall,
  onEndCall,
  onCancel,
}: AppointmentCardProps) {
  const otherUser =
    role === 'patient'
      ? appointment.doctor
      : appointment.patient;
  const userName = otherUser?.name || 'Unknown';
  const userLabel = role === 'patient' ? 'Doctor' : 'Patient';

  const date = appointment.timeSlot?.date || '';
  const startTime = appointment.timeSlot?.startTime || '';
  const endTime = appointment.timeSlot?.endTime || '';

  const formattedDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const canJoin =
    appointment.status === 'CONFIRMED' &&
    (appointment.callStatus === 'SCHEDULED' || appointment.callStatus === 'IN_PROGRESS');
  const canEnd = appointment.callStatus === 'IN_PROGRESS';

  return (
    <TouchableOpacity
      style={[styles.card, Shadows.sm]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar name={userName} size={44} />
          <View style={styles.userText}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userLabel}>{userLabel}</Text>
          </View>
        </View>
        <Badge
          label={appointment.status}
          variant={getStatusBadgeVariant(appointment.status)}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
          <Text style={styles.detailText}>{formattedDate}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={Colors.primary} />
          <Text style={styles.detailText}>
            {startTime} - {endTime}
          </Text>
        </View>
        {appointment.amount > 0 && (
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={16} color={Colors.success} />
            <Text style={styles.detailText}>₹{appointment.amount}</Text>
          </View>
        )}
      </View>

      {appointment.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesTitle}>Notes:</Text>
          <Text style={styles.notesText} numberOfLines={2}>
            {appointment.notes}
          </Text>
        </View>
      )}

      {(canJoin || canEnd || (role === 'admin' && appointment.status === 'CONFIRMED')) && (
        <View style={styles.actions}>
          {canJoin && onJoinCall && (
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={onJoinCall}>
              <Ionicons name="videocam" size={16} color={Colors.textInverse} />
              <Text style={styles.btnTextPrimary}>Join Call</Text>
            </TouchableOpacity>
          )}
          {canEnd && onEndCall && (
            <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={onEndCall}>
              <Ionicons name="call" size={16} color={Colors.textInverse} />
              <Text style={styles.btnTextPrimary}>End Call</Text>
            </TouchableOpacity>
          )}
          {role === 'admin' && appointment.status === 'CONFIRMED' && onCancel && (
            <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={onCancel}>
              <Text style={styles.btnTextOutline}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.sm,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  userName: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.text,
  },
  userLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  notesContainer: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primaryFaded,
    borderRadius: Radii.xs,
    padding: Spacing.md,
  },
  notesTitle: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  notesText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    lineHeight: Fonts.lineHeights.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderRadius: Radii.sm,
    paddingVertical: 10,
    flex: 1,
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
  },
  btnDanger: {
    backgroundColor: Colors.danger,
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: Colors.danger,
    backgroundColor: 'transparent',
  },
  btnTextPrimary: {
    color: Colors.textInverse,
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
  },
  btnTextOutline: {
    color: Colors.danger,
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
  },
});
