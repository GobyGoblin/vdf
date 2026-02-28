import { motion } from 'framer-motion';
import { Video, Calendar, Clock, CheckCircle2, XCircle, User, Building2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InterviewMeeting } from '@/lib/api';

interface InterviewCardProps {
    interview: InterviewMeeting & {
        candidateName?: string;
        employerName?: string;
        candidateAvatar?: string;
    };
    currentUserRole: 'employer' | 'candidate' | 'staff';
    onAcceptSlot?: (interviewId: string, slotId: string) => void;
    onCancel?: (interviewId: string) => void;
    onComplete?: (interviewId: string) => void;
    onJoinCall?: (meetingRoomId: string) => void;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Awaiting Response', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    confirmed: { label: 'Confirmed', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    completed: { label: 'Completed', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    cancelled: { label: 'Cancelled', color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
};

const InterviewCard = ({ interview, currentUserRole, onAcceptSlot, onCancel, onComplete, onJoinCall }: InterviewCardProps) => {
    const config = statusConfig[interview.status] || statusConfig.pending;

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const canAcceptSlots = interview.status === 'pending' && currentUserRole === 'candidate';
    const canJoinCall = interview.status === 'confirmed';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
        >
            {/* Header */}
            <div className="px-6 py-4 border-b border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10">
                        <Video className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground text-sm">{interview.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {currentUserRole === 'candidate' ? (
                                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {interview.employerName}</span>
                            ) : (
                                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {interview.candidateName}</span>
                            )}
                        </p>
                    </div>
                </div>
                <span className={cn("text-[11px] font-bold px-3 py-1 rounded-full border", config.bg, config.color)}>
                    {config.label}
                </span>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-3">
                {/* Confirmed Time */}
                {interview.confirmedTime && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-emerald-800">{formatDate(interview.confirmedTime)}</p>
                            <p className="text-xs text-emerald-600">{formatTime(interview.confirmedTime)}</p>
                        </div>
                    </div>
                )}

                {/* Proposed Time Slots */}
                {interview.status === 'pending' && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Proposed Times</p>
                        {interview.proposedTimes.map(slot => (
                            <div
                                key={slot.id}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-xl border transition-all",
                                    slot.accepted
                                        ? "bg-emerald-50 border-emerald-200"
                                        : "bg-secondary/30 border-border/30"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{formatDate(slot.datetime)}</span>
                                    <span className="text-sm text-muted-foreground">{formatTime(slot.datetime)}</span>
                                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
                                        {slot.duration}min
                                    </span>
                                </div>
                                {canAcceptSlots && !slot.accepted && (
                                    <button
                                        onClick={() => onAcceptSlot?.(interview.id, slot.id)}
                                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-gold to-amber-500 text-white text-xs font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all"
                                    >
                                        Accept
                                    </button>
                                )}
                                {slot.accepted && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Notes */}
                {interview.notes && (
                    <div className="p-3 rounded-xl bg-secondary/30 border border-border/20">
                        <p className="text-xs text-muted-foreground">{interview.notes}</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-border/30 flex gap-2">
                {canJoinCall && (
                    <button
                        onClick={() => onJoinCall?.(interview.meetingRoomId)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold shadow-lg shadow-purple-500/20 hover:shadow-xl hover:scale-[1.02] transition-all"
                    >
                        <Video className="w-4 h-4" />
                        Join Video Call
                    </button>
                )}
                {interview.status === 'confirmed' && currentUserRole === 'employer' && (
                    <button
                        onClick={() => onComplete?.(interview.id)}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Completed
                    </button>
                )}
                {(interview.status === 'pending' || interview.status === 'confirmed') && (
                    <button
                        onClick={() => onCancel?.(interview.id)}
                        className="px-4 py-2.5 rounded-xl border border-border/50 text-sm font-medium text-muted-foreground hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default InterviewCard;
