'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from "framer-motion";
import Header from '@/components/sub-header';
import Footer from '@/components/footer';

const CulturePage = () => {
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
                            Learn Culture. Speak Naturally. Connect Better.
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
                            Buddy helps you explore new cultures and improve your communication - one real conversation at a time.
                        </p>
                        <Link
                            href="/culture/chat"
                            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-10 rounded-full text-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            Explore With Buddy
                        </Link>
                    </motion.div>

                    {/* What Gets in the Way */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Cultural Curiosity Shouldn&apos;t Be Frustrating
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
                                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                    You want to connect - with locals, new colleagues or global friends. But:
                                </p>
                                <ul className="space-y-4 mb-6">
                                    <li className="flex items-start">
                                        <span className="text-2xl mr-3">🤖</span>
                                        <span className="text-gray-700">Language apps feel robotic and detached</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-2xl mr-3">📚</span>
                                        <span className="text-gray-700">You memorize phrases but don&apos;t learn how to use them</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-2xl mr-3">🤔</span>
                                        <span className="text-gray-700">Cultural cues, humor, or social norms are hard to grasp</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-2xl mr-3">😰</span>
                                        <span className="text-gray-700">Practicing with real people feels intimidating</span>
                                    </li>
                                </ul>
                                <div className="bg-indigo-50 p-6 rounded-xl">
                                    <p className="text-lg font-semibold text-gray-800 mb-2">
                                        Buddy AI offers a low-pressure space to learn both language and context.
                                    </p>
                                    <p className="text-gray-600">
                                        So you don&apos;t just translate - you connect.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                                        <span className="text-5xl">☕</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                        Practice in a Foreign Café Setting
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Person chatting with Buddy in a café setting, learning cultural nuances and natural conversation flow.
                                    </p>
                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-700 italic">
                                            &quot;I finally understood the cultural context behind their expressions.&quot;
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* How Culture Buddy Helps */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Beyond Translation - True Cultural Connection
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: "🌍",
                                    title: "Cultural Context",
                                    description: "Learn not just what to say, but when, why, and how to say it in different cultural contexts."
                                },
                                {
                                    icon: "💬",
                                    title: "Natural Conversations",
                                    description: "Practice real dialogues that flow naturally, with cultural nuances and appropriate responses."
                                },
                                {
                                    icon: "🎭",
                                    title: "Social Awareness",
                                    description: "Understand humor, etiquette, and social norms that make conversations meaningful."
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

                    {/* Cultural Learning Areas */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Explore Cultures & Languages
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: "🗣️",
                                    title: "Everyday Conversations",
                                    description: "Master casual chats, small talk, and daily interactions that build genuine connections."
                                },
                                {
                                    icon: "🏢",
                                    title: "Business Etiquette",
                                    description: "Navigate professional settings with confidence, understanding cultural business norms."
                                },
                                {
                                    icon: "🎉",
                                    title: "Social Situations",
                                    description: "Feel comfortable at parties, gatherings, and social events in any culture."
                                },
                                {
                                    icon: "🍽️",
                                    title: "Dining Culture",
                                    description: "Understand food customs, restaurant etiquette, and meal-time conversations."
                                },
                                {
                                    icon: "🎨",
                                    title: "Arts & Entertainment",
                                    description: "Discuss movies, music, art, and entertainment with cultural insight and appreciation."
                                },
                                {
                                    icon: "🤝",
                                    title: "Relationship Building",
                                    description: "Learn how friendships and relationships develop differently across cultures."
                                }
                            ].map((area, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.0 + index * 0.1 }}
                                    className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="text-3xl mb-4">{area.icon}</div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{area.title}</h3>
                                    <p className="text-gray-600">{area.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Learning Benefits */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                        className="mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Why Cultural Learning Matters
                        </h2>
                        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-4xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Growth:</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3 mt-2"></span>
                                            <span className="text-gray-700">Build genuine cross-cultural friendships</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-purple-600 rounded-full mr-3 mt-2"></span>
                                            <span className="text-gray-700">Develop cultural sensitivity and awareness</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-pink-600 rounded-full mr-3 mt-2"></span>
                                            <span className="text-gray-700">Gain confidence in diverse environments</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2"></span>
                                            <span className="text-gray-700">Broaden your worldview and perspectives</span>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Advantages:</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3 mt-2"></span>
                                            <span className="text-gray-700">Excel in international business settings</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-purple-600 rounded-full mr-3 mt-2"></span>
                                            <span className="text-gray-700">Communicate effectively with global teams</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-pink-600 rounded-full mr-3 mt-2"></span>
                                            <span className="text-gray-700">Navigate multicultural workplace dynamics</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2"></span>
                                            <span className="text-gray-700">Enhance your career opportunities</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
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
                            Start Your Cultural Journey Today
                        </h2>
                        <p className="text-lg text-gray-600 mb-8">
                            Discover new cultures, improve your communication, and connect meaningfully with people from around the world.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/culture/chat"
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                Start Learning
                            </Link>
                            <Link
                                href="/culture/how-it-works"
                                className="border-2 border-indigo-600 text-indigo-600 font-semibold py-3 px-8 rounded-full hover:bg-indigo-50 transition-all duration-300"
                            >
                                How It Works
                            </Link>
                        </div>
                    </motion.section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CulturePage;
