'use client';

import { motion } from "framer-motion";
import Header from '@/components/sub-header';
import Footer from '@/components/footer';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      <Header title="Buddy AI | Corporate Wellness" chat_url="/corporate/chat" features_url="/corporate/features" how_it_works_url="/corporate/how-it-works" />

      <div className="flex-1 w-full">
        <section className="pt-24 pb-12 px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8 sm:mb-12"
            >
              <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 sm:mb-6">
                How It Works
              </h1>
              <p className="text-base xs:text-lg sm:text-xl text-gray-600">
                Simple, natural, and designed to help you find your center.
              </p>
            </motion.div>

            <div className="grid gap-4 sm:gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm p-4 xs:p-6 sm:p-8 rounded-2xl shadow-xl"
              >
                <h2 className="text-lg xs:text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-4">1. Start a Conversation</h2>
                <p className="text-base xs:text-lg sm:text-lg text-gray-600">
                  Just type or speak naturally. No scripts, no rigid formats. Tell us what&apos;s on your mind.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 backdrop-blur-sm p-4 xs:p-6 sm:p-8 rounded-2xl shadow-xl"
              >
                <h2 className="text-lg xs:text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-4">2. Get Personalized Support</h2>
                <p className="text-base xs:text-lg sm:text-lg text-gray-600">
                  <span className="font-semibold">Emotionally intelligent:</span> Matches your tone - calm when you&apos;re calm, steady when you&apos;re not
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-sm p-4 xs:p-6 sm:p-8 rounded-2xl shadow-xl"
              >
                <h2 className="text-lg xs:text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-4">3. Find Your Path Forward</h2>
                <p className="text-base xs:text-lg sm:text-lg text-gray-600">
                  Get practical insights and actionable steps to help you move forward with clarity.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
} 