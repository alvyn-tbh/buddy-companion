'use client';

import React, { Suspense, lazy } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';

// Lazy load motion components to reduce initial bundle size
const MotionDiv = lazy(() => 
  import('framer-motion').then(mod => ({ default: mod.motion.div }))
);

// Loading fallback for motion components
const MotionLoadingFallback: React.FC<{ children: React.ReactNode; className?: string }> = 
  ({ children, className }) => <div className={className}>{children}</div>;

export default function HomePage() {
  return (
    <main className="min-h-screen w-full bg-white dark:bg-black px-2 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Animated Background Elements - Lazy loaded */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-1000"></div>
      </div>

      <Header title="Buddy AI" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<MotionLoadingFallback className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8">
            One Voice. Many Sides. Always There.
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            Your personal AI companion for every side of life - whether you&apos;re stressed at work, learning a new culture, lost on the road or just need to talk things through.
          </p>
        </MotionLoadingFallback>}>
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8">
              One Voice. Many Sides. Always There.
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
              Your personal AI companion for every side of life - whether you&apos;re stressed at work, learning a new culture, lost on the road or just need to talk things through.
            </p>
          </MotionDiv>
        </Suspense>

        {/* What Buddy AI IS */}
        <Suspense fallback={<MotionLoadingFallback className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            More Than a Chat. It&apos;s Presence.
          </h2>
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-4xl mx-auto">
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              Buddy AI isn&apos;t a chatbot - it&apos;s a grounded, emotionally intelligent companion built to adapt to your world. It listens when you need silence, helps when you feel stuck and speaks like someone who understands.
            </p>
            <p className="text-lg font-semibold text-gray-800">
              No tasks. No distractions. Just real-time support across life&apos;s messy moments.
            </p>
          </div>
        </MotionLoadingFallback>}>
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              More Than a Chat. It&apos;s Presence.
            </h2>
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-4xl mx-auto">
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                Buddy AI isn&apos;t a chatbot - it&apos;s a grounded, emotionally intelligent companion built to adapt to your world. It listens when you need silence, helps when you feel stuck and speaks like someone who understands.
              </p>
              <p className="text-lg font-semibold text-gray-800">
                No tasks. No distractions. Just real-time support across life&apos;s messy moments.
              </p>
            </div>
          </MotionDiv>
        </Suspense>

        {/* Four Signature Modes */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Advanced Interaction Models
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <Suspense key={index} fallback={
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
                  <div className="text-3xl mb-3">{mode.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{mode.title}</h3>
                  <p className="text-gray-600 mb-3">{mode.subtitle}</p>
                  <p className="text-gray-700 italic">&quot;{mode.quote}&quot;</p>
                  <Link
                    href={mode.link}
                    className="mt-4 inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2 px-4 rounded-full hover:shadow-lg transition-all duration-300"
                  >
                    Explore
                  </Link>
                </div>
              }>
                <MotionDiv
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
                    href={mode.link}
                    className="mt-4 inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2 px-4 rounded-full hover:shadow-lg transition-all duration-300"
                  >
                    Explore
                  </Link>
                </MotionDiv>
              </Suspense>
            ))}
          </div>
        </section>

        {/* Why People Use It */}
        <Suspense fallback={<MotionLoadingFallback className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Why Buddy Works
          </h2>
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-4xl mx-auto">
            <ul className="space-y-4 text-lg text-gray-700">
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
          </div>
        </MotionLoadingFallback>}>
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Why Buddy Works
            </h2>
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-4xl mx-auto">
              <ul className="space-y-4 text-lg text-gray-700">
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
            </div>
          </MotionDiv>
        </Suspense>

        {/* Rest of the content - continuing with existing structure but static to reduce initial load */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            What People Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Testimonials - simplified without motion for better performance */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
              <p className="text-gray-700 mb-4 italic">
                &quot;Finally, an AI that understands the difference between wanting solutions and just needing someone to listen.&quot;
              </p>
              <p className="text-gray-900 font-semibold">- Sarah, Marketing Director</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
              <p className="text-gray-700 mb-4 italic">
                &quot;Helped me navigate a difficult conversation with my team lead. The cultural context was spot on.&quot;
              </p>
              <p className="text-gray-900 font-semibold">- Ahmed, Software Engineer</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
              <p className="text-gray-700 mb-4 italic">
                &quot;I was having a panic attack in Tokyo airport. Buddy talked me through it and helped me find my gate.&quot;
              </p>
              <p className="text-gray-900 font-semibold">- Maria, Consultant</p>
            </div>
          </div>
        </section>

        {/* Ready to Start */}
        <section className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Ready to Try Buddy AI?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Pick your starting point. Every mode adapts to your specific situation and communication style.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <Link
              href="/corporate"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              Work Stress
            </Link>
            <Link
              href="/travel"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              Travel Help
            </Link>
            <Link
              href="/emotional"
              className="bg-gradient-to-r from-pink-600 to-red-600 text-white font-semibold py-4 px-6 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              Need Support
            </Link>
            <Link
              href="/culture"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              Learn Culture
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
