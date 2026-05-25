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
import { patientService, PatientWithProfile } from '@/services/patient';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Avatar } from '@/components/Avatar';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Colors, Fonts, Spacing, Radii, Shadows } from '@/constants/theme';

export default function PatientProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [profileData, setProfileData] = useState<PatientWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Form state
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [address, setAddress] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const data = await patientService.getProfile();
      setProfileData(data);
      if (data.profile) {
        setPhone(data.profile.phone || '');
        setGender((data.profile.gender as any) || '');
        setBloodGroup(data.profile.bloodGroup || '');
        setAddress(data.profile.address || '');
        setAllergies(data.profile.allergies?.join(', ') || '');
        setMedicalHistory(data.profile.medicalHistory || '');
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
      await patientService.updateProfile({
        phone: phone || null,
        gender: gender ? (gender as 'MALE' | 'FEMALE' | 'OTHER') : null,
        bloodGroup: bloodGroup || null,
        address: address || null,
        allergies: allergies
          ? allergies.split(',').map((a) => a.trim()).filter(Boolean)
          : [],
        medicalHistory: medicalHistory || null,
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

  const genderOptions: Array<'MALE' | 'FEMALE' | 'OTHER'> = ['MALE', 'FEMALE', 'OTHER'];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Avatar name={user?.name || 'U'} size={72} />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Patient</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Actions */}
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
            <Button
              title="Cancel"
              onPress={() => {
                setEditing(false);
                fetchProfile();
              }}
              variant="ghost"
              size="sm"
            />
          )}
        </View>

        {/* Profile Fields */}
        <View style={[styles.card, Shadows.md]}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <Input
            label="Phone"
            placeholder="Enter phone number"
            icon="call-outline"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            editable={editing}
          />

          <Text style={styles.fieldLabel}>Gender</Text>
          <View style={styles.genderRow}>
            {genderOptions.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.genderOption, gender === g && styles.genderActive]}
                onPress={() => editing && setGender(g)}
                disabled={!editing}
              >
                <Text
                  style={[styles.genderText, gender === g && styles.genderTextActive]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Blood Group"
            placeholder="e.g. A+, B-, O+"
            icon="water-outline"
            value={bloodGroup}
            onChangeText={setBloodGroup}
            editable={editing}
          />

          <Input
            label="Address"
            placeholder="Enter your address"
            icon="location-outline"
            value={address}
            onChangeText={setAddress}
            editable={editing}
            multiline
          />
        </View>

        <View style={[styles.card, Shadows.md]}>
          <Text style={styles.sectionTitle}>Medical Information</Text>

          <Input
            label="Allergies"
            placeholder="Comma separated (e.g. Peanuts, Penicillin)"
            icon="alert-circle-outline"
            value={allergies}
            onChangeText={setAllergies}
            editable={editing}
          />

          <Input
            label="Medical History"
            placeholder="Any relevant medical history"
            icon="document-text-outline"
            value={medicalHistory}
            onChangeText={setMedicalHistory}
            editable={editing}
            multiline
            numberOfLines={4}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />
        </View>

        {editing && (
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={saving}
            fullWidth
            size="lg"
          />
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
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    paddingBottom: Spacing.xxl,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  name: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '800',
    color: Colors.text,
    marginTop: Spacing.md,
  },
  email: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.primaryFaded,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
  },
  roleText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  content: {
    padding: Spacing.xl,
  },
  actionsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  genderOption: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radii.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  genderActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  genderTextActive: {
    color: Colors.textInverse,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xxl,
    paddingVertical: Spacing.lg,
  },
  logoutText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.danger,
  },
});
