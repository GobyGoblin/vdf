import { motion } from 'framer-motion';

interface FloatingParticlesProps {
    count?: number;
    variant?: 'light' | 'dark' | 'gold';
}

export const FloatingParticles = ({ count = 20, variant = 'light' }: FloatingParticlesProps) => {
    const particles = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 10 + 15,
        delay: Math.random() * 5,
    }));

    const getParticleColor = () => {
        switch (variant) {
            case 'dark':
                return 'hsl(45 93% 47% / 0.15)';
            case 'gold':
                return 'hsl(45 93% 47% / 0.3)';
            default:
                return 'hsl(222 47% 11% / 0.08)';
        }
    };

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: particle.size,
                        height: particle.size,
                        backgroundColor: getParticleColor(),
                        boxShadow: `0 0 ${particle.size * 2}px ${getParticleColor()}`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        x: [0, Math.random() * 20 - 10, 0],
                        opacity: [0.2, 0.8, 0.2],
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: particle.delay,
                    }}
                />
            ))}
        </div>
    );
};
