/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
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
        textMain: '#18181b', // zinc-900
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
      }
    },
  },
  plugins: [],
}
