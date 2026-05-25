import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Fonts, Spacing, Radii } from '@/constants/theme';

type BadgeVariant = 'confirmed' | 'completed' | 'cancelled' | 'pending' | 'approved' | 'rejected' | 'inProgress' | 'scheduled' | 'paid' | 'refunded' | 'info';

const variantMap: Record<BadgeVariant, { bg: string; text: string }> = {
  confirmed: { bg: Colors.infoLight, text: Colors.primary },
  completed: { bg: Colors.successLight, text: Colors.success },
  cancelled: { bg: Colors.dangerLight, text: Colors.danger },
  pending: { bg: Colors.warningLight, text: Colors.warning },
  approved: { bg: Colors.successLight, text: Colors.success },
  rejected: { bg: Colors.dangerLight, text: Colors.danger },
  inProgress: { bg: '#EDE9FE', text: Colors.statusInProgress },
  scheduled: { bg: Colors.infoLight, text: Colors.primary },
  paid: { bg: Colors.successLight, text: Colors.success },
  refunded: { bg: Colors.warningLight, text: Colors.warning },
  info: { bg: Colors.primaryFaded, text: Colors.primary },
};

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ label, variant, style }: BadgeProps) {
  const v = variantMap[variant] || variantMap.info;
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }, style]}>
      <Text style={[styles.text, { color: v.text }]}>{label}</Text>
    </View>
  );
}

export function getStatusBadgeVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    IN_PROGRESS: 'inProgress',
    SCHEDULED: 'scheduled',
    PAID: 'paid',
    REFUNDED: 'refunded',
  };
  return map[status] || 'info';
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 1,
    borderRadius: Radii.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
