import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  Switch,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { adminService, AdminDoctor, DoctorApprovalStatus } from '@/services/admin';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { LoadingScreen, EmptyState } from '@/components/LoadingScreen';
import { Colors, Fonts, Spacing, Radii, Shadows } from '@/constants/theme';

type RejectModalType = { id: string; name: string } | null;

function getPhaseLabel(status: DoctorApprovalStatus): { label: string; color: string; bgColor: string } {
  switch (status) {
    case 'PENDING': return { label: 'Pending Verification', color: Colors.warning, bgColor: Colors.warningLight };
    case 'APPROVED': return { label: 'Verified ✓', color: Colors.success, bgColor: Colors.successLight };
    case 'REJECTED': return { label: 'Rejected', color: Colors.danger, bgColor: Colors.dangerLight };
    case 'NEEDS_DETAILS': return { label: 'Needs Details', color: Colors.textSecondary, bgColor: '#F1F5F9' };
    default: return { label: status, color: Colors.textSecondary, bgColor: '#F1F5F9' };
  }
}

export default function AdminDoctorsScreen() {
  const insets = useSafeAreaInsets();
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rejectModal, setRejectModal] = useState<RejectModalType>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DoctorApprovalStatus | ''>('');

  const fetchDoctors = useCallback(async () => {
    try {
      const data = await adminService.getDoctors();
      setDoctors(data);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await adminService.approveDoctor(id);
      Alert.alert('✓ Doctor Verified', 'Doctor credentials verified and doctor is approved.');
      fetchDoctors();
    } catch (error: any) { Alert.alert('Error', error.message); }
    finally { setActionLoading(null); }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal.id);
    try {
      await adminService.rejectDoctor(rejectModal.id, rejectReason);
      Alert.alert('Done', 'Doctor verification rejected.');
      setRejectModal(null);
      setRejectReason('');
      fetchDoctors();
    } catch (error: any) { Alert.alert('Error', error.message); }
    finally { setActionLoading(null); }
  };

  const handleToggleAppointments = async (id: string, currentValue: boolean) => {
    const newValue = !currentValue;
    if (!newValue) {
      Alert.alert(
        'Disable Appointments',
        'This doctor will no longer appear in patient searches or receive bookings.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => doToggle(id, newValue),
          },
        ],
      );
    } else {
      doToggle(id, newValue);
    }
  };

  const doToggle = async (id: string, value: boolean) => {
    setActionLoading(id + '-toggle');
    try {
      await adminService.toggleAppointments(id, value);
      fetchDoctors();
    } catch (error: any) { Alert.alert('Error', error.message); }
    finally { setActionLoading(null); }
  };

  const handleDeactivate = async (id: string) => {
    Alert.alert('Deactivate Account', 'This will block the doctor from logging in entirely.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deactivate',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(id);
          try { await adminService.deactivateDoctor(id); Alert.alert('Done', 'Doctor deactivated'); fetchDoctors(); }
          catch (error: any) { Alert.alert('Error', error.message); }
          finally { setActionLoading(null); }
        },
      },
    ]);
  };

  const handleActivate = async (id: string) => {
    setActionLoading(id);
    try { await adminService.activateDoctor(id); Alert.alert('Success', 'Doctor account reactivated'); fetchDoctors(); }
    catch (error: any) { Alert.alert('Error', error.message); }
    finally { setActionLoading(null); }
  };

  // Locally filtered doctors
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.doctorProfile?.specializations?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ?? false) ||
      (doc.doctorProfile?.phone && doc.doctorProfile.phone.includes(searchQuery));

    const docStatus = doc.doctorProfile?.approvalStatus || 'PENDING';
    const matchesStatus = statusFilter === '' || docStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingScreen />;

  const statusOptions: { value: DoctorApprovalStatus | ''; label: string }[] = [
    { value: '', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Verified' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'NEEDS_DETAILS', label: 'Needs Details' },
  ];

  const renderDoctor = ({ item }: { item: AdminDoctor }) => {
    const status = (item.doctorProfile?.approvalStatus || 'PENDING') as DoctorApprovalStatus;
    const phaseInfo = getPhaseLabel(status);
    const isPending = status === 'PENDING';
    const isApproved = status === 'APPROVED';
    const toggleLoading = actionLoading === item.id + '-toggle';

    return (
      <View style={[styles.card, Shadows.md]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <Avatar name={item.name} size={52} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>Dr. {item.name}</Text>
            <Text style={styles.cardEmail}>{item.email}</Text>
            {item.doctorProfile?.phone && (
              <Text style={styles.cardPhone}>{item.doctorProfile.phone}</Text>
            )}
          </View>
          <View style={[styles.phaseBadge, { backgroundColor: phaseInfo.bgColor }]}>
            <Text style={[styles.phaseBadgeText, { color: phaseInfo.color }]}>{phaseInfo.label}</Text>
          </View>
        </View>

        {/* Profile details (when available) */}
        {item.doctorProfile && (
          <View style={styles.details}>
            {item.doctorProfile.specializations?.length > 0 && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconWrap}>
                  <Ionicons name="briefcase" size={14} color={Colors.primary} />
                </View>
                <Text style={styles.detailText} numberOfLines={1}>
                  {item.doctorProfile.specializations.join(', ')}
                </Text>
              </View>
            )}
            {item.doctorProfile.experience > 0 && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconWrap}>
                  <Ionicons name="trending-up" size={14} color={Colors.success} />
                </View>
                <Text style={styles.detailText}>{item.doctorProfile.experience} yrs exp</Text>
              </View>
            )}
            {item.doctorProfile.consultationFee != null && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconWrap}>
                  <Ionicons name="cash" size={14} color={Colors.warning} />
                </View>
                <Text style={styles.detailText}>₹{item.doctorProfile.consultationFee}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <View style={styles.detailIconWrap}>
                <Ionicons name="calendar" size={14} color={Colors.accent} />
              </View>
              <Text style={styles.detailText}>{item._count?.doctorAppointments || 0} bookings</Text>
            </View>

            {/* License number */}
            {item.doctorProfile.licenseNumber && (
              <View style={[styles.detailRow, styles.licenseRow]}>
                <View style={styles.detailIconWrap}>
                  <Ionicons name="card" size={14} color={Colors.primary} />
                </View>
                <Text style={styles.licenseText}>License: {item.doctorProfile.licenseNumber}</Text>
              </View>
            )}
          </View>
        )}

        {/* Rejection reasons */}
        {status === 'REJECTED' && item.doctorProfile?.rejectionReason && (
          <View style={[styles.reasonBanner, Shadows.sm]}>
            <Ionicons name="warning" size={14} color={Colors.danger} />
            <Text style={styles.reasonText}>Rejected reason: {item.doctorProfile.rejectionReason}</Text>
          </View>
        )}

        {/* Practice Access / Appointment Toggle */}
        {isApproved && (
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Ionicons
                name={item.doctorProfile?.canTakeAppointments ? 'calendar' : 'calendar-outline'}
                size={18}
                color={item.doctorProfile?.canTakeAppointments ? Colors.success : Colors.textSecondary}
              />
              <Text style={[styles.toggleLabel, { color: item.doctorProfile?.canTakeAppointments ? Colors.success : Colors.textSecondary }]}>
                {item.doctorProfile?.canTakeAppointments ? 'Accepting Appointments' : 'Appointments Disabled'}
              </Text>
            </View>
            <Switch
              value={!!item.doctorProfile?.canTakeAppointments}
              onValueChange={() => handleToggleAppointments(item.id, !!item.doctorProfile?.canTakeAppointments)}
              disabled={toggleLoading}
              trackColor={{ false: Colors.border, true: Colors.success }}
              thumbColor={item.doctorProfile?.canTakeAppointments ? '#fff' : Colors.textTertiary}
            />
          </View>
        )}

        {/* Account active status */}
        <View style={styles.statusRow}>
          <View style={[styles.activeChip, { backgroundColor: item.isActive ? Colors.successLight + '20' : Colors.dangerLight + '20', borderColor: item.isActive ? Colors.successLight : Colors.dangerLight }]}>
            <View style={[styles.activeDot, { backgroundColor: item.isActive ? Colors.success : Colors.danger }]} />
            <Text style={[styles.activeText, { color: item.isActive ? Colors.success : Colors.danger }]}>
              {item.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          {isPending && (
            <>
              <Button
                title="Verify Doctor"
                onPress={() => handleApprove(item.id)}
                variant="primary"
                size="sm"
                loading={actionLoading === item.id}
              />
              <Button
                title="Reject"
                onPress={() => setRejectModal({ id: item.id, name: item.name })}
                variant="danger"
                size="sm"
              />
            </>
          )}

          {isApproved && item.isActive && (
            <Button
              title="Deactivate Account"
              onPress={() => handleDeactivate(item.id)}
              variant="ghost"
              size="sm"
              style={styles.deactivateBtn}
            />
          )}
          {!item.isActive && (
            <Button
              title="Activate Account"
              onPress={() => handleActivate(item.id)}
              variant="secondary"
              size="sm"
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Frameless Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Text style={styles.title}>Manage Doctors</Text>
        <Text style={styles.subtitle}>{filteredDoctors.length} doctors found</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.textTertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search doctors, specializations..."
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

      {/* Status Filter Chips */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {statusOptions.map((opt) => {
            const isSelected = statusFilter === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipActive,
                ]}
                onPress={() => setStatusFilter(opt.value)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredDoctors}
        keyExtractor={(item) => item.id}
        renderItem={renderDoctor}
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
        ListEmptyComponent={<EmptyState title="No Doctors" subtitle="No doctor registrations match your filters" />}
        showsVerticalScrollIndicator={false}
      />

      {/* Reject Modal */}
      <Modal visible={!!rejectModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, Shadows.xl]}>
            <Text style={styles.modalTitle}>Reject Verification</Text>
            <Text style={styles.modalSubtitle}>
              Provide a reason for rejecting Dr. {rejectModal?.name}'s application.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Reason for rejection (optional)..."
              placeholderTextColor={Colors.textTertiary}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
            />
            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => { setRejectModal(null); setRejectReason(''); }} variant="ghost" size="sm" />
              <Button title="Reject" onPress={handleReject} variant="danger" size="sm" loading={!!actionLoading} />
            </View>
          </View>
        </View>
      </Modal>
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
  filterContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
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
  cardPhone: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  phaseBadge: {
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  phaseBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
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
  licenseRow: {
    width: '100%',
    marginTop: Spacing.xs,
  },
  licenseText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.primary,
    fontWeight: '700',
  },
  reasonBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    backgroundColor: Colors.dangerLight + '20',
    borderRadius: Radii.md,
    padding: Spacing.md,
  },
  reasonText: {
    flex: 1,
    fontSize: Fonts.sizes.xs,
    color: Colors.danger,
    fontWeight: '600',
    lineHeight: Fonts.lineHeights.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  toggleLabel: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusRow: {
    marginTop: Spacing.md,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radii.full,
    borderWidth: 1.5,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  deactivateBtn: {
    borderColor: Colors.dangerLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
  },
  modalTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '800',
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.lg,
    lineHeight: Fonts.lineHeights.sm,
  },
  modalInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: Radii.md,
    padding: Spacing.md,
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
});

