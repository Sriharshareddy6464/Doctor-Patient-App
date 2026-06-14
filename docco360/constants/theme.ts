export const Colors = {
  primary: '#f59e0b', // orange/amber-500
  primaryDark: '#d97706', // amber-600
  primaryDeep: '#78350f', // amber-900
  primaryLight: '#fde68a', // amber-200
  primaryFaded: '#fef3c7', // amber-100
  accent: '#f59e0b',

  background: '#fafafa', // zinc-50
  surface: '#ffffff',
  surfaceAlt: '#f4f4f5', // zinc-100
  card: '#ffffff',
  navyDark: '#18181b', // zinc-900

  text: '#18181b', // zinc-900
  textSecondary: '#4b5563', // gray-600
  textTertiary: '#71717a', // zinc-500
  textInverse: '#ffffff',
  textLink: '#d97706',

  border: '#e4e4e7', // zinc-200
  borderLight: '#f4f4f5', // zinc-100
  divider: '#e4e4e7',

  success: '#10b981', // emerald-500
  successLight: '#d1fae5', // emerald-100
  warning: '#f59e0b', // amber-500
  warningLight: '#fef3c7', // amber-100
  danger: '#ef4444', // red-500
  dangerLight: '#fee2e2', // red-100
  info: '#3b82f6', // blue-500
  infoLight: '#dbeafe', // blue-100

  overlay: 'rgba(24, 24, 27, 0.4)',
  shadow: 'rgba(245, 158, 11, 0.05)',

  statusConfirmed: '#3b82f6',
  statusCompleted: '#71717a',
  statusCancelled: '#ef4444',
  statusPending: '#f59e0b',
  statusApproved: '#10b981',
  statusRejected: '#ef4444',
  statusInProgress: '#8b5cf6', // purple-500
  statusScheduled: '#3b82f6',
  statusPaid: '#10b981',
  statusRefunded: '#f59e0b',
};

export const Fonts = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',

  sizes: {
    xs: 11,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    hero: 40,
  },

  lineHeights: {
    xs: 16,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    xxl: 32,
    xxxl: 40,
    hero: 48,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
  massive: 80,
};

export const Radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 10,
  },
};

export const Gradients = {
  primary: ['#f59e0b', '#d97706'] as const,
  primaryLight: ['#fef3c7', '#f59e0b'] as const,
  accent: ['#fbbf24', '#f59e0b'] as const,
  dark: ['#18181b', '#27272a'] as const,
  card: ['#ffffff', '#fafafa'] as const,
  success: ['#10b981', '#059669'] as const,
  danger: ['#ef4444', '#dc2626'] as const,
};
