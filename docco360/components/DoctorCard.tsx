import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radii, Shadows } from '@/constants/theme';
import { Avatar } from './Avatar';
import type { DoctorListing } from '@/services/patient';

interface DoctorCardProps {
  doctor: DoctorListing;
  onPress: () => void;
}

export function DoctorCard({ doctor, onPress }: DoctorCardProps) {
  const profile = doctor.profile;
  const specializations = profile?.specializations?.slice(0, 2) || [];

  return (
    <TouchableOpacity
      style={[styles.card, Shadows.sm]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Avatar name={doctor.user.name} size={56} />
        <View style={styles.info}>
          <Text style={styles.name}>Dr. {doctor.user.name}</Text>
          {specializations.length > 0 && (
            <Text style={styles.specialty} numberOfLines={1}>
              {specializations.join(' • ')}
            </Text>
          )}
          <View style={styles.metaRow}>
            {profile?.experience != null && (
              <View style={styles.metaItem}>
                <Ionicons name="briefcase-outline" size={13} color={Colors.primary} />
                <Text style={styles.metaText}>{profile.experience} yrs</Text>
              </View>
            )}
            {profile?.consultationFee != null && (
              <View style={styles.metaItem}>
                <Ionicons name="cash-outline" size={13} color={Colors.success} />
                <Text style={styles.metaText}>₹{profile.consultationFee}</Text>
              </View>
            )}
            {profile?.availableFrom && profile?.availableTo && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={13} color={Colors.accent} />
                <Text style={styles.metaText}>
                  {profile.availableFrom}-{profile.availableTo}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.xs,
  },
  name: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.text,
  },
  specialty: {
    fontSize: Fonts.sizes.xs,
    color: Colors.primary,
    marginTop: 2,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
