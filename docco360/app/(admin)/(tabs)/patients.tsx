import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
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
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredPatients = patients.filter((pat) => {
    const query = searchQuery.toLowerCase();
    return (
      pat.name.toLowerCase().includes(query) ||
      pat.email.toLowerCase().includes(query) ||
      (pat.patientProfile?.phone && pat.patientProfile.phone.includes(searchQuery))
    );
  });

  if (loading) return <LoadingScreen />;

  const renderPatient = ({ item }: { item: AdminPatient }) => {
    const profile = item.patientProfile;
    return (
      <View style={[styles.card, Shadows.md]}>
        <View style={styles.cardHeader}>
          <Avatar name={item.name} size={52} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardEmail}>{item.email}</Text>
          </View>
        </View>

        <View style={styles.details}>
          {profile?.phone && (
            <View style={styles.detailRow}>
              <View style={styles.detailIconWrap}>
                <Ionicons name="call" size={14} color={Colors.primary} />
              </View>
              <Text style={styles.detailText}>{profile.phone}</Text>
            </View>
          )}
          {profile?.gender && (
            <View style={styles.detailRow}>
              <View style={styles.detailIconWrap}>
                <Ionicons name="person" size={14} color={Colors.accent} />
              </View>
              <Text style={styles.detailText}>{profile.gender}</Text>
            </View>
          )}
          {profile?.bloodGroup && (
            <View style={styles.detailRow}>
              <View style={styles.detailIconWrap}>
                <Ionicons name="water" size={14} color={Colors.danger} />
              </View>
              <Text style={styles.detailText}>{profile.bloodGroup}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrap}>
              <Ionicons name="calendar" size={14} color={Colors.success} />
            </View>
            <Text style={styles.detailText}>{item._count?.patientAppointments || 0} bookings</Text>
          </View>
        </View>

        <Text style={styles.dateText}>
          Registered: {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Frameless Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Text style={styles.title}>Patients List</Text>
        <Text style={styles.subtitle}>{filteredPatients.length} patients found</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.textTertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search patients by name, email..."
          placeholderTextColor={Colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredPatients}
        keyExtractor={(item) => item.id}
        renderItem={renderPatient}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchPatients();
            }}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={<EmptyState title="No Patients" subtitle="No patient registrations match your query" />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.sm,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: Colors.text,
    fontSize: Fonts.sizes.md,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.sm,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  cardName: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.text,
  },
  cardEmail: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailIconWrap: {
    width: 24,
    height: 24,
    borderRadius: Radii.xs,
    backgroundColor: Colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: Spacing.md,
    fontWeight: '500',
  },
});
