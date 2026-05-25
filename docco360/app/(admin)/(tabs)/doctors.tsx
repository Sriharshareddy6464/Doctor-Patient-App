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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { adminService, AdminDoctor } from '@/services/admin';
import { Avatar } from '@/components/Avatar';
import { Badge, getStatusBadgeVariant } from '@/components/Badge';
import { Button } from '@/components/Button';
import { LoadingScreen, EmptyState } from '@/components/LoadingScreen';
import { Colors, Fonts, Spacing, Radii, Shadows } from '@/constants/theme';

export default function AdminDoctorsScreen() {
  const insets = useSafeAreaInsets();
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await adminService.approveDoctor(id);
      Alert.alert('Success', 'Doctor approved successfully');
      fetchDoctors();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal);
    try {
      await adminService.rejectDoctor(rejectModal, rejectReason);
      Alert.alert('Done', 'Doctor application rejected');
      setRejectModal(null);
      setRejectReason('');
      fetchDoctors();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (id: string) => {
    setActionLoading(id);
    try {
      await adminService.activateDoctor(id);
      Alert.alert('Success', 'Doctor activated');
      fetchDoctors();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (id: string) => {
    Alert.alert('Deactivate Doctor', 'This doctor will no longer be able to log in or receive bookings.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deactivate',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(id);
          try {
            await adminService.deactivateDoctor(id);
            Alert.alert('Done', 'Doctor deactivated');
            fetchDoctors();
          } catch (error: any) {
            Alert.alert('Error', error.message);
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingScreen />;

  const renderDoctor = ({ item }: { item: AdminDoctor }) => {
    const status = item.doctorProfile?.approvalStatus || 'PENDING';
    const isPending = status === 'PENDING';
    const isApproved = status === 'APPROVED';

    return (
      <View style={[styles.card, Shadows.md]}>
        <View style={styles.cardHeader}>
          <Avatar name={item.name} size={48} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>Dr. {item.name}</Text>
            <Text style={styles.cardEmail}>{item.email}</Text>
          </View>
          <Badge label={status} variant={getStatusBadgeVariant(status)} />
        </View>

        {item.doctorProfile && (
          <View style={styles.details}>
            {item.doctorProfile.specializations?.length > 0 && (
              <View style={styles.detailRow}>
                <Ionicons name="briefcase-outline" size={14} color={Colors.primary} />
                <Text style={styles.detailText} numberOfLines={1}>
                  {item.doctorProfile.specializations.join(', ')}
                </Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Ionicons name="trending-up-outline" size={14} color={Colors.success} />
              <Text style={styles.detailText}>{item.doctorProfile.experience} yrs exp</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="cash-outline" size={14} color={Colors.warning} />
              <Text style={styles.detailText}>₹{item.doctorProfile.consultationFee}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={14} color={Colors.accent} />
              <Text style={styles.detailText}>{item._count?.doctorAppointments || 0} appointments</Text>
            </View>
          </View>
        )}

        <View style={styles.statusRow}>
          <View style={[styles.activeChip, { backgroundColor: item.isActive ? Colors.successLight : Colors.dangerLight }]}>
            <View style={[styles.activeDot, { backgroundColor: item.isActive ? Colors.success : Colors.danger }]} />
            <Text style={[styles.activeText, { color: item.isActive ? Colors.success : Colors.danger }]}>
              {item.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          {isPending && (
            <>
              <Button
                title="Approve"
                onPress={() => handleApprove(item.id)}
                variant="primary"
                size="sm"
                loading={actionLoading === item.id}
              />
              <Button
                title="Reject"
                onPress={() => setRejectModal(item.id)}
                variant="danger"
                size="sm"
              />
            </>
          )}
          {isApproved && item.isActive && (
            <Button title="Deactivate" onPress={() => handleDeactivate(item.id)} variant="danger" size="sm" />
          )}
          {!item.isActive && isApproved && (
            <Button title="Activate" onPress={() => handleActivate(item.id)} variant="secondary" size="sm" />
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Text style={styles.title}>Manage Doctors</Text>
        <Text style={styles.subtitle}>{doctors.length} doctors</Text>
      </View>

      <FlatList
        data={doctors}
        keyExtractor={(item) => item.id}
        renderItem={renderDoctor}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDoctors(); }} tintColor={Colors.primary} />
        }
        ListEmptyComponent={<EmptyState title="No Doctors" subtitle="No doctor registrations yet" />}
        showsVerticalScrollIndicator={false}
      />

      {/* Reject Modal */}
      <Modal visible={!!rejectModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Doctor</Text>
            <Text style={styles.modalSubtitle}>Provide a reason for rejection (optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Reason for rejection..."
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
  cardInfo: { flex: 1, marginLeft: Spacing.md, marginRight: Spacing.sm },
  cardName: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
  cardEmail: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, marginTop: 1 },

  details: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, fontWeight: '500' },

  statusRow: { marginTop: Spacing.md },
  activeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radii.full },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  activeText: { fontSize: Fonts.sizes.xs, fontWeight: '600' },

  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },

  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', padding: Spacing.xxl },
  modalContent: { backgroundColor: Colors.card, borderRadius: Radii.xl, padding: Spacing.xxl },
  modalTitle: { fontSize: Fonts.sizes.xl, fontWeight: '700', color: Colors.text },
  modalSubtitle: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: Spacing.xs, marginBottom: Spacing.lg },
  modalInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radii.md, padding: Spacing.md,
    fontSize: Fonts.sizes.md, color: Colors.text, minHeight: 80, textAlignVertical: 'top', marginBottom: Spacing.lg,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm },
});
