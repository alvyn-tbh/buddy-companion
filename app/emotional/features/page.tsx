'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from "framer-motion";
import Header from '@/components/sub-header';
import Footer from '@/components/footer';

const EmotionalFeaturesPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-800 relative">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute top-40 right-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
                <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-1000"></div>
            </div>

            <Header
                title="Buddy AI | Emotional Companion"
                chat_url="/emotional/chat"
                features_url="/emotional/features"
                how_it_works_url="/emotional/how-it-works"
            />

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
                            Emotional Support Features
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
                            Discover the thoughtful features that make Buddy AI your trusted emotional companion.
                        </p>
                    </motion.div>

                    {/* Core Features */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Designed for Real-Life Emotions
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: "🧠",
                                    title: "Emotion-Aware Conversations",
                                    description: "Understands tone, patterns, and subtle emotional cues."
                                },
                                {
                                    icon: "🎤",
                                    title: "Voice & Text Support",
                                    description: "Speak or type — whichever feels more natural."
                                },
                                {
                                    icon: "💭",
                                    title: "Gentle Reflection Prompts",
                                    description: "Ask better questions, not give quick answers."
                                },
                                {
                                    icon: "📊",
                                    title: "Mood Timeline",
                                    description: "Track how you&apos;ve been feeling and what helped."
                                },
                                {
                                    icon: "🌱",
                                    title: "Micro-Support Sessions",
                                    description: "2–10 minute calming exercises for stressful moments."
                                },
                                {
                                    icon: "🔒",
                                    title: "Privacy First",
                                    description: "All conversations are private and never shared."
                                }
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="text-3xl mb-4">{feature.icon}</div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                                    <p className="text-gray-600">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Use Case Scenarios */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Who Buddy Supports
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: "💼",
                                    title: "Solo Professionals",
                                    description: "Feeling mentally overloaded with no one to talk to during the day.",
                                    details: "Navigate work stress, decision fatigue, and professional isolation with understanding support."
                                },
                                {
                                    icon: "🌟",
                                    title: "Young Adults",
                                    description: "Navigating self-discovery, anxiety, or emotional swings with no judgment.",
                                    details: "Explore identity, relationships, and life transitions in a safe, supportive space."
                                },
                                {
                                    icon: "🌙",
                                    title: "Nighttime Overthinkers",
                                    description: "Processing thoughts or emotions in quiet moments when others are asleep.",
                                    details: "Find peace and clarity during late-night reflection and processing sessions."
                                }
                            ].map((useCase, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.0 + index * 0.2 }}
                                    className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="text-center mb-6">
                                        <div className="text-5xl mb-4">{useCase.icon}</div>
                                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">{useCase.title}</h3>
                                        <p className="text-lg text-indigo-600 mb-4 font-medium">{useCase.description}</p>
                                    </div>
                                    <p className="text-gray-600">{useCase.details}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Extended AI Features */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4, duration: 0.8 }}
                        className="mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            What Makes Buddy Different
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                {
                                    icon: "🎭",
                                    title: "Emotional Tone Recognition",
                                    description: "Responds differently depending on your emotional tone",
                                    highlight: "Adaptive responses"
                                },
                                {
                                    icon: "🎨",
                                    title: "Personalized Support Styles",
                                    description: "Lets you choose a support \"style\" (like Calm Friend or Empathetic Mentor)",
                                    highlight: "Your choice"
                                },
                                {
                                    icon: "📈",
                                    title: "Intelligent Learning",
                                    description: "Gets better the more you talk - remembers moods, not words",
                                    highlight: "Privacy-focused learning"
                                },
                                {
                                    icon: "🌍",
                                    title: "Multilingual Support",
                                    description: "Multilingual option for non-native speakers",
                                    highlight: "Global accessibility"
                                },
                                {
                                    icon: "⏰",
                                    title: "Always Available",
                                    description: "No need to book anything - always available",
                                    highlight: "24/7 support"
                                }
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.6 + index * 0.1 }}
                                    className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="text-4xl">{feature.icon}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                                    {feature.highlight}
                                                </span>
                                            </div>
                                            <p className="text-gray-600">{feature.description}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Demo / Preview CTA */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.0, duration: 0.8 }}
                        className="mb-16"
                    >
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white text-center">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                                See What It Feels Like
                            </h2>
                            <p className="text-xl mb-8 opacity-90">
                                Try a short conversation with Buddy - no signup needed. Just say hello.
                            </p>
                            <Link
                                href="/emotional/chat"
                                className="inline-block bg-white text-indigo-600 font-semibold py-4 px-10 rounded-full text-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-gray-50"
                            >
                                Try Buddy Now
                            </Link>
                        </div>
                    </motion.section>

                    {/* Final CTA Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.4, duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Start Feeling Heard
                        </h2>
                        <p className="text-lg text-gray-600 mb-8">
                            Start with a hello - Buddy is ready when you are.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/emotional/chat"
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                Talk to Buddy Now
                            </Link>
                            <Link
                                href="/emotional/how-it-works"
                                className="border-2 border-indigo-600 text-indigo-600 font-semibold py-3 px-8 rounded-full hover:bg-indigo-50 transition-all duration-300"
                            >
                                Learn How It Works
                            </Link>
                        </div>
                    </motion.section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default EmotionalFeaturesPage;
