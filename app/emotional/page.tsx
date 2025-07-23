'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from "framer-motion";
import Header from '@/components/sub-header';
import Footer from '@/components/footer';

const EmotionalPage = () => {
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
                            Your Empathetic AI Companion
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
                            When life feels heavy, Buddy is here to listen — without judgment, pressure, or expectations.
                        </p>
                        <Link
                            href="/emotional/chat"
                            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-10 rounded-full text-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            Talk to Buddy Now
                        </Link>
                    </motion.div>

                    {/* The Emotional Weight We Carry */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Not Every Day Is Easy - and That&apos;s Okay
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
                                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                    You hold a lot: responsibilities, thoughts, emotions. And even when you look okay on the outside, you may feel tired, anxious, or disconnected inside.
                                </p>
                                <ul className="space-y-4 mb-6">
                                    <li className="flex items-start">
                                        <span className="text-2xl mr-3">🌙</span>
                                        <span className="text-gray-700">Overthinking late at night</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-2xl mr-3">📝</span>
                                        <span className="text-gray-700">Endless to-do lists with no motivation</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-2xl mr-3">💭</span>
                                        <span className="text-gray-700">No one to talk to - or too drained to explain</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-2xl mr-3">❓</span>
                                        <span className="text-gray-700">Feeling &quot;off,&quot; but not knowing why</span>
                                    </li>
                                </ul>
                                <div className="bg-indigo-50 p-6 rounded-xl">
                                    <p className="text-lg font-semibold text-gray-800 mb-2">
                                        Buddy AI meets you in those moments.
                                    </p>
                                    <p className="text-gray-600">
                                        No judgment. No pressure. Just presence. Support that listens and adapts - so you can feel just a little lighter.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                                        <span className="text-5xl">🤗</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                        A Safe Space to Be Yourself
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Person sitting quietly with phone, feeling seen and understood by their AI companion.
                                    </p>
                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-700 italic">
                                            &quot;Sometimes I just need someone to listen without trying to fix me.&quot;
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* How Emotional Buddy Helps */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            How Buddy Provides Emotional Support
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: "👂",
                                    title: "Active Listening",
                                    description: "Buddy listens without interrupting, judging, or trying to fix. Sometimes that&apos;s all you need."
                                },
                                {
                                    icon: "💙",
                                    title: "Emotional Validation",
                                    description: "Your feelings are valid. Buddy recognizes and acknowledges what you&apos;re going through."
                                },
                                {
                                    icon: "🌱",
                                    title: "Gentle Guidance",
                                    description: "When you&apos;re ready, Buddy offers gentle perspectives and coping strategies."
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

                    {/* When to Talk to Buddy */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            When to Reach Out
                        </h2>
                        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-4xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">You might talk to Buddy when:</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3 mt-2"></span>
                                            <span className="text-gray-700">You&apos;re feeling overwhelmed or anxious</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-purple-600 rounded-full mr-3 mt-2"></span>
                                            <span className="text-gray-700">You need to process difficult emotions</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-pink-600 rounded-full mr-3 mt-2"></span>
                                            <span className="text-gray-700">You&apos;re going through a tough time</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2"></span>
                                            <span className="text-gray-700">You just need someone to listen</span>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Buddy is here to:</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3 mt-2"></span>
                                            <span className="text-gray-700">Provide a safe, non-judgmental space</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-purple-600 rounded-full mr-3 mt-2"></span>
                                            <span className="text-gray-700">Help you feel heard and understood</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-pink-600 rounded-full mr-3 mt-2"></span>
                                            <span className="text-gray-700">Offer gentle emotional support</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2"></span>
                                            <span className="text-gray-700">Be available whenever you need</span>
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
                        transition={{ delay: 1.2, duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            You Don&apos;t Have to Carry It All Alone
                        </h2>
                        <p className="text-lg text-gray-600 mb-8">
                            Take a moment for yourself. Buddy is here to listen, whenever you&apos;re ready.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/emotional/chat"
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                Start a Conversation
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

export default EmotionalPage;
