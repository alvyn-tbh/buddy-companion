'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from "framer-motion";
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function HomePage() {
  return (
    <main className="min-h-screen w-full bg-white dark:bg-black px-2 sm:px-6 lg:px-8 py-6 space-y-8 pt-24 sm:pt-28">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-1000"></div>
      </div>

      <Header title="Buddy AI" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8">
            One Voice. Many Sides. Always There.
          </h1>
          <p className="text-base sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            Your personal AI companion for every side of life - whether you&apos;re stressed at work, learning a new culture, lost on the road or just need to talk things through.
          </p>
          {/* <Link
            href="/corporate/chat"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-10 rounded-full text-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            Meet your AI Buddy
          </Link> */}
        </motion.div>

        {/* What Buddy AI IS */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            More Than a Chat. It&apos;s Presence.
          </h2>
          <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-8 rounded-2xl shadow-xl max-w-4xl mx-auto">
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4">
              Buddy AI isn&apos;t a chatbot - it&apos;s a grounded, emotionally intelligent companion built to adapt to your world. It listens when you need silence, helps when you feel stuck and speaks like someone who understands.
            </p>
            <p className="text-base sm:text-lg font-semibold text-gray-800">
              No tasks. No distractions. Just real-time support across life&apos;s messy moments.
            </p>
          </div>
        </motion.section>

        {/* Four Signature Modes */}
        <section className="mb-16">
          <h2 className="text-xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Advanced Interaction Models
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {[
              {
                icon: "🧘",
                title: "Corporate Wellness Companion",
                subtitle: "When work overwhelms, Buddy helps you pause.",
                quote: "I've been on back-to-back calls. I just need 60 seconds to reset.",
                link: "/corporate"
              },
              {
                icon: "🌍",
                title: "Travel Companion",
                subtitle: "Lost, tired or in a new timezone? Buddy's got your back.",
                quote: "I just landed in Cairo. What do locals usually do first here?",
                link: "/travel"
              },
              {
                icon: "🧠",
                title: "Emotional Companion",
                subtitle: "No fixing. No judging. Just space to feel.",
                quote: "I'm not okay - and I don't want advice. Just to talk.",
                link: "/emotional"
              },
              {
                icon: "🗣️",
                title: "Culture & Communication Companion",
                subtitle: "Learn how people think, speak and connect - anywhere in the world.",
                quote: "How do I politely express disagreement in Korean?",
                link: "/culture"
              }
            ].map((mode, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-3xl mb-3">{mode.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{mode.title}</h3>
                <p className="text-gray-600 mb-3">{mode.subtitle}</p>
                <p className="text-gray-700 italic">&quot;{mode.quote}&quot;</p>
                <Link
                  href={`${mode.link}`}
                  className="mt-4 inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2 px-4 rounded-full hover:shadow-lg transition-all duration-300"
                >
                  Explore
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Why People Use It */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Why Buddy Works
          </h2>
          <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-8 rounded-2xl shadow-xl max-w-4xl mx-auto">
            <ul className="space-y-4 text-base sm:text-lg text-gray-700">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mr-4"></span>
                Emotionally aware, not emotionally fake
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-4"></span>
                Designed for text and voice
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-pink-600 rounded-full mr-4"></span>
                Adaptive across cultures and tones
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-4"></span>
                Doesn&apos;t pretend to be human. Just helpful.
              </li>
            </ul>
            <p className="text-gray-600 mt-6 text-center italic text-xs sm:text-base">
              Built with ❤️ by experts in emotional design, voice interaction and everyday context.
            </p>
          </div>
        </motion.section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto">
            {[
              {
                step: "1",
                title: "Say anything",
                description: "Stress? Question? Late-night spiral? Buddy listens."
              },
              {
                step: "2",
                title: "Get just what you need",
                description: "A breath. A phrase. A cultural insight. Not more, not less."
              },
              {
                step: "3",
                title: "Walk away lighter",
                description: "No pressure to chat. No productivity agenda. Just support that fits."
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
        </section>

        {/* Choose Your Buddy Mode */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Choose your Buddy. Start the conversation.
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-8">
            No app install. No sign-up. Just pick a mode and start.
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {[['Emotional', "emotional"], ['Travel', "travel"], ['Corporate', "corporate"], ['Culture', "culture"]].map(([mode, href], index) => (
              <Link
                key={index}
                href={`/${href.toLowerCase()}`}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {mode}
              </Link>
            ))}
          </div>
        </motion.section>
      </div>

      <Footer />
    </main>
  );
}
