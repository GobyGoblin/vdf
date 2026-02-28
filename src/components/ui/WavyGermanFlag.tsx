import { motion } from 'framer-motion';

export const WavyGermanFlag = () => {
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-[0.15]">
            {/* Cinematic Gradient Mask */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-slate-100/10 via-transparent to-slate-100/80" />
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-100 via-transparent to-slate-100" />

            <motion.div
                className="relative w-full h-full"
                animate={{
                    scale: [1, 1.05, 1],
                    y: [0, -20, 0],
                    rotate: [0, 1, 0]
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <img
                    src="/wavy-flag.png"
                    alt="Wavy German Flag"
                    className="w-full h-full object-cover object-center grayscale-[0.2] contrast-[1.1]"
                />
            </motion.div>
        </div>
    );
};
