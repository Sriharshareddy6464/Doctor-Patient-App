import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { adminService, AdminPatient } from '@/services/admin';
import { Avatar } from '@/components/Avatar';
import { LoadingScreen, EmptyState } from '@/components/LoadingScreen';
import { Colors, Fonts, Spacing, Radii, Shadows } from '@/constants/theme';

export default function AdminPatientsScreen() {
  const insets = useSafeAreaInsets();
  const [patients, setPatients] = useState<AdminPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPatients = useCallback(async () => {
    try {
      const data = await adminService.getPatients();
      setPatients(data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  if (loading) return <LoadingScreen />;

  const renderPatient = ({ item }: { item: AdminPatient }) => {
    const profile = item.patientProfile;
    return (
      <View style={[styles.card, Shadows.md]}>
        <View style={styles.cardHeader}>
          <Avatar name={item.name} size={48} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardEmail}>{item.email}</Text>
          </View>
        </View>
        <View style={styles.details}>
          {profile?.phone && (
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={14} color={Colors.primary} />
              <Text style={styles.detailText}>{profile.phone}</Text>
            </View>
          )}
          {profile?.gender && (
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={14} color={Colors.accent} />
              <Text style={styles.detailText}>{profile.gender}</Text>
            </View>
          )}
          {profile?.bloodGroup && (
            <View style={styles.detailRow}>
              <Ionicons name="water-outline" size={14} color={Colors.danger} />
              <Text style={styles.detailText}>{profile.bloodGroup}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={14} color={Colors.success} />
            <Text style={styles.detailText}>{item._count?.patientAppointments || 0} appointments</Text>
          </View>
        </View>
        <Text style={styles.dateText}>
          Joined: {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Text style={styles.title}>Patients</Text>
        <Text style={styles.subtitle}>{patients.length} patients</Text>
      </View>

      <FlatList
        data={patients}
        keyExtractor={(item) => item.id}
        renderItem={renderPatient}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPatients(); }} tintColor={Colors.primary} />
        }
        ListEmptyComponent={<EmptyState title="No Patients" subtitle="No patient registrations yet" />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.lg,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  title: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
  list: { padding: Spacing.lg },

  card: { backgroundColor: Colors.card, borderRadius: Radii.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: Spacing.md },
  cardName: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
  cardEmail: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, marginTop: 1 },

  details: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, fontWeight: '500' },

  dateText: { fontSize: Fonts.sizes.xs, color: Colors.textTertiary, marginTop: Spacing.md },
});
