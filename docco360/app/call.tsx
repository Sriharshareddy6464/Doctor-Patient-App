import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
  StyleSheet
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { patientService } from '@/services/patient';
import { doctorService } from '@/services/doctor';
import { Colors, Fonts, Spacing, Radii } from '@/constants/theme';

type CallParams = {
  appointmentId: string;
  channelName: string;
  token: string;
  appId: string;
  uid: string;
  role: string; // 'patient' | 'doctor'
  remoteName: string;
  remoteRole: string;
  appointmentDate: string;
  appointmentTime: string;
};

export default function CallScreen() {
  const params = useLocalSearchParams<CallParams>();
  const insets = useSafeAreaInsets();
  const [elapsed, setElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  // Simulate connection after a short delay
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const connectTimer = setTimeout(() => {
      setIsConnected(true);
    }, 1500);

    return () => clearTimeout(connectTimer);
  }, []);

  // Pulse animation for connecting state
  useEffect(() => {
    if (!isConnected) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isConnected]);

  // Connected dot blink
  useEffect(() => {
    if (isConnected) {
      const blink = Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      blink.start();
      return () => blink.stop();
    }
  }, [isConnected]);

  // Call timer
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEndCall = async () => {
    setIsEnding(true);
    try {
      if (params.role === 'patient') {
        await patientService.endCall(params.appointmentId);
      } else {
        await doctorService.endCall(params.appointmentId);
      }
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to end call');
      setIsEnding(false);
    }
  };

  const confirmEndCall = () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end this consultation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Call', style: 'destructive', onPress: handleEndCall },
      ],
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a1628', '#0d2137', '#0a1628']}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Bar */}
      <Animated.View
        style={[styles.topBar, { paddingTop: insets.top + 12, opacity: fadeIn }]}
      >
        <View style={styles.statusRow}>
          <Animated.View
            style={[
              styles.statusDot,
              {
                backgroundColor: isConnected ? Colors.success : Colors.warning,
                opacity: isConnected ? dotAnim : 1,
              }
            ]}
          />
          <Text style={styles.statusText}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </Text>
        </View>

        {isConnected && (
          <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
          </View>
        )}
      </Animated.View>

      {/* Main Content */}
      <Animated.View
        style={[styles.mainContent, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}
      >
        {/* Remote User Avatar */}
        <Animated.View
          style={[styles.avatarWrapper, !isConnected ? { transform: [{ scale: pulseAnim }] } : {}]}
        >
          <LinearGradient
            colors={isConnected ? [Colors.primary, Colors.primaryDark] : ['#374151', '#1f2937']}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarText}>
              {getInitials(params.remoteName || 'U')}
            </Text>
          </LinearGradient>
          {isConnected && (
            <View style={styles.avatarBorder} />
          )}
        </Animated.View>

        {/* Remote User Info */}
        <Text style={styles.remoteName}>
          {params.remoteRole === 'doctor' ? 'Dr. ' : ''}
          {params.remoteName || 'Unknown'}
        </Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {params.remoteRole === 'doctor' ? 'Doctor' : 'Patient'}
          </Text>
        </View>

        {/* Appointment Info */}
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.5)" />
            <Text style={styles.infoText}>{params.appointmentDate}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoCol}>
            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.5)" />
            <Text style={styles.infoText}>{params.appointmentTime}</Text>
          </View>
        </View>

        {/* Status Message */}
        {!isConnected && (
          <Text style={styles.connectionText}>
            Setting up secure connection...
          </Text>
        )}
        {isConnected && elapsed < 5 && (
          <Text style={styles.connectionText}>
            Call connected successfully
          </Text>
        )}
      </Animated.View>

      {/* Bottom Controls */}
      <Animated.View
        style={[styles.bottomControls, { paddingBottom: insets.bottom + 24, opacity: fadeIn }]}
      >
        {/* Channel info (subtle) */}
        <Text style={styles.channelText}>
          Channel: {params.channelName}
        </Text>

        <View style={styles.controlRow}>
          {/* Mute Button */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setIsMuted(!isMuted)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={24}
              color={isMuted ? Colors.danger : '#fff'}
            />
            <Text style={[styles.controlText, isMuted ? styles.controlTextMuted : styles.controlTextNormal]}>
              {isMuted ? 'Unmute' : 'Mute'}
            </Text>
          </TouchableOpacity>

          {/* End Call Button */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={confirmEndCall}
            activeOpacity={0.7}
            disabled={isEnding}
          >
            <LinearGradient
              colors={['#ef4444', '#dc2626']}
              style={styles.endCallButton}
            >
              <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
            </LinearGradient>
            <Text style={styles.controlTextNormal}>End</Text>
          </TouchableOpacity>

          {/* Speaker Button */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setIsSpeaker(!isSpeaker)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isSpeaker ? 'volume-high' : 'volume-mute'}
              size={24}
              color={!isSpeaker ? Colors.danger : '#fff'}
            />
            <Text style={[styles.controlText, !isSpeaker ? styles.controlTextMuted : styles.controlTextNormal]}>
              {isSpeaker ? 'Speaker' : 'Muted'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    borderRadius: Radii.full,
  },
  timerText: {
    color: '#fff',
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  avatarWrapper: {
    marginBottom: Spacing.xxl,
    position: 'relative',
  },
  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  avatarBorder: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 64,
    borderWidth: 2,
    borderColor: Colors.primary + '40',
  },
  remoteName: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  roleBadge: {
    backgroundColor: Colors.primaryFaded + '30',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 4,
    borderRadius: Radii.full,
    marginBottom: Spacing.xl,
  },
  roleText: {
    color: Colors.primary,
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  infoCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  infoText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
  },
  infoDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  connectionText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: Fonts.sizes.sm,
    fontWeight: '400',
  },
  bottomControls: {
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  channelText: {
    color: 'rgba(255,255,255,0.15)',
    fontSize: Fonts.sizes.xs,
    marginBottom: Spacing.xxl,
    fontVariant: ['tabular-nums'],
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  controlButton: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  controlText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '500',
  },
  controlTextNormal: {
    color: 'rgba(255,255,255,0.6)',
  },
  controlTextMuted: {
    color: Colors.danger,
  },
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

