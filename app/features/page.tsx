'use client';

import { motion } from "framer-motion";
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      <Header title="Buddy AI" />

      <div className="flex-1">
        {/* What It Is Section */}
        <section className="pt-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-40 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-40 right-40 w-48 h-48 bg-indigo-300/20 rounded-full blur-3xl animate-float-delayed" />
          </div>
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold mb-6">
                <span>💡</span> <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">What It Is</span>
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Your personal space to process work stress, practice difficult conversations, and find your center — without judgment or pressure.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-pink-300/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-blue-300/20 rounded-full blur-3xl animate-float-delayed" />
          </div>
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-4">
                <span>🧭</span> <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Features</span>
              </h2>
              <p className="text-xl text-gray-600">
                When work feels overwhelming, we&apos;re here to help you find clarity and calm.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: "🧘",
                  title: "Instant Grounding Prompts",
                  description: "Short, voice-friendly nudges that help you pause and breathe — in less than 60 seconds."
                },
                {
                  icon: "🔁",
                  title: "Loop Disruption",
                  description: "Helps you get out of overthinking spirals with structured voice reflections or affirming rewrites."
                },
                {
                  icon: "⏳",
                  title: "Micro-Coaching Moments",
                  description: "Helps you shift perspective with bite-sized nudges — no goals, no pressure, just clarity."
                },
                {
                  icon: "🔐",
                  title: "Private & Secure",
                  description: "Your voice stays private. No tracking, no judging, no storing what you say."
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed flex-1">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
} 