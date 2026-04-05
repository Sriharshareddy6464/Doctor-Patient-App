import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgoraRTC, {
  type IAgoraRTCClient,
  type ILocalVideoTrack,
  type ILocalAudioTrack,
  type IAgoraRTCRemoteUser,
} from 'agora-rtc-sdk-ng';
import { api } from '../../services/api';
import { type CallTokenResponse } from '../../types/appointment';
import { Mic, MicOff, Video, VideoOff, PhoneOff, User, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';

AgoraRTC.setLogLevel(4); // suppress verbose logs

interface VideoCallProps {
  role: 'patient' | 'doctor';
}

const VideoCall = ({ role }: VideoCallProps) => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoTrackRef = useRef<ILocalVideoTrack | null>(null);
  const localAudioTrackRef = useRef<ILocalAudioTrack | null>(null);

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  const [callInfo, setCallInfo] = useState<CallTokenResponse | null>(null);
  const [isJoining, setIsJoining] = useState(true);
  const [isEnding, setIsEnding] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [remoteUser, setRemoteUser] = useState<IAgoraRTCRemoteUser | null>(null);
  // Signals that local tracks are ready — triggers the play useEffect after DOM renders
  const [localTrackReady, setLocalTrackReady] = useState(false);

  const appointmentsPath = role === 'doctor' ? '/doctor-dashboard/appointments' : '/patient-dashboard/appointments';

  useEffect(() => {
    let cancelled = false;

    const doJoin = async () => {
      if (!appointmentId) return;
      try {
        const endpoint =
          role === 'doctor'
            ? `/doctor/appointments/${appointmentId}/join`
            : `/patient/appointments/${appointmentId}/join`;

        const res = await api.get(endpoint);
        if (!res.data.success) throw new Error('Failed to get call token');
        if (cancelled) return;

        const data: CallTokenResponse = res.data.data;
        setCallInfo(data);

        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        // Remote user joined — update state so React renders the remote slot,
        // then the useEffect below plays the track into the now-visible div.
        client.on('user-published', async (remUser, mediaType) => {
          await client.subscribe(remUser, mediaType);
          if (cancelled) return;
          if (mediaType === 'video') {
            setRemoteUser(remUser); // triggers useEffect to play remote video
          }
          if (mediaType === 'audio') {
            remUser.audioTrack?.play();
          }
        });

        client.on('user-unpublished', (_remUser, mediaType) => {
          if (mediaType === 'video' && !cancelled) setRemoteUser(null);
        });

        client.on('user-left', () => {
          if (!cancelled) setRemoteUser(null);
        });

        await client.join(data.appId, data.channelName, data.token, data.uid);
        if (cancelled) { await client.leave(); return; }

        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        if (cancelled) {
          audioTrack.stop(); audioTrack.close();
          videoTrack.stop(); videoTrack.close();
          await client.leave();
          return;
        }

        localAudioTrackRef.current = audioTrack;
        localVideoTrackRef.current = videoTrack;
        await client.publish([audioTrack, videoTrack]);

        // Show the video UI and signal track readiness in the same render batch.
        // The useEffect below runs after React paints the DOM, at which point
        // localVideoRef.current is guaranteed to exist.
        setIsJoining(false);
        setLocalTrackReady(true);
      } catch (err: unknown) {
        if (!cancelled) {
          console.error('Failed to join call:', err);
          const e = err as { response?: { data?: { message?: string } }; message?: string };
          setError(e.response?.data?.message || e.message || 'Failed to join the call.');
          setIsJoining(false);
        }
      }
    };

    doJoin();

    return () => {
      cancelled = true;
      localVideoTrackRef.current?.stop();
      localVideoTrackRef.current?.close();
      localVideoTrackRef.current = null;
      localAudioTrackRef.current?.stop();
      localAudioTrackRef.current?.close();
      localAudioTrackRef.current = null;
      void clientRef.current?.leave();
      clientRef.current = null;
    };
  }, [appointmentId, role]);

  // Play local video after React has painted the video UI into the DOM.
  // This runs after isJoining → false and localTrackReady → true are flushed
  // in the same render, so localVideoRef.current is guaranteed to be non-null.
  useEffect(() => {
    if (localTrackReady && localVideoRef.current && localVideoTrackRef.current) {
      localVideoTrackRef.current.play(localVideoRef.current);
    }
  }, [localTrackReady]);

  // Play remote video whenever the remote user state updates.
  // The remoteVideoRef div is always in the DOM once isJoining is false,
  // so the ref is reliable here.
  useEffect(() => {
    if (remoteUser?.videoTrack && remoteVideoRef.current) {
      remoteUser.videoTrack.play(remoteVideoRef.current);
    }
  }, [remoteUser]);

  const toggleMic = async () => {
    if (localAudioTrackRef.current) {
      await localAudioTrackRef.current.setEnabled(!isMicOn);
      setIsMicOn(prev => !prev);
    }
  };

  const toggleCam = async () => {
    if (localVideoTrackRef.current) {
      await localVideoTrackRef.current.setEnabled(!isCamOn);
      setIsCamOn(prev => !prev);
    }
  };

  const cleanup = async () => {
    localVideoTrackRef.current?.stop();
    localVideoTrackRef.current?.close();
    localVideoTrackRef.current = null;
    localAudioTrackRef.current?.stop();
    localAudioTrackRef.current?.close();
    localAudioTrackRef.current = null;
    await clientRef.current?.leave();
    clientRef.current = null;
  };

  // Leave temporarily — does NOT mark the appointment as completed.
  // The other party stays in the call; this user can rejoin from appointments list.
  const leaveCall = async () => {
    await cleanup();
    navigate(appointmentsPath);
  };

  // End consultation — marks appointment as COMPLETED on the backend.
  // The join button will disappear for both parties after this.
  const endConsultation = async () => {
    setIsEnding(true);
    setShowEndConfirm(false);
    try {
      const endpoint =
        role === 'doctor'
          ? `/doctor/appointments/${appointmentId}/end`
          : `/patient/appointments/${appointmentId}/end`;
      await api.patch(endpoint);
    } catch (err) {
      console.error('Error ending consultation:', err);
    } finally {
      await cleanup();
      navigate(appointmentsPath);
    }
  };

  // ── Error / Loading states ──
  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-zinc-900 rounded-3xl p-10 text-center max-w-md border border-zinc-800">
          <div className="h-16 w-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <PhoneOff className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-white font-extrabold text-xl mb-2">Unable to Join Call</h2>
          <p className="text-zinc-400 text-sm mb-6">{error}</p>
          <Button
            onClick={() => navigate(appointmentsPath)}
            className="bg-primary hover:bg-orange-600 font-bold rounded-xl"
          >
            Back to Appointments
          </Button>
        </div>
      </div>
    );
  }

  if (isJoining) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Loader className="h-10 w-10 text-primary animate-spin" />
          </div>
          <p className="text-zinc-400 font-semibold">Connecting to call...</p>
        </div>
      </div>
    );
  }

  const peerName = role === 'doctor'
    ? callInfo?.appointment?.patient?.name
    : callInfo?.appointment?.doctor?.name;

  const peerLabel = role === 'doctor' ? 'Patient' : 'Dr.';

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div>
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Consultation</p>
          <p className="text-white font-extrabold text-lg">
            {peerLabel} {peerName ?? '...'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-zinc-500 text-xs font-medium">
            {callInfo?.appointment?.date} • {callInfo?.appointment?.startTime}–{callInfo?.appointment?.endTime}
          </p>
          <div className="flex items-center justify-end gap-2 mt-1">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs font-semibold">Live</span>
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative p-4 overflow-hidden">
        {/* Remote video (large) */}
        <div
          ref={remoteVideoRef}
          className="w-full h-full rounded-2xl bg-zinc-900 overflow-hidden flex items-center justify-center"
          style={{ minHeight: '400px' }}
        >
          {!remoteUser && (
            <div className="text-center space-y-3">
              <div className="h-20 w-20 rounded-full bg-zinc-800 flex items-center justify-center mx-auto">
                <User size={36} className="text-zinc-500" />
              </div>
              <p className="text-zinc-500 font-semibold">
                Waiting for {peerLabel} {peerName}...
              </p>
            </div>
          )}
        </div>

        {/* Local video (picture-in-picture) */}
        <div
          ref={localVideoRef}
          className="absolute bottom-8 right-8 w-40 h-28 rounded-2xl bg-zinc-800 overflow-hidden border-2 border-zinc-700 shadow-2xl"
        >
          {!isCamOn && (
            <div className="w-full h-full flex items-center justify-center">
              <VideoOff size={20} className="text-zinc-500" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-6 border-t border-zinc-800 px-6">
        <button
          onClick={toggleMic}
          className={`h-14 w-14 rounded-full flex items-center justify-center transition-all ${
            isMicOn
              ? 'bg-zinc-800 text-white hover:bg-zinc-700'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
          title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isMicOn ? <Mic size={22} /> : <MicOff size={22} />}
        </button>

        <button
          onClick={toggleCam}
          className={`h-14 w-14 rounded-full flex items-center justify-center transition-all ${
            isCamOn
              ? 'bg-zinc-800 text-white hover:bg-zinc-700'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
          title={isCamOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isCamOn ? <Video size={22} /> : <VideoOff size={22} />}
        </button>

        <button
          onClick={() => setShowEndConfirm(true)}
          disabled={isEnding}
          className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all disabled:opacity-60"
          title="Leave / End call"
        >
          {isEnding ? (
            <Loader size={22} className="animate-spin" />
          ) : (
            <PhoneOff size={22} />
          )}
        </button>
      </div>

      {/* Leave / End confirmation overlay */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl p-8 max-w-sm w-full border border-zinc-700 text-center space-y-5">
            <div className="h-14 w-14 bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
              <PhoneOff className="h-7 w-7 text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-extrabold text-lg">Leave Consultation?</h3>
              <p className="text-zinc-400 text-sm mt-1">
                You can rejoin from your appointments list if you leave temporarily.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={leaveCall}
                className="w-full py-3 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white font-bold transition-all"
              >
                Leave Temporarily
              </button>
              <button
                onClick={endConsultation}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all"
              >
                End Consultation
              </button>
              <button
                onClick={() => setShowEndConfirm(false)}
                className="w-full py-3 rounded-xl bg-transparent text-zinc-400 hover:text-white font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
