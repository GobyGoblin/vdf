import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Plus, Trash2, Video, FileText, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeSlot {
    date: string;
    time: string;
    duration: number;
}

interface InterviewSchedulerProps {
    isOpen: boolean;
    onClose: () => void;
    onSchedule: (data: { title: string; proposedTimes: { datetime: string; duration: number }[]; notes?: string }) => void;
    candidateName: string;
    loading?: boolean;
}

const InterviewScheduler = ({ isOpen, onClose, onSchedule, candidateName, loading }: InterviewSchedulerProps) => {
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [slots, setSlots] = useState<TimeSlot[]>([
        { date: '', time: '', duration: 30 }
    ]);

    const addSlot = () => {
        if (slots.length < 3) {
            setSlots([...slots, { date: '', time: '', duration: 30 }]);
        }
    };

    const removeSlot = (index: number) => {
        if (slots.length > 1) {
            setSlots(slots.filter((_, i) => i !== index));
        }
    };

    const updateSlot = (index: number, field: keyof TimeSlot, value: string | number) => {
        const updated = [...slots];
        updated[index] = { ...updated[index], [field]: value };
        setSlots(updated);
    };

    const handleSubmit = () => {
        const valid = slots.filter(s => s.date && s.time);
        if (!title.trim() || valid.length === 0) return;

        onSchedule({
            title: title.trim(),
            proposedTimes: valid.map(s => ({
                datetime: new Date(`${s.date}T${s.time}`).toISOString(),
                duration: s.duration
            })),
            notes: notes.trim() || undefined
        });

        // Reset
        setTitle('');
        setNotes('');
        setSlots([{ date: '', time: '', duration: 30 }]);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="bg-white rounded-3xl shadow-2xl border border-border/50 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-8 pt-8 pb-4 border-b border-border/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-200/50">
                                    <Video className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">Schedule Interview</h2>
                                    <p className="text-sm text-muted-foreground">with <span className="font-semibold text-foreground">{candidateName}</span></p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl hover:bg-secondary transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-8 py-6 space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">
                                Interview Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Technical Screening, Culture Fit Interview"
                                className="w-full px-4 py-3 rounded-xl border border-border/50 bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/50 text-sm transition-all"
                            />
                        </div>

                        {/* Time Slots */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gold" />
                                    Proposed Time Slots
                                </label>
                                <span className="text-xs text-muted-foreground">{slots.length}/3 slots</span>
                            </div>

                            <div className="space-y-3">
                                {slots.map((slot, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2 p-3 rounded-xl bg-secondary/30 border border-border/30"
                                    >
                                        <div className="flex-1 grid grid-cols-3 gap-2">
                                            <input
                                                type="date"
                                                value={slot.date}
                                                onChange={e => updateSlot(index, 'date', e.target.value)}
                                                className="px-3 py-2 rounded-lg border border-border/50 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                                            />
                                            <input
                                                type="time"
                                                value={slot.time}
                                                onChange={e => updateSlot(index, 'time', e.target.value)}
                                                className="px-3 py-2 rounded-lg border border-border/50 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                                            />
                                            <select
                                                value={slot.duration}
                                                onChange={e => updateSlot(index, 'duration', parseInt(e.target.value))}
                                                className="px-3 py-2 rounded-lg border border-border/50 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                                            >
                                                <option value={15}>15 min</option>
                                                <option value={30}>30 min</option>
                                                <option value={45}>45 min</option>
                                                <option value={60}>60 min</option>
                                            </select>
                                        </div>
                                        {slots.length > 1 && (
                                            <button
                                                onClick={() => removeSlot(index)}
                                                className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {slots.length < 3 && (
                                <button
                                    onClick={addSlot}
                                    className="mt-3 flex items-center gap-2 text-sm text-gold font-medium hover:text-gold/80 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add another time slot
                                </button>
                            )}
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gold" />
                                Notes (optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Add preparation instructions, topics to discuss, etc..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-border/50 bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/50 text-sm resize-none transition-all"
                            />
                        </div>

                        {/* Jitsi Info */}
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
                            <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-blue-900">Secure Video Call</p>
                                <p className="text-xs text-blue-700 mt-0.5">A private Jitsi Meet room will be automatically created. Both parties can join with one click — no downloads required.</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 pb-8 pt-2 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl border border-border/50 text-sm font-semibold text-muted-foreground hover:bg-secondary transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !title.trim() || !slots.some(s => s.date && s.time)}
                            className={cn(
                                "flex-1 px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                                loading || !title.trim() || !slots.some(s => s.date && s.time)
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-gold to-amber-500 text-white shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30 hover:scale-[1.02]"
                            )}
                        >
                            {loading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                />
                            ) : (
                                <>
                                    <Video className="w-4 h-4" />
                                    Send Invitation
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InterviewScheduler;
