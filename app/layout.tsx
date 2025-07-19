import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from '@/lib/hooks/use-auth';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap', // Improve font loading performance
  preload: true,
  fallback: ['system-ui', 'arial'], // Provide fallback fonts
});

export const metadata: Metadata = {
  title: "AI Companion Chatbot",
  description: "Your personal AI companion for every side of life - whether you're stressed at work, learning a new culture, lost on the road or just need to talk things through.",
  keywords: "AI companion, chatbot, emotional support, travel assistant, corporate wellness, cultural communication",
  authors: [{ name: "Buddy AI Team" }],
  robots: "index, follow",
  openGraph: {
    title: "AI Companion Chatbot",
    description: "Your personal AI companion for every side of life",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Companion Chatbot",
    description: "Your personal AI companion for every side of life",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Performance hints */}
        <link rel="dns-prefetch" href="https://api.openai.com" />
        <link rel="dns-prefetch" href="https://vercel-analytics.com" />
        
        {/* Viewport for responsive design */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        
        {/* Theme color for better PWA experience */}
        <meta name="theme-color" content="#6366f1" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
