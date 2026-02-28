import { motion } from 'framer-motion';

interface BackgroundShapesProps {
  variant?: 'light' | 'dark' | 'gradient' | 'colorful';
  density?: 'low' | 'medium' | 'high';
}

export const BackgroundShapes = ({ variant = 'light', density = 'medium' }: BackgroundShapesProps) => {
  const shapes = density === 'low' ? 3 : density === 'medium' ? 5 : 7;

  const getShapeColor = () => {
    if (variant === 'dark') {
      return 'hsl(45 93% 47% / 0.03)';
    } else if (variant === 'gradient') {
      return 'hsl(45 93% 47% / 0.05)';
    } else if (variant === 'colorful') {
      // We'll handle colorful logic in the style prop directly for multi-color support
      return 'hsl(45 93% 47% / 0.15)';
    }
    return 'hsl(222 47% 11% / 0.02)';
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large Circle - Top Right */}
      <motion.div
        className="absolute -top-48 -right-48 w-96 h-96 rounded-full"
        style={{
          background: `radial-gradient(circle, ${getShapeColor()} 0%, transparent 70%)`,
          filter: 'blur(40px)'
        }}
        animate={{
          y: [0, 30, 0],
          x: [0, -20, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Medium Circle - Bottom Left */}
      <motion.div
        className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full"
        style={{
          background: `radial-gradient(circle, ${getShapeColor()} 0%, transparent 70%)`,
          filter: 'blur(30px)'
        }}
        animate={{
          y: [0, -25, 0],
          x: [0, 15, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {shapes >= 5 && (
        <>
          {/* Floating Rectangle - Middle */}
          <motion.div
            className="absolute top-1/2 left-1/4 w-48 h-48 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${getShapeColor()} 0%, transparent 100%)`,
              filter: 'blur(25px)',
              transform: 'rotate(45deg)'
            }}
            animate={{
              y: [0, 40, 0],
              rotate: [45, 60, 45],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Small Circle - Top Left */}
          <motion.div
            className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full"
            style={{
              background: `radial-gradient(circle, ${getShapeColor()} 0%, transparent 70%)`,
              filter: 'blur(20px)'
            }}
            animate={{
              y: [0, -15, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Triangle Shape - Bottom Right */}
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-40 h-40"
            style={{
              background: `linear-gradient(to bottom right, ${getShapeColor()} 0%, transparent 100%)`,
              filter: 'blur(30px)',
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }}
            animate={{
              y: [0, 20, 0],
              rotate: [0, 15, 0],
            }}
            transition={{
              duration: 16,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </>
      )}

      {shapes >= 7 && (
        <>
          {/* Additional decorative elements */}
          <motion.div
            className="absolute top-3/4 left-1/2 w-24 h-24 rounded-full"
            style={{
              background: `radial-gradient(circle, ${getShapeColor()} 0%, transparent 70%)`,
              filter: 'blur(15px)'
            }}
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          <motion.div
            className="absolute top-1/3 right-1/3 w-36 h-36 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${getShapeColor()} 0%, transparent 100%)`,
              filter: 'blur(25px)',
              transform: 'rotate(-30deg)'
            }}
            animate={{
              y: [0, 30, 0],
              rotate: [-30, -15, -30],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </>
      )}

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(${variant === 'dark' ? 'hsl(45 93% 47% / 0.1)' : 'hsl(222 47% 11% / 0.1)'} 1px, transparent 1px),
            linear-gradient(90deg, ${variant === 'dark' ? 'hsl(45 93% 47% / 0.1)' : 'hsl(222 47% 11% / 0.1)'} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
};
