'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from "framer-motion";
import Header from '@/components/sub-header';
import Footer from '@/components/footer';

const TravelPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-800 relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-1000"></div>
      </div>

      <Header title="Buddy AI | Travel Companion" chat_url="/travel/chat" features_url="/travel/features" how_it_works_url="/travel/how-it-works" />

      {/* Hero Section */}
      <main className="pt-24 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8">
              Your Personal AI Travel Companion
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
              From dreaming to boarding - plan, book and explore smarter.
            </p>
            <Link
              href="/travel/chat"
              className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-10 rounded-full text-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              Start Your Journey
            </Link>
          </motion.div>

          {/* The Traveler's Challenge */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Traveling Should Feel Exciting - Not Exhausting
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  You&apos;re finally going on that dream trip... But somehow it&apos;s already stressful.
                </p>
                <ul className="space-y-4 mb-6">
                  <li className="flex items-start">
                    <span className="text-2xl mr-3">🌀</span>
                    <span className="text-gray-700">Scouring forums for what might be relevant</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-2xl mr-3">📊</span>
                    <span className="text-gray-700">Drowning in spreadsheets and discount trackers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-2xl mr-3">🔄</span>
                    <span className="text-gray-700">Plans shifting by the hour — missed flights, lost bookings</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-2xl mr-3">💬</span>
                    <span className="text-gray-700">&quot;Best restaurants?&quot; — buried under 4,000 Google reviews</span>
                  </li>
                </ul>
                <p className="text-lg font-semibold text-gray-800 mb-4">
                  That&apos;s where Buddy AI steps in.
                </p>
                <p className="text-gray-600">
                  Your travel shouldn&apos;t start with anxiety. Let Buddy take the chaos off your plate — so you can focus on the adventure.
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-red-100 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Before</h4>
                      <div className="space-y-2 text-sm text-red-700">
                        <div>📱 50+ browser tabs</div>
                        <div>📊 Complex spreadsheets</div>
                        <div>💬 Endless group chats</div>
                        <div>😰 Travel anxiety</div>
                      </div>
                    </div>
                    <div className="bg-green-100 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">After</h4>
                      <div className="space-y-2 text-sm text-green-700">
                        <div>🤖 One AI companion</div>
                        <div>✨ Personalized plans</div>
                        <div>🎯 Smart suggestions</div>
                        <div>😊 Travel excitement</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 italic">
                    Clean Buddy AI interface with personalized itinerary
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Travel Features */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Your Travel Companion Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: "🗺️",
                  title: "Smart Itinerary Planning",
                  description: "AI-powered suggestions based on your preferences, budget, and travel style."
                },
                {
                  icon: "📍",
                  title: "Local Insights",
                  description: "Real-time recommendations from locals and recent travelers."
                },
                {
                  icon: "⚡",
                  title: "Instant Adjustments",
                  description: "Plans change? No problem. Instant rebooking and alternative suggestions."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-center"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* How Travel Buddy Works */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              How Travel Buddy Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: "1",
                  title: "Tell us your dream",
                  description: "Beach vacation? City adventure? Business trip? Share your vision."
                },
                {
                  step: "2",
                  title: "Get your perfect plan",
                  description: "Personalized itinerary with flights, hotels, activities, and local tips."
                },
                {
                  step: "3",
                  title: "Travel with confidence",
                  description: "Real-time support, instant rebooking, and local insights throughout your journey."
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 + index * 0.2 }}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Ready to Transform Your Travel Experience?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Start planning your next adventure with AI-powered travel intelligence.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/travel/chat"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                Start Planning
              </Link>
              <Link
                href="/"
                className="border-2 border-indigo-600 text-indigo-600 font-semibold py-3 px-8 rounded-full hover:bg-indigo-50 transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TravelPage;
