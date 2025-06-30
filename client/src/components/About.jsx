import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sun,
  Moon,
  Leaf, // For wellness/natural approach
  HeartHandshake, // For care/support
  Lightbulb, // For innovation/AI
  Lock, // For security
  Globe, // For comprehensiveness (360)
  ArrowLeft, // For back button
} from 'lucide-react'; // Ensure you have lucide-react installed

export default function About() {
  const [dark, setDark] = useState(false); // State for dark mode, consistent with Landing

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 text-gray-900 dark:text-white transition-colors duration-500 font-inter">

        {/* Navbar - Simplified for About Page */}
        <nav className="flex justify-between items-center px-6 py-4 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-50">
          <h1 className="text-3xl font-extrabold text-green-600 tracking-tighter">
            MedWell 360
          </h1>
          <div className="flex items-center gap-5">
            {/* Back to Home button */}
            <Link
              to="/" // Link back to the landing page
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-md font-semibold
                shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center"
            >
              <ArrowLeft size={18} className="mr-2" /> Back to Home
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

        {/* About Content */}
        <main className="px-6 py-16 sm:py-24 max-w-7xl mx-auto flex flex-col items-center text-center">
          <h2 className="text-5xl sm:text-6xl font-extrabold mb-8 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400">
            About MedWell 360
          </h2>
          <p className="max-w-3xl text-xl text-gray-700 dark:text-gray-300 mb-12 leading-relaxed">
            At MedWell 360, we believe that managing your health should be simple, intuitive, and empowering.
            We're building the future of personal health management by combining cutting-edge AI with a user-centric design.
          </p>

          {/* Mission & Vision */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl w-full mb-16">
            <article className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow transform hover:scale-105 cursor-default flex flex-col items-center text-center border-t-4 border-green-500">
              <Leaf size={48} className="text-green-500 mb-6" />
              <h3 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-4">Our Mission</h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                To empower individuals to take proactive control of their well-being by providing a comprehensive, intelligent, and secure platform for all their health needs.
              </p>
            </article>

            <article className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow transform hover:scale-105 cursor-default flex flex-col items-center text-center border-t-4 border-blue-500">
              <Globe size={48} className="text-blue-500 mb-6" />
              <h3 className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-4">Our Vision</h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                To be the most trusted and essential companion in everyone's health journey, simplifying complex information and fostering a holistic approach to wellness.
              </p>
            </article>
          </section>

          {/* Key Pillars */}
          <section className="mb-16 max-w-4xl w-full">
            <h3 className="text-4xl font-extrabold text-center text-green-700 dark:text-green-400 mb-12">
              The MedWell 360 Difference
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <HeartHandshake size={36} className="text-pink-500 mb-4" />,
                  title: "Holistic Care",
                  description: "From physical records to mental wellness, we cover every aspect of your health."
                },
                {
                  icon: <Lightbulb size={36} className="text-yellow-500 mb-4" />,
                  title: "Intelligent Insights",
                  description: "Leveraging cutting-edge AI to provide personalized suggestions and understanding."
                },
                {
                  icon: <Lock size={36} className="text-purple-500 mb-4" />,
                  title: "Unwavering Privacy",
                  description: "Your health data is sacred. We ensure top-tier encryption and security at all times."
                }
              ].map((pillar, index) => (
                <div key={index} className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg flex flex-col items-center text-center">
                  {pillar.icon}
                  <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{pillar.title}</h4>
                  <p className="text-md text-gray-600 dark:text-gray-300">{pillar.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Join Call to Action */}
          <section className="bg-gradient-to-r from-green-500 to-blue-500 dark:from-green-700 dark:to-blue-700 text-white py-16 px-6 rounded-2xl shadow-2xl max-w-4xl w-full text-center">
            <h3 className="text-3xl font-bold mb-6">Ready to Experience 360-Degree Wellness?</h3>
            <p className="text-lg max-w-2xl mx-auto mb-8">
              Join the MedWell 360 community today and take the first step towards a more informed and healthier you.
            </p>
            <Link
              to="/register"
              className="px-8 py-3 bg-white text-green-600 rounded-full text-lg font-bold
                shadow-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              Sign Up for Free
            </Link>
          </section>
        </main>

        {/* Footer - Consistent with Landing Page */}
        <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 py-8 px-6 text-center text-sm mt-10">
          <p>&copy; {new Date().getFullYear()} MedWell 360. All rights reserved.</p>
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