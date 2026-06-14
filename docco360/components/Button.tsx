import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Colors, Fonts, Spacing, Radii } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const sizeStyles = {
    sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, fontSize: Fonts.sizes.sm },
    md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, fontSize: Fonts.sizes.md },
    lg: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xxl, fontSize: Fonts.sizes.lg },
  };

  const currentSize = sizeStyles[size];

  const variantStyles: Record<string, { bg: string; border: string; textColor: string }> = {
    primary: {
      bg: Colors.primary,
      border: Colors.primary,
      textColor: Colors.textInverse,
    },
    secondary: {
      bg: Colors.primaryFaded,
      border: Colors.primaryFaded,
      textColor: Colors.primary,
    },
    outline: {
      bg: 'transparent',
      border: Colors.border,
      textColor: Colors.text,
    },
    danger: {
      bg: Colors.dangerLight,
      border: Colors.dangerLight,
      textColor: Colors.danger,
    },
    ghost: {
      bg: 'transparent',
      border: 'transparent',
      textColor: Colors.primary,
    },
  };

  const v = variantStyles[variant] || variantStyles.outline;

  const buttonStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.sm,
    backgroundColor: isDisabled ? '#F1F5F9' : v.bg,
    borderWidth: 1,
    borderColor: isDisabled ? '#E2E8F0' : v.border,
    paddingVertical: currentSize.paddingVertical,
    paddingHorizontal: currentSize.paddingHorizontal,
    width: fullWidth ? '100%' : undefined,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[buttonStyle, style]}
    >
      {loading ? (
        <ActivityIndicator color={isDisabled ? '#94A3B8' : v.textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              {
                fontSize: currentSize.fontSize,
                fontWeight: '700',
                color: isDisabled ? '#94A3B8' : v.textColor,
              },
              icon ? { marginLeft: Spacing.sm } : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
