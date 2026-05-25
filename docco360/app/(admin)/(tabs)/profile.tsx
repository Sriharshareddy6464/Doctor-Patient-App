import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/Avatar';
import { Colors, Fonts, Spacing, Radii, Gradients, Shadows } from '@/constants/theme';

type MenuItem = {
  id: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  sublabel?: string;
  color?: string;
  onPress: () => void;
  danger?: boolean;
};

export default function AdminProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Management',
      items: [
        {
          id: 'doctors',
          icon: 'medkit-outline',
          label: 'Manage Doctors',
          sublabel: 'Approve, reject, view doctor accounts',
          color: Colors.primary,
          onPress: () => router.push('/(admin)/(tabs)/doctors'),
        },
        {
          id: 'patients',
          icon: 'people-outline',
          label: 'Manage Patients',
          sublabel: 'View and manage patient accounts',
          color: Colors.info,
          onPress: () => router.push('/(admin)/(tabs)/patients'),
        },
        {
          id: 'appointments',
          icon: 'calendar-outline',
          label: 'All Appointments',
          sublabel: 'View and oversee all bookings',
          color: Colors.success,
          onPress: () => router.push('/(admin)/(tabs)/appointments'),
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'logout',
          icon: 'log-out-outline',
          label: 'Logout',
          color: Colors.danger,
          onPress: handleLogout,
          danger: true,
        },
      ],
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={Gradients.dark}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}
      >
        <Avatar name={user?.name || 'A'} size={80} />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.rolePill}>
          <Ionicons name="shield-checkmark" size={13} color={Colors.warning} />
          <Text style={styles.roleText}>System Administrator</Text>
        </View>
      </LinearGradient>

      {/* Info cards */}
      <View style={styles.infoRow}>
        <View style={[styles.infoCard, Shadows.sm]}>
          <Ionicons name="shield-outline" size={22} color={Colors.primary} />
          <Text style={styles.infoCardTitle}>Full Access</Text>
          <Text style={styles.infoCardSub}>All Permissions</Text>
        </View>
        <View style={[styles.infoCard, Shadows.sm]}>
          <Ionicons name="server-outline" size={22} color={Colors.success} />
          <Text style={styles.infoCardTitle}>System</Text>
          <Text style={styles.infoCardSub}>Active</Text>
        </View>
        <View style={[styles.infoCard, Shadows.sm]}>
          <Ionicons name="key-outline" size={22} color={Colors.warning} />
          <Text style={styles.infoCardTitle}>Admin</Text>
          <Text style={styles.infoCardSub}>Role</Text>
        </View>
      </View>

      {/* Menu sections */}
      <View style={styles.content}>
        {menuSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={[styles.menuCard, Shadows.md]}>
              {section.items.map((item, index) => (
                <View key={item.id}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.menuIconWrap, { backgroundColor: item.danger ? Colors.dangerLight : Colors.primaryFaded }]}>
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={item.color || Colors.primary}
                      />
                    </View>
                    <View style={styles.menuLabelWrap}>
                      <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                        {item.label}
                      </Text>
                      {item.sublabel && (
                        <Text style={styles.menuSublabel}>{item.sublabel}</Text>
                      )}
                    </View>
                    {!item.danger && (
                      <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                    )}
                  </TouchableOpacity>
                  {index < section.items.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    paddingBottom: Spacing.xxl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  name: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '800',
    color: Colors.textInverse,
    marginTop: Spacing.md,
  },
  email: {
    fontSize: Fonts.sizes.sm,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
  },
  roleText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    color: Colors.warning,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  infoCardTitle: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  infoCardSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabelWrap: {
    flex: 1,
  },
  menuLabel: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  menuLabelDanger: {
    color: Colors.danger,
  },
  menuSublabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: Spacing.lg + 40 + Spacing.md,
  },
});
