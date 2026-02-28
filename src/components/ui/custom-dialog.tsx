import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle2, Info, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    type?: 'info' | 'success' | 'warning' | 'error' | 'confirm';
    onConfirm?: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
}

export const CustomDialog = ({
    isOpen,
    onClose,
    title,
    description,
    type = 'info',
    onConfirm,
    confirmLabel = 'Understand',
    cancelLabel = 'Cancel'
}: CustomDialogProps) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-10 h-10 text-success" />;
            case 'error': return <AlertCircle className="w-10 h-10 text-destructive" />;
            case 'warning': return <AlertCircle className="w-10 h-10 text-warning" />;
            case 'confirm': return <HelpCircle className="w-10 h-10 text-gold" />;
            default: return <Info className="w-10 h-10 text-gold" />;
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md overflow-hidden rounded-3xl bg-background shadow-2xl border border-border"
                >
                    {/* Decorative Gradient Top */}
                    <div className={cn(
                        "h-2 w-full",
                        type === 'success' ? "bg-success" :
                            type === 'error' ? "bg-destructive" :
                                type === 'warning' ? "bg-warning" : "bg-gold"
                    )} />

                    <div className="p-8">
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-6 p-2 rounded-full hover:bg-secondary transition-colors"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>

                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className={cn(
                                "w-20 h-20 rounded-2xl flex items-center justify-center mb-2",
                                type === 'success' ? "bg-success/10" :
                                    type === 'error' ? "bg-destructive/10" :
                                        type === 'warning' ? "bg-warning/10" : "bg-gold/10"
                            )}>
                                {getIcon()}
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-display font-bold text-foreground">
                                    {title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {description}
                                </p>
                            </div>

                            <div className="flex gap-3 w-full pt-6">
                                {type === 'confirm' && (
                                    <button
                                        onClick={onClose}
                                        className="flex-1 px-6 py-3 rounded-xl border border-border font-semibold hover:bg-secondary transition-colors"
                                    >
                                        {cancelLabel}
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        if (onConfirm) onConfirm();
                                        onClose();
                                    }}
                                    className={cn(
                                        "flex-1 px-6 py-3 rounded-xl font-bold shadow-lg transition-all",
                                        type === 'error' ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/20" :
                                            type === 'success' ? "bg-success text-white hover:bg-success/90 shadow-success/20" :
                                                "btn-gold shadow-gold/20"
                                    )}
                                >
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
