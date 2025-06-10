'use client';

import React from 'react';
import { motion } from "framer-motion";
import Header from '@/components/sub-header';
import Footer from '@/components/footer';

const TravelHowItWorksPage = () => {
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
                            How Travel Buddy Works
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
                            From planning to landing, here&apos;s how Buddy AI transforms your travel experience into something seamless and smart.
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
                            Three Simple Steps
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    step: "1",
                                    title: "Plan",
                                    subtitle: "Tell your travel style, dates and budget.",
                                    description: "Share your preferences, travel dates, budget range, and what kind of experience you&apos;re looking for.",
                                    icon: "🗺️"
                                },
                                {
                                    step: "2",
                                    title: "Optimize",
                                    subtitle: "Instant AI itinerary with flights, hotels and hidden gems.",
                                    description: "Get a personalized itinerary with perfectly timed flights, curated accommodations, and local secrets.",
                                    icon: "⚡"
                                },
                                {
                                    step: "3",
                                    title: "Adapt",
                                    subtitle: "Live updates on delays, weather, local events.",
                                    description: "Stay informed with real-time adjustments, weather alerts, and spontaneous local opportunities.",
                                    icon: "🔄"
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
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                                    <p className="text-lg font-medium text-indigo-600 mb-4">{step.subtitle}</p>
                                    <p className="text-gray-600">{step.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TravelHowItWorksPage;
