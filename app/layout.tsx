import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from '@/lib/hooks/use-auth';
// import { ServiceWorkerProvider } from '@/components/service-worker-provider';

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
  manifest: "/manifest.json",
  openGraph: {
    title: "AI Companion Chatbot",
    description: "Your personal AI companion for every side of life",
    type: "website",
    images: [
      {
        url: "/screenshots/desktop-chat.png",
        width: 1280,
        height: 720,
        alt: "AI Companion Chat Interface",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Companion Chatbot",
    description: "Your personal AI companion for every side of life",
    images: ["/screenshots/desktop-chat.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Buddy AI",
    startupImage: [
      {
        url: "/icons/icon-512x512.png",
        media: "(device-width: 768px) and (device-height: 1024px)",
      },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Buddy AI",
    "application-name": "Buddy AI",
    "msapplication-TileColor": "#6366f1",
    "msapplication-config": "/browserconfig.xml",
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
        <meta name="msapplication-navbutton-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* PWA icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="mask-icon" href="/icons/icon-192x192.png" color="#6366f1" />
        
        {/* Preload critical routes */}
        <link rel="prefetch" href="/corporate" />
        <link rel="prefetch" href="/travel" />
        <link rel="prefetch" href="/emotional" />
        <link rel="prefetch" href="/culture" />
        
        {/* Performance optimization scripts - temporarily disabled for build */}
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
