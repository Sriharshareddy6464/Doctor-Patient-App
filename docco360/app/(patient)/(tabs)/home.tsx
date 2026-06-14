import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { patientService, DoctorListing } from '@/services/patient';
import { DoctorCard } from '@/components/DoctorCard';
import { Avatar } from '@/components/Avatar';
import { LoadingScreen, EmptyState } from '@/components/LoadingScreen';
import { Colors, Fonts, Spacing, Radii, Shadows, Gradients } from '@/constants/theme';
import type { Appointment } from '@/services/doctor';

const CATEGORIES = [
  { id: 'cardio', name: 'Cardiology', icon: 'heart', color: Colors.danger, bg: Colors.dangerLight },
  { id: 'dentist', name: 'Dentist', icon: 'medical', color: Colors.primary, bg: Colors.primaryFaded },
  { id: 'general', name: 'General', icon: 'fitness', color: Colors.warning, bg: Colors.warningLight },
  { id: 'surgeon', name: 'Surgeon', icon: 'pulse', color: Colors.success, bg: Colors.successLight },
];

export default function PatientHomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [doctors, setDoctors] = useState<DoctorListing[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorListing[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [docsData, apptsData] = await Promise.all([
        patientService.getAllDoctors(),
        patientService.getAppointments(),
      ]);
      setDoctors(docsData);
      setFilteredDoctors(docsData);
      setAppointments(apptsData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let result = doctors;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.user.name.toLowerCase().includes(q) ||
          d.profile?.specializations?.some((s) => s.toLowerCase().includes(q)),
      );
    }

    if (selectedCategory) {
      const cat = selectedCategory.toLowerCase();
      result = result.filter((d) =>
        d.profile?.specializations?.some((s) => {
          const spec = s.toLowerCase();
          if (cat === 'cardio') return spec.includes('cardio');
          if (cat === 'dentist') return spec.includes('dent') || spec.includes('dental');
          if (cat === 'general') return spec.includes('gen') || spec.includes('physician');
          if (cat === 'surgeon') return spec.includes('surg');
          return false;
        })
      );
    }

    setFilteredDoctors(result);
  }, [search, selectedCategory, doctors]);

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const upcomingAppointment = appointments.find((a) => a.status === 'CONFIRMED');

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerProfile}>
          <Avatar name={user?.name || 'P'} size={48} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>Hi, {user?.name?.split(' ')[0]}</Text>
            <Text style={styles.headerSub}>How is your health?</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
            {upcomingAppointment && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main content body */}
      <FlatList
        data={filteredDoctors}
        keyExtractor={(item) => item.user.id}
        ListHeaderComponent={
          <View style={styles.bodyContent}>
            {/* Account Active status strip */}
            <View style={styles.statusStrip}>
              <Ionicons name="pulse" size={14} color="#000" />
              <Text style={styles.statusStripText}>Account Active</Text>
              <View style={styles.statusDot} />
            </View>

            {/* Quick action cards ScrollView */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.cardsScroll}
            >
              {/* Card 1: Find a Specialist */}
              <View style={styles.card}>
                <View>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTag}>Find a Specialist</Text>
                    <Ionicons name="search" size={18} color="#000" />
                  </View>
                  <Text style={styles.cardDescription}>
                    Browse our verified directory of top-tier medical professionals.
                  </Text>
                </View>
                <View style={styles.cardActionBtn}>
                  <Text style={styles.cardActionText}>Search Directory</Text>
                  <Ionicons name="arrow-forward" size={12} color="#000" />
                </View>
              </View>

              {/* Card 2: Appointments */}
              <TouchableOpacity 
                style={styles.card}
                onPress={() => router.push('/(patient)/(tabs)/appointments')}
                activeOpacity={0.8}
              >
                <View>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTag}>Appointments</Text>
                    <Ionicons name="calendar" size={18} color="#000" />
                  </View>
                  <Text style={styles.cardDescription}>
                    Manage your upcoming visits and join secure video consultations.
                  </Text>
                </View>
                {appointments.filter(a => a.status === 'CONFIRMED').length > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {appointments.filter(a => a.status === 'CONFIRMED').length} upcoming
                    </Text>
                  </View>
                )}
                <View style={styles.cardActionBtn}>
                  <Text style={styles.cardActionText}>View All</Text>
                  <Ionicons name="arrow-forward" size={12} color="#000" />
                </View>
              </TouchableOpacity>

              {/* Card 3: Health Profile */}
              <TouchableOpacity 
                style={styles.card}
                onPress={() => router.push('/(patient)/(tabs)/profile')}
                activeOpacity={0.8}
              >
                <View>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTag}>Health Profile</Text>
                    <Ionicons name="document-text" size={18} color="#000" />
                  </View>
                  <Text style={styles.cardDescription}>
                    Update your medical details, allergies, and emergency contacts.
                  </Text>
                </View>
                <View style={styles.cardActionBtn}>
                  <Text style={styles.cardActionText}>Edit Profile</Text>
                  <Ionicons name="arrow-forward" size={12} color="#000" />
                </View>
              </TouchableOpacity>
            </ScrollView>

            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={Colors.textSecondary} />
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

            {/* Upcoming Schedule Card */}
            {upcomingAppointment && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Upcoming Schedule</Text>
                  <TouchableOpacity onPress={() => router.push('/(patient)/(tabs)/appointments')}>
                    <Text style={styles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.scheduleCardTouch}
                  activeOpacity={0.9}
                  onPress={() => router.push(`/(patient)/appointment/${upcomingAppointment.id}`)}
                >
                  <LinearGradient
                    colors={Gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.scheduleCardGradient}
                  >
                    <View style={styles.scheduleInfo}>
                      <View style={styles.scheduleDoctorRow}>
                        <Text style={styles.scheduleDoctorName}>Dr. {upcomingAppointment.doctor?.name}</Text>
                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                      </View>
                      <Text style={styles.scheduleDoctorSpecialty}>
                        {upcomingAppointment.doctor?.doctorProfile?.specializations?.join(', ') || 'Specialist'}
                      </Text>
                      <View style={styles.scheduleTimeBadge}>
                        <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.scheduleTimeText}>
                          {upcomingAppointment.timeSlot?.date ? new Date(upcomingAppointment.timeSlot.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                          , {upcomingAppointment.timeSlot?.startTime}
                        </Text>
                      </View>
                    </View>
                    <Avatar name={upcomingAppointment.doctor?.name || 'D'} size={60} color="rgba(255,255,255,0.2)" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Categories */}
            <View style={styles.categoriesSection}>
              <View style={styles.categoriesHeader}>
                <Text style={styles.sectionTitle}>Categories</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScroll}
              >
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryCard,
                        isActive ? styles.categoryCardActive : styles.categoryCardInactive,
                      ]}
                      onPress={() => handleCategoryPress(cat.id)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.categoryIconContainer, { backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : cat.bg }]}>
                        <Ionicons
                          name={cat.icon as any}
                          size={24}
                          color={isActive ? '#fff' : cat.color}
                        />
                      </View>
                      <Text style={[styles.categoryText, isActive ? styles.categoryTextActive : styles.categoryTextInactive]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Top Doctors Label */}
            <View style={styles.categoriesHeader}>
              <Text style={styles.sectionTitle}>Top Doctors</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.doctorCardWrapper}>
            <DoctorCard
              doctor={item}
              onPress={() => router.push(`/(patient)/doctor/${item.user.id}`)}
            />
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.doctorCardWrapper}>
            <EmptyState
              title="No Doctors Found"
              subtitle={search || selectedCategory ? 'Try a different search term or category' : 'No approved doctors available yet'}
            />
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.background,
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  headerInfo: {
    justifyContent: 'center',
  },
  headerName: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSub: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
  },
  bodyContent: {
    paddingTop: Spacing.sm,
  },
  statusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.xs,
    marginBottom: Spacing.xl,
    marginHorizontal: Spacing.xl,
    alignSelf: 'flex-start',
  },
  statusStripText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: Fonts.sizes.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    backgroundColor: '#000',
    borderRadius: 3,
  },
  cardsScroll: {
    gap: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.xs,
    padding: Spacing.xl,
    width: 256,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  cardTag: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardDescription: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textTertiary,
    lineHeight: Fonts.lineHeights.md,
    marginBottom: Spacing.lg,
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  cardActionText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
    color: Colors.text,
  },
  countBadge: {
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: '#f5f5f5',
    alignSelf: 'flex-start',
  },
  countBadgeText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    color: Colors.text,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.xl,
    height: 48,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    marginHorizontal: Spacing.xl,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Fonts.sizes.lg,
    color: Colors.text,
  },
  sectionContainer: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.primary,
  },
  scheduleCardTouch: {
    borderRadius: Radii.md,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  scheduleCardGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleDoctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleDoctorName: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: '#fff',
  },
  scheduleDoctorSpecialty: {
    fontSize: Fonts.sizes.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    marginBottom: Spacing.lg,
  },
  scheduleTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    borderRadius: Radii.xs,
    alignSelf: 'flex-start',
  },
  scheduleTimeText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
    color: '#fff',
  },
  categoriesSection: {
    marginBottom: Spacing.xl,
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  categoriesScroll: {
    gap: Spacing.lg,
    paddingBottom: 4,
    paddingHorizontal: Spacing.xl,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radii.sm,
    borderWidth: 1,
    gap: Spacing.md,
  },
  categoryCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryCardInactive: {
    borderColor: '#e2e8f0',
  },
  categoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: Radii.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  categoryTextInactive: {
    color: Colors.textSecondary,
  },
  doctorCardWrapper: {
    paddingHorizontal: Spacing.xl,
  },
  listContainer: {
    paddingBottom: Spacing.xxl,
  },
});

