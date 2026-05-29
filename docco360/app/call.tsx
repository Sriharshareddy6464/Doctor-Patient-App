import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
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
        style={[
          styles.topBar,
          { paddingTop: insets.top + Spacing.sm, opacity: fadeIn },
        ]}
      >
        <View style={styles.connectionStatus}>
          <Animated.View
            style={[
              styles.connectionDot,
              {
                backgroundColor: isConnected ? '#10B981' : '#f59e0b',
                opacity: isConnected ? dotAnim : 1,
              },
            ]}
          />
          <Text style={styles.connectionText}>
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
        style={[
          styles.mainContent,
          { opacity: fadeIn, transform: [{ translateY: slideUp }] },
        ]}
      >
        {/* Remote User Avatar */}
        <Animated.View
          style={[
            styles.avatarOuter,
            !isConnected && { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <LinearGradient
            colors={isConnected ? ['#0058bc', '#004494'] : ['#374151', '#1f2937']}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarText}>
              {getInitials(params.remoteName || 'U')}
            </Text>
          </LinearGradient>
          {isConnected && (
            <View style={styles.avatarRing} />
          )}
        </Animated.View>

        {/* Remote User Info */}
        <Text style={styles.remoteName}>
          {params.remoteRole === 'doctor' ? 'Dr. ' : ''}
          {params.remoteName || 'Unknown'}
        </Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>
            {params.remoteRole === 'doctor' ? 'Doctor' : 'Patient'}
          </Text>
        </View>

        {/* Appointment Info */}
        <View style={styles.appointmentInfo}>
          <View style={styles.appointmentRow}>
            <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.5)" />
            <Text style={styles.appointmentText}>{params.appointmentDate}</Text>
          </View>
          <View style={styles.appointmentDot} />
          <View style={styles.appointmentRow}>
            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.5)" />
            <Text style={styles.appointmentText}>{params.appointmentTime}</Text>
          </View>
        </View>

        {/* Status Message */}
        {!isConnected && (
          <Text style={styles.statusMessage}>
            Setting up secure connection...
          </Text>
        )}
        {isConnected && elapsed < 5 && (
          <Text style={styles.statusMessage}>
            Call connected successfully
          </Text>
        )}
      </Animated.View>

      {/* Bottom Controls */}
      <Animated.View
        style={[
          styles.controlsContainer,
          { paddingBottom: insets.bottom + Spacing.xl, opacity: fadeIn },
        ]}
      >
        {/* Channel info (subtle) */}
        <Text style={styles.channelInfo}>
          Channel: {params.channelName}
        </Text>

        <View style={styles.controls}>
          {/* Mute Button */}
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={() => setIsMuted(!isMuted)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={24}
              color={isMuted ? Colors.danger : '#fff'}
            />
            <Text style={[styles.controlLabel, isMuted && styles.controlLabelActive]}>
              {isMuted ? 'Unmute' : 'Mute'}
            </Text>
          </TouchableOpacity>

          {/* End Call Button */}
          <TouchableOpacity
            style={styles.endCallButton}
            onPress={confirmEndCall}
            activeOpacity={0.7}
            disabled={isEnding}
          >
            <LinearGradient
              colors={['#ef4444', '#dc2626']}
              style={styles.endCallGradient}
            >
              <Ionicons name="call" size={28} color="#fff" style={styles.endCallIcon} />
            </LinearGradient>
            <Text style={styles.endCallLabel}>End</Text>
          </TouchableOpacity>

          {/* Speaker Button */}
          <TouchableOpacity
            style={[styles.controlButton, !isSpeaker && styles.controlButtonActive]}
            onPress={() => setIsSpeaker(!isSpeaker)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isSpeaker ? 'volume-high' : 'volume-mute'}
              size={24}
              color={!isSpeaker ? Colors.danger : '#fff'}
            />
            <Text style={[styles.controlLabel, !isSpeaker && styles.controlLabelActive]}>
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

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radii.full,
  },
  timerText: {
    color: '#fff',
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // Main content
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },

  // Avatar
  avatarOuter: {
    marginBottom: Spacing.xl,
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
  avatarRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 64,
    borderWidth: 2,
    borderColor: 'rgba(0, 88, 188, 0.4)',
  },

  // Remote user info
  remoteName: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '700',
    color: '#fff',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  roleBadge: {
    backgroundColor: 'rgba(0, 88, 188, 0.25)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
    marginBottom: Spacing.lg,
  },
  roleBadgeText: {
    color: '#adc6ff',
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Appointment info
  appointmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  appointmentText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
  },
  appointmentDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  // Status
  statusMessage: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: Fonts.sizes.sm,
    fontWeight: '400',
  },

  // Controls
  controlsContainer: {
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  channelInfo: {
    color: 'rgba(255,255,255,0.15)',
    fontSize: Fonts.sizes.xs,
    marginBottom: Spacing.xl,
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xxl + Spacing.md,
  },

  controlButton: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  controlButtonActive: {
    opacity: 1,
  },
  controlLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: Fonts.sizes.xs,
    fontWeight: '500',
  },
  controlLabelActive: {
    color: Colors.danger,
  },

  // End call
  endCallButton: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  endCallGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallIcon: {
    transform: [{ rotate: '135deg' }],
  },
  endCallLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: Fonts.sizes.xs,
    fontWeight: '500',
  },
});
