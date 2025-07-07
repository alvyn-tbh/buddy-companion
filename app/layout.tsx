import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { StagewiseDevTool } from '@/components/stagewise-toolbar';
import { AuthProvider } from '@/lib/hooks/use-auth';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
        <StagewiseDevTool />
      </body>
    </html>
  );
}
