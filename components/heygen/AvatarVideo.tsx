"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface AvatarVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  className?: string;
}

export const AvatarVideo = forwardRef<HTMLVideoElement, AvatarVideoProps>(
  ({ className, ...props }, ref) => {
    return (
      <video
        ref={ref}
        autoPlay
        playsInline
        className={cn(
          "w-full h-full object-cover rounded-lg",
          className
        )}
        {...props}
      />
    );
  }
);

AvatarVideo.displayName = "AvatarVideo";