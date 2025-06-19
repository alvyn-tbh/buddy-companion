'use client';

import { StagewiseToolbar } from '@stagewise/toolbar-next';
import { ReactPlugin } from '@stagewise-plugins/react';

const stagewiseConfig = {
  plugins: [ReactPlugin]
};

export function StagewiseDevTool() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <StagewiseToolbar config={stagewiseConfig} />;
} 