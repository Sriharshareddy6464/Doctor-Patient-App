import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '@/constants/theme';

interface AvatarProps {
  name: string;
  size?: number;
  color?: string;
}

export function Avatar({ name, size = 48, color }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const bgColor = color || getColorForName(name);

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
          justifyContent: 'center',
          alignItems: 'center',
        },
      ]}
    >
      <Text style={[{ fontSize: size * 0.38, color: '#fff', fontWeight: '700' }]}>{initials}</Text>
    </View>
  );
}

function getColorForName(name: string): string {
  const colors = [
    Colors.primary,
    Colors.primaryDark,
    Colors.primaryDeep,
    '#71717a', // zinc-500
    '#4b5563', // gray-600
    Colors.success,
    '#6366f1', // indigo-500
    '#06b6d4', // cyan-500
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
