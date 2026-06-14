import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Colors, Fonts, Spacing, Radii } from '@/constants/theme';

type BadgeVariant = 'confirmed' | 'completed' | 'cancelled' | 'pending' | 'approved' | 'rejected' | 'inProgress' | 'scheduled' | 'paid' | 'refunded' | 'info';

const variantMap: Record<BadgeVariant, { bg: string; border: string; text: string }> = {
  confirmed: { bg: Colors.infoLight, border: '#bdf0ff', text: Colors.primary },
  completed: { bg: Colors.successLight, border: '#a7f3d0', text: Colors.success },
  cancelled: { bg: Colors.dangerLight, border: '#fecaca', text: Colors.danger },
  pending: { bg: Colors.warningLight, border: '#fef3c7', text: Colors.warning },
  approved: { bg: Colors.successLight, border: '#a7f3d0', text: Colors.success },
  rejected: { bg: Colors.dangerLight, border: '#fecaca', text: Colors.danger },
  inProgress: { bg: '#EDE9FE', border: '#ddd6fe', text: Colors.statusInProgress },
  scheduled: { bg: Colors.infoLight, border: '#bdf0ff', text: Colors.primary },
  paid: { bg: Colors.successLight, border: '#a7f3d0', text: Colors.success },
  refunded: { bg: Colors.warningLight, border: '#fef3c7', text: Colors.warning },
  info: { bg: Colors.primaryFaded, border: '#fef3c7', text: Colors.primary },
};

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ label, variant, style }: BadgeProps) {
  const v = variantMap[variant] || variantMap.info;
  return (
    <View 
      style={[
        { 
          backgroundColor: v.bg, 
          borderColor: v.border,
          borderWidth: 1,
          borderRadius: Radii.sm,
          paddingHorizontal: Spacing.md,
          paddingVertical: 3,
          alignSelf: 'flex-start'
        }, 
        style
      ]}
    >
      <Text 
        style={{ 
          color: v.text,
          fontSize: 10,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 0.5
        }}
      >
        {label}
      </Text>
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
