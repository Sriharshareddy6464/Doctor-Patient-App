import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { patientService, DoctorListing } from '@/services/patient';
import { DoctorCard } from '@/components/DoctorCard';
import { LoadingScreen, EmptyState } from '@/components/LoadingScreen';
import { Colors, Fonts, Spacing, Radii, Gradients } from '@/constants/theme';

export default function PatientHomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [doctors, setDoctors] = useState<DoctorListing[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorListing[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDoctors = useCallback(async () => {
    try {
      const data = await patientService.getAllDoctors();
      setDoctors(data);
      setFilteredDoctors(data);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredDoctors(doctors);
      return;
    }
    const q = search.toLowerCase();
    setFilteredDoctors(
      doctors.filter(
        (d) =>
          d.user.name.toLowerCase().includes(q) ||
          d.profile?.specializations?.some((s) => s.toLowerCase().includes(q)),
      ),
    );
  }, [search, doctors]);

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={Gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.subtitle}>Find your specialist</Text>
          </View>
        </View>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search doctors, specializations..."
            placeholderTextColor={Colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Ionicons
              name="close-circle"
              size={20}
              color={Colors.textTertiary}
              onPress={() => setSearch('')}
            />
          )}
        </View>
      </LinearGradient>

      {/* Doctor List */}
      <FlatList
        data={filteredDoctors}
        keyExtractor={(item) => item.user.id}
        renderItem={({ item }) => (
          <DoctorCard
            doctor={item}
            onPress={() => router.push(`/(patient)/doctor/${item.user.id}`)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchDoctors();
            }}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No Doctors Found"
            subtitle={search ? 'Try a different search term' : 'No approved doctors available yet'}
          />
        }
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
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  subtitle: {
    fontSize: Fonts.sizes.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.lg,
    height: 48,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    color: Colors.text,
  },
  list: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
});
