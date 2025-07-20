'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from "framer-motion";
import Header from '@/components/sub-header';
import Footer from '@/components/footer';

const CultureFeaturesPage = () => {
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
                title="Buddy AI | Culture & Communication Companion"
                chat_url="/culture/chat"
                features_url="/culture/features"
                how_it_works_url="/culture/how-it-works"
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
                            Learn in a Human, Adaptive Way
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
                            Discover features designed to help you communicate naturally and understand cultural nuances in any setting.
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
                            Core Features
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: "💬",
                                    title: "Conversational Practice with Feedback",
                                    description: "Buddy corrects tone, context, and word choice naturally.",
                                    highlight: "Real-time feedback"
                                },
                                {
                                    icon: "🌍",
                                    title: "Cultural Insights on the Go",
                                    description: "Customs, gestures, local etiquette, humor - all explained in simple terms.",
                                    highlight: "Cultural intelligence"
                                },
                                {
                                    icon: "🎭",
                                    title: "Multiple Styles of Speech",
                                    description: "Learn formal, casual or professional styles depending on your need.",
                                    highlight: "Adaptive communication"
                                },
                                {
                                    icon: "🎪",
                                    title: "Roleplay Scenarios",
                                    description: "Prepare for dinner invites, interviews, dates or team calls.",
                                    highlight: "Practical preparation"
                                },
                                {
                                    icon: "🎤",
                                    title: "Pronunciation Support (Voice)",
                                    description: "Speak and get feedback instantly - no judgment.",
                                    highlight: "Voice learning"
                                },
                                {
                                    icon: "🌐",
                                    title: "Multilingual Support",
                                    description: "Supports English learners, international travelers and expats alike.",
                                    highlight: "Global reach"
                                }
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="text-3xl">{feature.icon}</div>
                                        <div className="flex-1">
                                            <div className="flex items-start flex-col gap-2 mb-3">
                                                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
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

                    {/* Use Case Scenarios */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Who This Is For
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: "✈️",
                                    title: "Travelers",
                                    description: "Want to understand local manners and small talk in a new country.",
                                    example: "Learning how to politely ask for directions, understanding tipping customs, or making conversation with locals at cafés."
                                },
                                {
                                    icon: "🎓",
                                    title: "Students Abroad",
                                    description: "Need cultural context to thrive in classrooms or dorm life.",
                                    example: "Understanding academic communication styles, navigating social dynamics, or participating confidently in group discussions."
                                },
                                {
                                    icon: "💻",
                                    title: "Remote Teams & Expats",
                                    description: "Trying to communicate naturally with global colleagues or neighbors.",
                                    example: "Mastering professional communication styles, understanding workplace culture, or building relationships in a new community."
                                }
                            ].map((useCase, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.0 + index * 0.2 }}
                                    className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="text-center">
                                        <div className="text-4xl mb-4">{useCase.icon}</div>
                                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">{useCase.title}</h3>
                                        <p className="text-lg text-indigo-600 mb-4 font-medium">{useCase.description}</p>
                                        <p className="text-gray-600 text-sm">{useCase.example}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* What Makes Buddy Different */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4, duration: 0.8 }}
                        className="mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            It&apos;s Not Just Language. It&apos;s Human Communication.
                        </h2>
                        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-4xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[
                                    {
                                        icon: "🧠",
                                        title: "Understand Why",
                                        description: "Understand why certain phrases work - not just what to say"
                                    },
                                    {
                                        icon: "🎯",
                                        title: "Adapt Settings",
                                        description: "Learn to adapt across formal/informal settings"
                                    },
                                    {
                                        icon: "🤝",
                                        title: "Culture + Language",
                                        description: "Explore culture alongside language, not as an afterthought"
                                    },
                                    {
                                        icon: "🎨",
                                        title: "Choose Your Voice",
                                        description: "Pick a 'voice' that fits - direct mentor, soft guide, or lively peer"
                                    },
                                    {
                                        icon: "🚀",
                                        title: "Your Own Pace",
                                        description: "Progress at your own pace - no gamification, just relevance"
                                    },
                                    {
                                        icon: "💡",
                                        title: "Contextual Learning",
                                        description: "Learn through real conversations, not artificial exercises"
                                    }
                                ].map((difference, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1.6 + index * 0.1 }}
                                        className="flex items-start space-x-4"
                                    >
                                        <div className="text-2xl">{difference.icon}</div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{difference.title}</h3>
                                            <p className="text-gray-600">{difference.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.section>

                    {/* Try It Now */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.0, duration: 0.8 }}
                        className="mb-16"
                    >
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-2xl shadow-xl text-center">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
                                Say &quot;Hi&quot; in Another Language - Right Now
                            </h2>
                            <p className="text-lg mb-8 opacity-90">
                                Try a greeting or ask how to order food - Buddy will walk you through it step-by-step.
                            </p>
                            <Link
                                href="/culture/chat"
                                className="bg-white text-indigo-600 font-semibold py-3 px-8 rounded-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 inline-block"
                            >
                                Practice With Buddy
                            </Link>
                        </div>
                    </motion.section>

                    {/* Extended AI Features */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.2, duration: 0.8 }}
                        className="mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Extended AI Features
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    icon: "🎭",
                                    title: "Personality Adaptation",
                                    description: "AI adapts to match your preferred learning style and personality",
                                    highlight: "Personalized"
                                },
                                {
                                    icon: "🔄",
                                    title: "Contextual Memory",
                                    description: "Remembers your progress and builds on previous conversations",
                                    highlight: "Smart learning"
                                },
                                {
                                    icon: "🎯",
                                    title: "Scenario Generation",
                                    description: "Creates custom practice scenarios based on your goals",
                                    highlight: "Dynamic content"
                                },
                                {
                                    icon: "📊",
                                    title: "Progress Insights",
                                    description: "Track your cultural understanding and communication growth",
                                    highlight: "Growth tracking"
                                }
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 2.4 + index * 0.1 }}
                                    className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-center"
                                >
                                    <div className="text-3xl mb-3">{feature.icon}</div>
                                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold mb-3 inline-block">
                                        {feature.highlight}
                                    </span>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                                    <p className="text-gray-600 text-sm">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Final CTA */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.8, duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Start Connecting More Deeply
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                            Whether it&apos;s your first phrase or your tenth country, Buddy grows with you. Speak better. Understand more. Be heard.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/culture/chat"
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                Explore With Buddy
                            </Link>
                            <Link
                                href="/culture/how-it-works"
                                className="border-2 border-indigo-600 text-indigo-600 font-semibold py-3 px-8 rounded-full hover:bg-indigo-50 transition-all duration-300"
                            >
                                See How It Works
                            </Link>
                        </div>
                    </motion.section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CultureFeaturesPage;
