import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, Radii, Shadows } from '@/constants/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  gradient?: readonly [string, string, ...string[]];
}

export function StatCard({ title, value, icon, color, gradient }: StatCardProps) {
  const iconColor = color || Colors.primary;

  if (gradient) {
    return (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, Shadows.md]}
      >
        <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Ionicons name={icon} size={22} color={Colors.textInverse} />
        </View>
        <Text style={[styles.value, { color: Colors.textInverse }]}>{value}</Text>
        <Text style={[styles.title, { color: 'rgba(255,255,255,0.85)' }]}>{title}</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.card, Shadows.md, { backgroundColor: Colors.card }]}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    flex: 1,
    minWidth: 140,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  value: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '800',
    color: Colors.text,
  },
  title: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: Spacing.xs,
  },
});
