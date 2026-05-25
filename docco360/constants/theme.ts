export const Colors = {
  primary: '#1A6FEF',
  primaryDark: '#0D47A1',
  primaryDeep: '#08306B',
  primaryLight: '#64B5F6',
  primaryFaded: '#DBEAFE',
  accent: '#4FC3F7',

  background: '#F0F6FF',
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFF',
  card: '#FFFFFF',
  navyDark: '#0A1628',

  text: '#1A2138',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  textLink: '#1A6FEF',

  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  divider: '#E5E7EB',

  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  overlay: 'rgba(10, 22, 40, 0.5)',
  shadow: 'rgba(26, 111, 239, 0.08)',

  statusConfirmed: '#1A6FEF',
  statusCompleted: '#10B981',
  statusCancelled: '#EF4444',
  statusPending: '#F59E0B',
  statusApproved: '#10B981',
  statusRejected: '#EF4444',
  statusInProgress: '#8B5CF6',
  statusScheduled: '#1A6FEF',
  statusPaid: '#10B981',
  statusRefunded: '#F59E0B',
};

export const Fonts = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',

  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    hero: 36,
  },

  lineHeights: {
    xs: 16,
    sm: 18,
    md: 22,
    lg: 24,
    xl: 28,
    xxl: 32,
    xxxl: 38,
    hero: 44,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
};

export const Radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const Shadows = {
  sm: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: 'rgba(26, 111, 239, 0.15)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
  },
};

export const Gradients = {
  primary: ['#1A6FEF', '#0D47A1'] as const,
  primaryLight: ['#64B5F6', '#1A6FEF'] as const,
  accent: ['#4FC3F7', '#1A6FEF'] as const,
  dark: ['#0A1628', '#1A2B4A'] as const,
  card: ['#FFFFFF', '#F8FAFF'] as const,
  success: ['#10B981', '#059669'] as const,
  danger: ['#EF4444', '#DC2626'] as const,
};
