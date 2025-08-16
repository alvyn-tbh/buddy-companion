"use client";

import dynamic from 'next/dynamic';
import React, { ReactNode } from 'react';

// Types for motion components - used for documentation and potential future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface MotionProps {
  children: ReactNode;
  initial?: Record<string, unknown>;
  animate?: Record<string, unknown>;
  exit?: Record<string, unknown>;
  transition?: Record<string, unknown>;
  whileHover?: Record<string, unknown>;
  whileTap?: Record<string, unknown>;
  variants?: Record<string, unknown>;
  className?: string;
  [key: string]: unknown;
}

// Dynamically import motion components
const MotionDiv = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.div),
  { ssr: false }
);

const MotionSection = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.section),
  { ssr: false }
);

const AnimatePresence = dynamic(
  () => import('framer-motion').then((mod) => mod.AnimatePresence),
  { ssr: false }
) as React.FC<{ children: ReactNode; mode?: 'sync' | 'wait' | 'popLayout' }>;

// Export wrapped components
export { MotionDiv, MotionSection, AnimatePresence };

// Helper function for creating motion components on demand
export function createMotionComponent(element: string) {
  return dynamic(
    () => import('framer-motion').then((mod) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (mod.motion as any)[element];
    }),
    { ssr: false }
  );
}