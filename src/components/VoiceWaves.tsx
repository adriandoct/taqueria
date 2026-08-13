'use client';

import { motion } from 'framer-motion';

interface VoiceWavesProps {
  isActive: boolean;
  isProcessing?: boolean;
}

export function VoiceWaves({ isActive, isProcessing }: VoiceWavesProps) {
  const bars = Array.from({ length: 12 }, (_, i) => i);
  const color = isProcessing ? '#F59E0B' : '#22C55E';

  return (
    <div className="flex items-center justify-center gap-[3px] h-16">
      {bars.map((i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full"
          style={{ backgroundColor: color }}
          animate={
            isActive
              ? {
                  scaleY: [0.3, 1.5, 0.3, 1.0, 0.3],
                  opacity: [0.6, 1, 0.7, 1, 0.6],
                }
              : { scaleY: 0.3, opacity: 0.4 }
          }
          transition={
            isActive
              ? {
                  duration: 0.9 + i * 0.07,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.06,
                }
              : { duration: 0.3 }
          }
          style={{ height: '48px', transformOrigin: 'center', backgroundColor: color }}
        />
      ))}
    </div>
  );
}
