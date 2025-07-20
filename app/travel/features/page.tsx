'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from "framer-motion";
import Header from '@/components/sub-header';
import Footer from '@/components/footer';

const TravelFeaturesPage = () => {
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
                title="Buddy AI | Travel Companion"
                chat_url="/travel/chat"
                features_url="/travel/features"
                how_it_works_url="/travel/how-it-works"
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
                            Travel Companion Features
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
                            Discover the powerful features that make Buddy AI your ultimate travel companion, from planning to landing.
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
                                    icon: "🎯",
                                    title: "Personalized Itineraries",
                                    description: "AI-crafted plans tailored to your interests, pace, and budget preferences."
                                },
                                {
                                    icon: "🚨",
                                    title: "Real-Time Alerts",
                                    description: "Instant notifications for flights, weather changes, and traffic updates."
                                },
                                {
                                    icon: "💎",
                                    title: "Hidden Gems & Local Tips",
                                    description: "We dig through millions of reviews to find that special spot only locals know about."
                                },
                                {
                                    icon: "👥",
                                    title: "Collaborative Planning",
                                    description: "Invite friends or family to edit and share your travel plans seamlessly."
                                },
                                {
                                    icon: "🔗",
                                    title: "Booking Integration",
                                    description: "Book flights, hotels, and activities all in one unified interface."
                                },
                                {
                                    icon: "📱",
                                    title: "Offline Access & Calendar Sync",
                                    description: "Access your plans offline and sync with your favorite calendar apps."
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

                    {/* Extended AI Features */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Extended AI Features
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                {
                                    icon: "🎤",
                                    title: "Voice-Enabled Chatbot",
                                    description: "Talk to your travel companion naturally. Ask questions, make changes, and get recommendations using just your voice.",
                                    highlight: "Hands-free planning"
                                },
                                {
                                    icon: "🌍",
                                    title: "Multilingual Support",
                                    description: "Communicate in over 50 languages. Get local recommendations and cultural insights in your preferred language.",
                                    highlight: "50+ languages"
                                },
                                {
                                    icon: "🧠",
                                    title: "Adaptive Learning",
                                    description: "The more you travel, the smarter it gets. Buddy AI learns your preferences and improves recommendations over time.",
                                    highlight: "Personalized intelligence"
                                },
                                {
                                    icon: "💰",
                                    title: "Booking Price Alerts",
                                    description: "Track prices like Kayak and Expedia. Get notified when flight and hotel prices drop for your desired destinations.",
                                    highlight: "Smart price tracking"
                                }
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.0 + index * 0.2 }}
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

                    {/* Use Case Scenarios */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4, duration: 0.8 }}
                        className="mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Perfect For Every Type of Traveler
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    persona: "Solo Explorer",
                                    icon: "🎒",
                                    scenario: "Weekend in Tokyo, fast-paced, flexible.",
                                    description: "Sarah wants a spontaneous Tokyo weekend. Buddy AI creates a flexible itinerary that adapts to her energy levels, suggests the best ramen spots, and alerts her to pop-up events happening nearby.",
                                    features: ["Flexible scheduling", "Solo-friendly venues", "Real-time event alerts", "Safety recommendations"]
                                },
                                {
                                    persona: "Couples Retreat",
                                    icon: "💕",
                                    scenario: "Romantic getaway with tailored dining recommendations.",
                                    description: "Mark and Lisa want a romantic Paris escape. Buddy AI curates intimate restaurants, suggests sunset spots, and even books couples&apos; spa treatments based on their preferences.",
                                    features: ["Romantic venues", "Couples activities", "Fine dining reservations", "Privacy-focused options"]
                                },
                                {
                                    persona: "Family Trip",
                                    icon: "👨‍👩‍👧‍👦",
                                    scenario: "Kid-friendly, multiple destinations, shared planning.",
                                    description: "The Johnson family plans a multi-city European adventure. Buddy AI coordinates kid-friendly activities, manages complex logistics, and lets everyone contribute to the shared itinerary.",
                                    features: ["Kid-friendly activities", "Multi-destination planning", "Family collaboration", "Educational experiences"]
                                }
                            ].map((useCase, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.6 + index * 0.2 }}
                                    className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="text-center mb-6">
                                        <div className="text-5xl mb-4">{useCase.icon}</div>
                                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">{useCase.persona}</h3>
                                        <p className="text-lg font-medium text-indigo-600 mb-4">&quot;{useCase.scenario}&quot;</p>
                                    </div>
                                    <p className="text-gray-600 mb-6">{useCase.description}</p>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-gray-800 mb-3">Key Features:</h4>
                                        <ul className="space-y-2">
                                            {useCase.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-center">
                                                    <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
                                                    <span className="text-gray-700">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Demo / Interactive Preview */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.2, duration: 0.8 }}
                        className="mb-16"
                    >
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white text-center">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                                Ready to See It in Action?
                            </h2>
                            <p className="text-xl mb-8 opacity-90">
                                Experience the power of AI-driven travel planning firsthand.
                            </p>
                            <Link
                                href="/travel/chat"
                                className="inline-block bg-white text-indigo-600 font-semibold py-4 px-10 rounded-full text-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-gray-50"
                            >
                                See it in action
                            </Link>
                            <div className="mt-8 pt-8 border-t border-white/20">
                                <p className="text-lg opacity-80">
                                    Built with ❤️ by world explorers
                                </p>
                            </div>
                        </div>
                    </motion.section>

                    {/* CTA Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.6, duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Transform Your Travel Experience Today
                        </h2>
                        <p className="text-lg text-gray-600 mb-8">
                            Join thousands of travelers who&apos;ve discovered smarter, more enjoyable travel planning.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/travel/chat"
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                Start Planning
                            </Link>
                            <Link
                                href="/travel/how-it-works"
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

export default TravelFeaturesPage;
