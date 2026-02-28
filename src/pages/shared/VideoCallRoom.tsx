import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Video, Shield, Users, Mic, MicOff, VideoOff, Phone } from 'lucide-react';
import { interviewAPI, authAPI } from '@/lib/api';

const VideoCallRoom = () => {
    const { meetingId } = useParams<{ meetingId: string }>();
    const navigate = useNavigate();
    const [interview, setInterview] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [callStarted, setCallStarted] = useState(false);
    const jitsiContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const { user: me } = await authAPI.getMe();
                setUser(me);

                // Find interview by meetingRoomId
                const { interviews } = await interviewAPI.getMyInterviews();
                const found = interviews.find((i: any) => i.meetingRoomId === meetingId);
                if (found) setInterview(found);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [meetingId]);

    const startCall = () => {
        setCallStarted(true);
    };

    const endCall = () => {
        setCallStarted(false);
        if (interview) {
            interviewAPI.complete(interview.id);
        }
        navigate(-1);
    };

    const jitsiUrl = `https://meet.jit.si/${meetingId}#userInfo.displayName="${encodeURIComponent(user?.firstName ? `${user.firstName} ${user.lastName}` : 'Participant')}"`;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-900/80 backdrop-blur-sm border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-purple-500/20">
                            <Video className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="font-bold text-sm">{interview?.title || 'Video Call'}</h1>
                            <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                <Shield className="w-3 h-3 text-emerald-400" />
                                End-to-end encrypted • Jitsi Meet
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {callStarted && (
                        <button
                            onClick={endCall}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors shadow-lg shadow-red-600/30"
                        >
                            <Phone className="w-4 h-4 rotate-[135deg]" />
                            End Call
                        </button>
                    )}
                </div>
            </div>

            {/* Call Area */}
            <div className="flex-1 relative">
                {!callStarted ? (
                    /* Pre-call Lobby */
                    <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[70vh] gap-8">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center space-y-4"
                        >
                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                                <Video className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold">{interview?.title || 'Interview Call'}</h2>
                            <p className="text-gray-400 text-sm max-w-md mx-auto">
                                {interview?.candidateName && interview?.employerName ? (
                                    <>Between <span className="text-white font-semibold">{interview.candidateName}</span> and <span className="text-white font-semibold">{interview.employerName}</span></>
                                ) : (
                                    'Ready to join the video call'
                                )}
                            </p>

                            <div className="flex items-center justify-center gap-6 pt-4">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Shield className="w-4 h-4 text-emerald-400" />
                                    Encrypted
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Users className="w-4 h-4 text-blue-400" />
                                    Private Room
                                </div>
                            </div>
                        </motion.div>

                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            onClick={startCall}
                            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-bold shadow-2xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-105 transition-all flex items-center gap-3"
                        >
                            <Video className="w-5 h-5" />
                            Join Call
                        </motion.button>
                    </div>
                ) : (
                    /* Jitsi Embed */
                    <iframe
                        src={jitsiUrl}
                        className="w-full h-full min-h-[calc(100vh-72px)]"
                        allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
                        style={{ border: 'none' }}
                    />
                )}
            </div>
        </div>
    );
};

export default VideoCallRoom;
