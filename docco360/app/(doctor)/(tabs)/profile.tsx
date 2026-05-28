import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { doctorService, DoctorWithProfile } from '@/services/doctor';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Avatar } from '@/components/Avatar';
import { Badge, getStatusBadgeVariant } from '@/components/Badge';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Colors, Fonts, Spacing, Radii, Shadows } from '@/constants/theme';

export default function DoctorProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [profileData, setProfileData] = useState<DoctorWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [specializations, setSpecializations] = useState('');
  const [experience, setExperience] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [bio, setBio] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTo, setAvailableTo] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const data = await doctorService.getProfile();
      setProfileData(data);
      if (data.profile) {
        setSpecializations(data.profile.specializations?.join(', ') || '');
        setExperience(data.profile.experience?.toString() || '');
        setQualifications(data.profile.qualifications?.join(', ') || '');
        setBio(data.profile.bio || '');
        setConsultationFee(data.profile.consultationFee?.toString() || '');
        setAvailableFrom(data.profile.availableFrom || '');
        setAvailableTo(data.profile.availableTo || '');
        setLicenseNumber(data.profile.licenseNumber || '');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await doctorService.updateProfile({
        specializations: specializations
          ? specializations.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        experience: experience ? parseInt(experience) : 0,
        qualifications: qualifications
          ? qualifications.split(',').map((q) => q.trim()).filter(Boolean)
          : [],
        bio: bio || null,
        consultationFee: consultationFee ? parseFloat(consultationFee) : null,
        availableFrom: availableFrom || null,
        availableTo: availableTo || null,
        licenseNumber: licenseNumber || null,
      });
      setEditing(false);
      fetchProfile();
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) return <LoadingScreen />;

  const approvalStatus = profileData?.profile?.approvalStatus || 'PENDING';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Avatar name={user?.name || 'D'} size={72} />
        <Text style={styles.name}>Dr. {user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Badge
          label={approvalStatus}
          variant={getStatusBadgeVariant(approvalStatus)}
          style={{ marginTop: Spacing.sm }}
        />
        {profileData?.profile?.rejectionReason && (
          <View style={styles.rejectionBanner}>
            <Ionicons name="warning" size={16} color={Colors.danger} />
            <Text style={styles.rejectionText}>{profileData.profile.rejectionReason}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.actionsRow}>
          {!editing ? (
            <Button
              title="Edit Profile"
              onPress={() => setEditing(true)}
              variant="secondary"
              icon={<Ionicons name="create-outline" size={18} color={Colors.primary} />}
              size="sm"
            />
          ) : (
            <Button title="Cancel" onPress={() => { setEditing(false); fetchProfile(); }} variant="ghost" size="sm" />
          )}
        </View>

        <View style={[styles.card, Shadows.md]}>
          <Text style={styles.sectionTitle}>Professional Details</Text>

          <Input
            label="Specializations"
            placeholder="e.g. Cardiology, Neurology"
            icon="briefcase-outline"
            value={specializations}
            onChangeText={setSpecializations}
            editable={editing}
          />
          <Input
            label="Experience (years)"
            placeholder="e.g. 5"
            icon="trending-up-outline"
            keyboardType="numeric"
            value={experience}
            onChangeText={setExperience}
            editable={editing}
          />
          <Input
            label="Qualifications"
            placeholder="e.g. MBBS, MD Cardiology"
            icon="school-outline"
            value={qualifications}
            onChangeText={setQualifications}
            editable={editing}
          />
          <Input
            label="Bio"
            placeholder="Tell patients about yourself..."
            icon="document-text-outline"
            value={bio}
            onChangeText={setBio}
            editable={editing}
            multiline
            numberOfLines={4}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />
        </View>

        <View style={[styles.card, Shadows.md]}>
          <Text style={styles.sectionTitle}>Consultation Settings</Text>

          <Input
            label="Consultation Fee (₹)"
            placeholder="e.g. 500"
            icon="cash-outline"
            keyboardType="numeric"
            value={consultationFee}
            onChangeText={setConsultationFee}
            editable={editing}
          />
          <Input
            label="Available From (HH:mm)"
            placeholder="e.g. 09:00"
            icon="time-outline"
            value={availableFrom}
            onChangeText={setAvailableFrom}
            editable={editing}
          />
          <Input
            label="Available To (HH:mm)"
            placeholder="e.g. 17:00"
            icon="time-outline"
            value={availableTo}
            onChangeText={setAvailableTo}
            editable={editing}
          />
        </View>

        <View style={[styles.card, Shadows.md]}>
          <Text style={styles.sectionTitle}>Practice License</Text>
          <Input
            label="License / Registration Number"
            placeholder="e.g. MCI-1234567"
            icon="card-outline"
            value={licenseNumber}
            onChangeText={setLicenseNumber}
            editable={editing}
            autoCapitalize="characters"
          />
        </View>

        {editing && (
          <Button title="Save Changes" onPress={handleSave} loading={saving} fullWidth size="lg" />
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    alignItems: 'center', paddingBottom: Spacing.xxl,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  name: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.text, marginTop: Spacing.md },
  email: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
  rejectionBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginTop: Spacing.md, marginHorizontal: Spacing.xxl, padding: Spacing.md,
    backgroundColor: Colors.dangerLight, borderRadius: Radii.md,
  },
  rejectionText: { fontSize: Fonts.sizes.sm, color: Colors.danger, flex: 1 },
  content: { padding: Spacing.xl },
  actionsRow: { flexDirection: 'row', marginBottom: Spacing.lg },
  card: { backgroundColor: Colors.card, borderRadius: Radii.lg, padding: Spacing.xl, marginBottom: Spacing.lg },
  sectionTitle: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.lg },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, marginTop: Spacing.xxl, paddingVertical: Spacing.lg,
  },
  logoutText: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.danger },
});
