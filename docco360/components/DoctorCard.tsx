import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
      style={[styles.card, Shadows.md]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.row}>
        <Avatar name={doctor.user.name} size={56} />
        <View style={styles.info}>
          <Text style={styles.name}>Dr. {doctor.user.name}</Text>
          {specializations.length > 0 && (
            <Text style={styles.specialization} numberOfLines={1}>
              {specializations.join(' • ')}
            </Text>
          )}
          <View style={styles.meta}>
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
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  name: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.text,
  },
  specialization: {
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    marginTop: 2,
    fontWeight: '500',
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
