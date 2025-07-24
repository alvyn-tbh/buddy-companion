import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from '@/lib/hooks/use-auth';
import { StagewiseToolbar } from '@stagewise/toolbar-next';
import ReactPlugin from '@stagewise-plugins/react';
import { WebRTCPolyfillLoader } from '@/components/webrtc-polyfill-loader';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "AI Companion Chatbot Chatbot",
  description:
    "This is a TBH project.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <WebRTCPolyfillLoader />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
        <StagewiseToolbar 
          config={{
            plugins: [ReactPlugin],
          }}
        />
      </body>
    </html>
  );
}
