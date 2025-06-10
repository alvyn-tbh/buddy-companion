'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from "framer-motion";
import Header from '@/components/sub-header';
import Footer from '@/components/footer';

const EmotionalHowItWorksPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-800 relative overflow-hidden">
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
                            Real Conversations. Real Learning.
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
                            Discover how Buddy AI helps you navigate cultural understanding and meaningful communication.
                        </p>
                    </motion.div>

                    {/* How It Works - Three Step Flow */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            How It Works
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    step: "1",
                                    title: "Choose a Culture or Language",
                                    description: "Pick a country or topic you're curious about — from daily customs to business etiquette.",
                                    icon: "🌍",
                                    details: "Explore different cultures and contexts that interest you or that you need to understand for work, travel, or personal growth."
                                },
                                {
                                    step: "2",
                                    title: "Practice Conversations",
                                    description: "Talk to Buddy like a local. Get immediate responses with explanations and cultural tips.",
                                    icon: "💬",
                                    details: "Engage in realistic conversations that help you understand not just what to say, but how and when to say it."
                                },
                                {
                                    step: "3",
                                    title: "Build Confidence",
                                    description: "Learn phrases, tone, and context. Rehearse situations like ordering food, making friends or joining meetings.",
                                    icon: "💪",
                                    details: "Practice real-world scenarios in a safe environment until you feel confident navigating them in person."
                                }
                            ].map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + index * 0.2 }}
                                    className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                        {step.step}
                                    </div>
                                    <div className="text-4xl mb-4">{step.icon}</div>
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                                    <p className="text-lg text-indigo-600 mb-4 font-medium">{step.description}</p>
                                    <p className="text-gray-600">{step.details}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Learning Scenarios */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Practice Real-World Scenarios
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: "🍽️",
                                    title: "Ordering Food",
                                    description: "Learn local dining customs, how to ask questions about dishes, and navigate different restaurant cultures."
                                },
                                {
                                    icon: "🤝",
                                    title: "Making Friends",
                                    description: "Understand social norms, conversation starters, and how to build relationships in different cultural contexts."
                                },
                                {
                                    icon: "💼",
                                    title: "Joining Meetings",
                                    description: "Master business etiquette, meeting protocols, and professional communication styles across cultures."
                                },
                                {
                                    icon: "🛍️",
                                    title: "Shopping & Negotiating",
                                    description: "Practice market interactions, bargaining customs, and polite ways to inquire about products and prices."
                                },
                                {
                                    icon: "🚇",
                                    title: "Using Transportation",
                                    description: "Navigate public transport, ask for directions, and understand local travel etiquette and customs."
                                },
                                {
                                    icon: "🏠",
                                    title: "Social Gatherings",
                                    description: "Learn about gift-giving customs, appropriate topics of conversation, and social interaction norms."
                                }
                            ].map((scenario, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.0 + index * 0.1 }}
                                    className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="text-3xl mb-4">{scenario.icon}</div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{scenario.title}</h3>
                                    <p className="text-gray-600">{scenario.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Learning Benefits */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4, duration: 0.8 }}
                        className="mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            What You&apos;ll Learn
                        </h2>
                        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-4xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Cultural Understanding:</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3 mt-2"></span>
                                            <span className="text-gray-700">Social customs and etiquette</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-purple-600 rounded-full mr-3 mt-2"></span>
                                            <span className="text-gray-700">Business and professional norms</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-pink-600 rounded-full mr-3 mt-2"></span>
                                            <span className="text-gray-700">Communication styles and preferences</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2"></span>
                                            <span className="text-gray-700">Non-verbal communication cues</span>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Language Skills:</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3 mt-2"></span>
                                            <span className="text-gray-700">Practical phrases and expressions</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-purple-600 rounded-full mr-3 mt-2"></span>
                                            <span className="text-gray-700">Appropriate tone and formality levels</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-pink-600 rounded-full mr-3 mt-2"></span>
                                            <span className="text-gray-700">Context-sensitive communication</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2"></span>
                                            <span className="text-gray-700">Confident conversation skills</span>
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
                        transition={{ delay: 1.8, duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Ready to Start Your Cultural Journey?
                        </h2>
                        <p className="text-lg text-gray-600 mb-8">
                            Begin practicing conversations and building your cultural confidence today.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/emotional/chat"
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                Start Learning
                            </Link>
                            <Link
                                href="/emotional/features"
                                className="border-2 border-indigo-600 text-indigo-600 font-semibold py-3 px-8 rounded-full hover:bg-indigo-50 transition-all duration-300"
                            >
                                Explore Features
                            </Link>
                        </div>
                    </motion.section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default EmotionalHowItWorksPage;
