import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Weight, Heart, Moon, Sun, Loader2, ArrowLeft, Dna, Activity } from 'lucide-react';
import clsx from 'clsx'; // For conditional classes

const BACKEND_URL = 'http://localhost:5000';

export default function ProfileSetup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [activeHours, setActiveHours] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // State for dark mode toggle

  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  // Basic check for userId on component mount
  useEffect(() => {
    if (!userId) {
      console.error("No userId found in localStorage. Redirecting to login.");
      // navigate('/login'); // Uncomment this line if you want to redirect
    }
  }, [userId, navigate]);

  // Handle dark mode toggle (can be global context later)
  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    // You might also want to save this preference in localStorage or a global state
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!userId) {
      setError("User not logged in. Please log in first.");
      setLoading(false);
      return;
    }

    // Basic validation for required fields
    if (!name || !email || !gender || !age || !weight || !sleepHours || !activeHours) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/user/profile`, {
        method: 'POST', // Or PUT if you are always updating an existing profile
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name,
          email,
          gender,
          age: Number(age),
          weight: Number(weight),
          heartRate: heartRate ? Number(heartRate) : null, // Heart rate can be optional
          sleepHours: Number(sleepHours),
          activeHours: Number(activeHours),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save profile');
      }

      // On success, go to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={clsx(
      "min-h-screen flex items-center justify-center p-6",
      "bg-gradient-to-br from-blue-50 via-green-50 to-purple-50",
      "dark:from-gray-900 dark:via-gray-800 dark:to-gray-700",
      "transition-colors duration-500 font-inter",
      { 'dark': darkMode }
    )}>
      <div className="relative w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 sm:p-10 md:p-12"> {/* Changed max-w-xl to max-w-3xl */}
        {/* Dark Mode Toggle */}
        <button
          onClick={handleDarkModeToggle}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 text-blue-600 hover:text-blue-800 flex items-center transition-colors duration-200 p-2 rounded-full bg-gray-100 shadow-md dark:bg-gray-700 dark:text-blue-400 dark:hover:text-blue-500"
        >
          <ArrowLeft className="mr-2" /> Back
        </button>

        <h2 className="text-4xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400">
          Setup Your Profile
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8 text-lg">
          Tell us a bit about yourself to personalize your MedWell 360 experience.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input for Name */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
            />
          </div>

          {/* Input for Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
            />
          </div>

          {/* Select for Gender */}
          <div className="relative">
            <Dna className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg appearance-none"
            >
              <option value="" disabled>Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {/* Custom arrow for select */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="fill-current h-4 w-4 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l1.414 1.414L15 10l-4.293-4.293-1.414 1.414L12.586 10z"/></svg>
            </div>
          </div>

          {/* Input for Age */}
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="number"
              placeholder="Age (Years)"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="0"
              required
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
            />
          </div>

          {/* Input for Weight */}
          <div className="relative">
            <Weight className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="number"
              placeholder="Weight (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="0"
              required
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
            />
          </div>

          {/* Input for Heart Rate (Optional) */}
          <div className="relative">
            <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="number"
              placeholder="Heart Rate (bpm, Optional)"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              min="0"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
            />
          </div>

          {/* Input for Sleep Hours */}
          <div className="relative">
            <Moon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="number"
              placeholder="Sleep Hours (per day)"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              min="0"
              step="0.1"
              required
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
            />
          </div>

          {/* Input for Active Hours */}
          <div className="relative">
            <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="number"
              placeholder="Active Hours (per day)"
              value={activeHours}
              onChange={(e) => setActiveHours(e.target.value)}
              min="0"
              step="0.1"
              required
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-center text-sm">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition duration-300 ease-in-out
                       disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                       flex items-center justify-center font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-3" size={24} /> Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}