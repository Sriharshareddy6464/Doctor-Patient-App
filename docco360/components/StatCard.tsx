import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radii } from '@/constants/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
}

export function StatCard({ title, value, icon, color }: StatCardProps) {
  const iconColor = color || Colors.primary;

  return (
    <View 
      style={{
        backgroundColor: Colors.surface,
        borderRadius: Radii.sm,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.lg,
        flex: 1,
        minWidth: 140,
      }}
    >
      <View 
        style={{
          width: 38,
          height: 38,
          borderRadius: Radii.xs,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: Spacing.md,
          backgroundColor: iconColor + '10',
        }}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text 
        style={{
          fontSize: Fonts.sizes.xxl,
          fontWeight: '800',
          color: Colors.text,
        }}
      >
        {value}
      </Text>
      <Text 
        style={{
          fontSize: Fonts.sizes.xs,
          color: Colors.textSecondary,
          fontWeight: '600',
          marginTop: 4,
        }}
      >
        {title}
      </Text>
    </View>
  );
}
