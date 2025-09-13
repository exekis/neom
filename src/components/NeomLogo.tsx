'use client';

import { motion } from 'framer-motion';

interface NeomLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function NeomLogo({ className = '', size = 'lg' }: NeomLogoProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-8xl'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 1.2, 
        ease: [0.22, 1, 0.36, 1],
        delay: 0.3
      }}
      className={`font-bold tracking-tight ${sizeClasses[size]} ${className}`}
    >
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
      >
        NEOM
      </motion.span>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 0.6, delay: 1.4 }}
        className="h-1 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 rounded-full mt-2"
      />
    </motion.div>
  );
}