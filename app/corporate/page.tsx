'use client';

import Link from 'next/link';
import { motion } from "framer-motion";
import Header from '@/components/sub-header';
import Footer from '@/components/footer';
import { useAuth } from '@/lib/hooks/use-auth';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-800 relative flex flex-col">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-1000"></div>
      </div>

      <Header title="Buddy AI | Corporate Wellness" chat_url="/corporate/chat" features_url="/corporate/features" how_it_works_url="/corporate/how-it-works" />

      {/* Main Section */}
      <main className="flex-1 pt-8 pb-0 px-2 sm:px-6 lg:px-8 w-full">
        <div className="max-w-7xl mx-auto h-full flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-fade-in mb-8">
              When Work Weighs You Down, We Help You Breathe.
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto animate-fade-in-up mb-8">
              A calm, intelligent voice companion to help you reflect, reset, and breathe — especially when work feels like a lot.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                icon: "🧘",
                title: "Emotional Support",
                description: "Get personalized support that adapts to your emotional state and needs."
              },
              {
                icon: "🔄",
                title: "Stress Relief",
                description: "Find your calm with guided breathing and mindfulness exercises."
              },
              {
                icon: "💬",
                title: "Safe Space",
                description: "A judgment-free zone to express yourself and process your thoughts."
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            {user ? (
              <Link
                href="/corporate/chat"
                className="inline-block w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-10 rounded-full text-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                Start Your Journey →
              </Link>
            ) : (
              <div className="space-y-4">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl max-w-md mx-auto">
                  <div className="text-amber-600 text-2xl mb-2">🔒</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign In Required</h3>
                  <p className="text-gray-600 mb-4">
                    Please sign in to access the corporate chat companion and start your wellness journey.
                  </p>
                  <Link
                    href="/auth"
                    className="inline-block w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-full text-base hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    Sign In to Continue
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
