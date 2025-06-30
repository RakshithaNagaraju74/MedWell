import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sun,
  Moon,
  FileText,    // For documents / vault
  Lightbulb,   // For AI Insights / Nutrition
  Shield,      // For Privacy
  Activity,    // For Health Dashboard / Analytics
  Brain,       // For Symptom Checker / AI interaction
  Headphones,  // For Mental Health / Meditation
  CircleDollarSign, // Optional: if you had a pricing/plans section later
} from 'lucide-react'; // Using lucide-react for modern icons

export default function Landing() {
  const [dark, setDark] = useState(false);

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 text-gray-900 dark:text-white transition-colors duration-500 font-inter">
        {/* Navbar */}
        <nav className="flex justify-between items-center px-6 py-4 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-50">
          <h1 className="text-3xl font-extrabold text-green-600 tracking-tighter transform hover:scale-105 transition-transform duration-200">
            MedWell 360
          </h1>
          <div className="flex items-center gap-5">
            <Link
              to="/about"
              className="text-md font-medium text-gray-700 dark:text-gray-300 hover:text-green-500 transition-colors"
            >
              About
            </Link>
            <Link
              to="/login"
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-md font-semibold
                shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/60 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full text-md font-semibold
                shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Register
            </Link>
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              aria-label="Toggle Dark Mode"
            >
              {dark ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex flex-col justify-center items-center text-center px-6 py-24 sm:py-32 max-w-7xl mx-auto min-h-[calc(100vh-90px)]">
          <h2 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight max-w-4xl bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400">
            Your Health, Simplified. 
          </h2>
          <p className="max-w-xl text-xl text-gray-700 dark:text-gray-300 mb-10 leading-relaxed">
            Store, manage, and understand your health effortlessly with smart AI tools designed for you by **MedWell 360**.
          </p>

          <div className="flex gap-4">
            <Link
              to="/register"
              className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full text-lg font-semibold
                shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/60 transition-all duration-300 transform hover:-translate-y-1"
            >
              Get Started Now
            </Link>
            <Link
              to="/about"
              className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-full text-lg font-semibold
                hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1"
            >
              Learn More
            </Link>
          </div>
        </main>

        {/* Key Features Section */}
        <section className="bg-gray-100 dark:bg-gray-800 py-20 px-6">
          <h2 className="text-4xl font-extrabold text-center mb-16 text-green-700 dark:text-green-400">
            Intelligent Features for a Healthier You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {[
              {
                icon: <FileText size={48} className="text-green-500 mb-6" />,
                title: "Smart Document Vault",
                description: "AI-powered organization for prescriptions, reports, and scans. Effortlessly manage your health records."
              },
              {
                icon: <Brain size={48} className="text-blue-500 mb-6" />,
                title: "AI Symptom Checker",
                description: "Describe your symptoms and get instant, intelligent suggestions for possible conditions and next steps."
              },
              {
                icon: <Activity size={48} className="text-purple-500 mb-6" />,
                title: "Real-Time Health Dashboard",
                description: "Visualize your vitals, medications, appointments, and wellness trends with insightful graphs."
              },
              {
                icon: <Headphones size={48} className="text-teal-500 mb-6" />,
                title: "Mental Wellness & Meditation",
                description: "Track your mood, journal thoughts, and access guided meditations and calming AI chat support."
              },
              {
                icon: <Lightbulb size={48} className="text-yellow-500 mb-6" />,
                title: "Personalized Nutrition Guide",
                description: "Receive AI-powered dietary suggestions on what to eat and avoid for your health goals."
              },
              {
                icon: <Shield size={48} className="text-gray-500 mb-6" />,
                title: "Secure & Private Data",
                description: "Your health data is encrypted and securely stored. Your privacy is our top priority, always."
              }
            ].map((feature, index) => (
              <article
                key={index}
                className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-xl flex flex-col items-center text-center
                           transform hover:scale-105 transition-all duration-300 cursor-pointer border border-transparent hover:border-green-400"
              >
                {feature.icon}
                <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-md text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="bg-gradient-to-r from-green-500 to-blue-500 dark:from-green-700 dark:to-blue-700 text-white py-20 px-6 text-center">
          <h2 className="text-4xl font-extrabold mb-6">Start Your Health Journey Today!</h2>
          <p className="text-xl max-w-2xl mx-auto mb-10">
            Join **MedWell 360** and take control of your health with intelligent, personalized support.
          </p>
          <Link
            to="/register"
            className="px-10 py-4 bg-white text-green-600 rounded-full text-lg font-bold
              shadow-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
          >
            Sign Up for Free
          </Link>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 py-8 px-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} **MedWell 360**. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-4">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}