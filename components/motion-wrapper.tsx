"use client";

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Types for motion components
interface MotionProps {
  children: ReactNode;
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  whileHover?: any;
  whileTap?: any;
  variants?: any;
  className?: string;
  [key: string]: any;
}

// Dynamically import motion components
const MotionDiv = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.div),
  { ssr: false }
) as React.FC<MotionProps>;

const MotionSection = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.section),
  { ssr: false }
) as React.FC<MotionProps>;

const AnimatePresence = dynamic(
  () => import('framer-motion').then((mod) => mod.AnimatePresence),
  { ssr: false }
) as React.FC<{ children: ReactNode; mode?: 'sync' | 'wait' | 'popLayout' }>;

// Export wrapped components
export { MotionDiv, MotionSection, AnimatePresence };

// Helper function for creating motion components on demand
export function createMotionComponent<T extends keyof JSX.IntrinsicElements>(element: T) {
  return dynamic(
    () => import('framer-motion').then((mod) => (mod.motion as any)[element]),
    { ssr: false }
  ) as React.FC<MotionProps>;
}