// Dashboard.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import MedicineIdentifier from "./MedicineIdentifier";
import PillIdentifier from "./PillIdentifier";
import SymptomChecker from "./SymptomChecker";
import DocumentManager from "./DocumentManager";
import HealthOverviewAnalytics from "./HealthOverviewAnalytics"; // Add this line
import LifestyleAnalytics from "./LifestyleAnalytics";
import GuidedMeditation from "./GuidedMeditation";
import NutritionGuide from "./NutritionGuide"; // Import Nutrition Guide component
import HealthCalendar from "./HealthCalendar";
import {
  FaHeart, FaBed, FaRunning, FaWeight, FaCog, FaUser, FaMoon, FaSun, FaTimes, FaHome,
  FaChartLine, FaCapsules, FaSearch, FaRobot, FaOm, FaCalendarAlt, FaUtensils, FaArrowLeft, FaFileUpload, // FaUtensils for Nutrition, FaFileUpload for Document Upload
  FaAppleAlt
} from "react-icons/fa";
import { MdSelfImprovement } from 'react-icons/md';
import { GiStrong } from 'react-icons/gi';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import clsx from "clsx";
import { v4 as uuidv4 } from 'uuid';



const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ProgressRing Component - Displays a circular progress bar
function ProgressRing({ radius, stroke, progress, color }) {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} className="mx-auto">
      <circle
        stroke="#e5e7eb" // Background circle color
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke={color} // Progress circle color
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.35s ease-in-out' }} // Smooth transition for progress
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <text
        x="50%"
        y="50%"
        dy="0.3em" // Adjust vertical alignment
        textAnchor="middle"
        fontWeight="bold"
        fontSize="1.5rem"
        fill={color}
      >
        {Math.round(progress)}%
      </text>
    </svg>
  );
}

// MetricCard Component - Displays a key health metric with an update option
function MetricCard({ icon, label, value, onUpdate, type, unit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState(value);

  const handleSave = () => {
    onUpdate(type, parseFloat(newValue)); // Assuming numeric values for health metrics
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-3 bg-green-50 dark:bg-gray-700 rounded-xl p-4 shadow">
      <div className="text-green-500 text-3xl">{icon}</div>
      <div className="flex-grow">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</p>
        {isEditing ? (
          <input
            type="number"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            className="w-24 p-1 rounded-md border border-gray-300 dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-white"
            autoFocus
          />
        ) : (
          <p className="text-lg font-bold text-gray-900 dark:text-white cursor-pointer" onClick={() => setIsEditing(true)}>
            {value} {unit}
          </p>
        )}
      </div>
      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors duration-200 text-sm font-medium"
          aria-label={`Edit ${label}`}
        >
          Update
        </button>
      )}
    </div>
  );
}

// ReminderAlert Component - Displays upcoming reminders as a floating alert
function ReminderAlert({ reminders, onClose }) {
  if (reminders.length === 0) return null; // Don't show if no upcoming reminders

  return (
    <div className="fixed bottom-6 right-6 max-w-xs bg-green-600 text-white rounded-xl shadow-lg p-4 z-50 animate-slideIn">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold">Upcoming Reminders</h4>
        <button onClick={onClose} aria-label="Close reminder alert" className="hover:text-green-300">
          <FaTimes />
        </button>
      </div>
      <ul className="list-disc list-inside max-h-40 overflow-y-auto text-sm pr-2 custom-scrollbar">
        {reminders.map((r) => (
          <li key={r._id || uuidv4()}>
            <strong>{r.title}</strong> due on {new Date(r.dueDate).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Modal Component
function Modal({ isOpen, onClose, children, title }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl max-w-md w-full mx-4 relative">
        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h3>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          aria-label="Close modal"
        >
          <FaTimes className="text-xl" />
        </button>
        {children}
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState({
  title: '',
  description: '',
  dueDate: new Date().toISOString().split('T')[0],
});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressTimeline, setProgressTimeline] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showReminderAlert, setShowReminderAlert] = useState(true);
  const [enableReminderNotifications, setEnableReminderNotifications] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [activePage, setActivePage] = useState("dashboard"); // For main content pages

  const [showProfileSetupModal, setShowProfileSetupModal] = useState(false);
  const [initialProfileData, setInitialProfileData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    heartRate: '',
    sleepHours: '',
    activeHours: '',
    weight: ''
  });

  const [userId, setUserId] = useState(() => {
    let storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      storedUserId = uuidv4();
      localStorage.setItem("userId", storedUserId);
    }
    console.log("Current userId:", storedUserId);
    return storedUserId;
  });

  // Updated pages array with correct icons and paths for a SPA
  const pages = [
    { id: uuidv4(), name: "Document Uploading", icon: <FaFileUpload />, pageKey: "documents" }, // Added Document Uploading
    { id: uuidv4(), name: "Medicine Identifier", icon: <FaCapsules />, pageKey: "medicine" },
    { id: uuidv4(), name: "Pill Identifier", icon: <FaSearch />, pageKey: "pill" }, // Changed icon
    { id: uuidv4(), name: "AI Symptom Identifier", icon: <FaRobot />, pageKey: "symptom" }, // Changed icon
    { id: uuidv4(), name: "Nutrition Guide", icon: <FaUtensils />, pageKey: "nutrition" }, // Changed icon
    { id: uuidv4(), name: "Health Calendar", icon: <FaCalendarAlt />, pageKey: "calendar" }, // Added Calendar
    { id: uuidv4(), name: "Health Overview Analytics", icon: <FaChartLine />, pageKey: "health" }, // Add this
    { id: uuidv4(), name: "Lifestyle & Wellness", icon: <GiStrong />, pageKey: "lifestyle" },
    { id: uuidv4(), name: "Guided Meditation", icon: <MdSelfImprovement />, pageKey: "meditation" }, 
    // Add this
  ];

  const scrollContainerRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setError("No user ID available. Please refresh or ensure proper setup.");
      setLoading(false);
      setShowProfileSetupModal(true);
      return;
    }
    try {
      const profileRes = await fetch(`http://localhost:5000/api/user/profile?userId=${userId}`);
      if (!profileRes.ok) {
        if (profileRes.status === 404) {
          setShowProfileSetupModal(true);
          setLoading(false);
          return;
        }
        throw new Error("Failed to fetch profile data.");
      }
      const profileData = await profileRes.json();
      setProfile(profileData);
      console.log("Fetched Profile Data:", profileData);

      const remindersRes = await fetch(`http://localhost:5000/api/reminders?userId=${userId}`);
      if (!remindersRes.ok) throw new Error("Failed to fetch reminders.");
      const remindersData = await remindersRes.json();
      setReminders(remindersData);
      console.log("Fetched Reminders Data:", remindersData);

      const timeline = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 86400000);
        timeline.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: Math.min(100, Math.max(0, (profileData.healthScore || 70) + (Math.random() * 10 - 5))),
        });
      }
      setProgressTimeline(timeline);
    } catch (err) {
      console.error("Dashboard data fetching error:", err);
      setError(`Error loading data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [userId]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProfileSetupSubmit = async () => {
    if (!initialProfileData.name || !initialProfileData.email) {
      setError("Please enter your Name and Email.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`http://localhost:5000/api/user/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...initialProfileData }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save profile.");
      }
      const newProfile = await res.json();
      setProfile(newProfile);
      setShowProfileSetupModal(false);
      setLoading(false);
      fetchData();
    } catch (e) {
      console.error(`Error saving profile: ${e.message}`);
      setError(`Error saving profile: ${e.message}`);
      setLoading(false);
    }
  };

  const handleUpdateMetric = async (metricType, value) => {
    if (!profile || !userId) return;
    const updatedProfile = { ...profile, [metricType]: value };
    try {
      setError(null);
      const res = await fetch(`http://localhost:5000/api/user/profile?userId=${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to update ${metricType}.`);
      }
      const newProfile = await res.json();
      setProfile(newProfile);
    } catch (e) {
      console.error(`Error updating ${metricType}: ${e.message}`);
      setError(`Error updating ${metricType}: ${e.message}`);
    }
  };


  const calculateHealthScore = (p) => {
    if (!p) return 0;
    const sleepScore = Math.min((p.sleepHours || 0) / 8, 1) * 40;
    const activeScore = Math.min((p.activeHours || 0) / 5, 1) * 30;
    const heartRateScore = Math.max(0, 20 - Math.abs((p.heartRate || 70) - 70) * 0.5);
    const weightScore = Math.max(0, 10 - Math.abs((p.weight || 70) - 70) * 0.3);
    return Math.min(100, sleepScore + activeScore + heartRateScore + weightScore);
  };

  const handleAddReminder = async () => {
    if (!newReminder.title || !newReminder.dueDate) {
      setError("Please enter a title and due date for the reminder.");
      return;
    }
    try {
      setError(null);
      const res = await fetch(`http://localhost:5000/api/reminders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newReminder, userId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add reminder.");
      }
      const created = await res.json();
      setReminders([...reminders, created]);
      setNewReminder({ title: "", description: "", dueDate: "" });
    } catch (e) {
      console.error(`Error adding reminder: ${e.message || "Unknown error"}`);
      setError(`Error adding reminder: ${e.message || "Unknown error"}`);
    }
  };

  if (loading && !profile && !showProfileSetupModal) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <p className="text-xl animate-pulse text-gray-700 dark:text-white">Loading your dashboard...</p>
    </div>
  );

  const renderError = () => {
    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <svg onClick={() => setError(null)} className="fill-current h-6 w-6 text-red-500 cursor-pointer" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.103l-2.651 3.746a1.2 1.2 0 0 1-1.697-1.697l3.746-2.651-3.746-2.651a1.2 1.2 0 0 1 1.697-1.697L10 8.897l2.651-3.746a1.2 1.2 0 0 1 1.697 1.697L11.103 10l3.746 2.651a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </span>
        </div>
      );
    }
    return null;
  };


  const healthScore = calculateHealthScore(profile);

  const now = new Date();
  const twoDaysLater = new Date();
  twoDaysLater.setDate(now.getDate() + 2);
  twoDaysLater.setHours(23, 59, 59, 999);

  const upcomingReminders = reminders.filter((r) => {
    const due = new Date(r.dueDate);
    return due >= now && due <= twoDaysLater;
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));


  // --- Left Sidebar Tab Contents ---

  const ProfileTab = () => (
    <>
      <div
        className={clsx(
          "mb-6 flex items-center space-x-3",
          activeTab === "profile" ? "text-green-600 font-bold" : "text-gray-500"
        )}
      >
        <FaUser className="text-3xl" />
        <h2 className="text-xl text-gray-900 dark:text-white">{profile?.name || "Guest"}</h2>
      </div>

      <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-3"><FaHeart className="text-lg text-red-500" /> Email: {profile?.email || 'N/A'}</div>
        <div className="flex items-center gap-3"><FaBed className="text-lg text-blue-500" /> Age: {profile?.age || 'N/A'}</div>
        <div className="flex items-center gap-3"><FaRunning className="text-lg text-yellow-600" /> Gender: {profile?.gender || 'N/A'}</div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Reminders</h3>
        <div className="space-y-3 max-h-52 overflow-auto pr-2 custom-scrollbar">
          {reminders.length > 0 ? (
            reminders.map((r) => (
              <div key={r._id || uuidv4()} className="bg-green-50 dark:bg-gray-700 border border-green-200 dark:border-gray-600 rounded-xl p-3">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white" >{r.title}</h4>
                <p className="text-xs text-gray-700 dark:text-gray-300">{r.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Due: {new Date(r.dueDate).toLocaleDateString()}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No reminders set yet.</p>
          )}
        </div>

        <div className="mt-6 space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">Add New Reminder</h4>
          <input
            className="w-full p-2 rounded-md border border-gray-300 dark:bg-gray-900 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-green-500 focus:border-green-500"
            placeholder="Title"
            type="text"
            value={newReminder.title}
            onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
          />
          <textarea
            className="w-full p-2 rounded-md border border-gray-300 dark:bg-gray-900 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-green-500 focus:border-green-500"
            placeholder="Description (optional)"
            type="text"
            rows="2"
            value={newReminder.description}
            onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
          />
          <input
            type="date"
            className="w-full p-2 rounded-md border border-gray-300 dark:bg-gray-900 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-green-500 focus:border-green-500"
            value={formatDateForInput(newReminder.dueDate)}
            onChange={(e) => setNewReminder({ ...newReminder, dueDate: e.target.value })}
          />
          <button
            onClick={handleAddReminder}
            className="bg-green-600 text-white px-4 py-2 rounded-md w-full hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Add Reminder
          </button>
        </div>
      </div>
    </>
  );

  const SettingsTab = () => (
    <>
      <div
        className={clsx(
          "mb-6 flex items-center space-x-3",
          activeTab === "settings" ? "text-green-600 font-bold" : "text-gray-500"
        )}
      >
        <FaCog className="text-3xl" />
        <h2 className="text-xl text-gray-900 dark:text-white">Settings</h2>
      </div>

      <div className="text-gray-700 dark:text-gray-300">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Appearance</h3>
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
          <span>Dark Mode</span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={clsx(
              "px-4 py-2 rounded-md transition-colors duration-200",
              darkMode
                ? "bg-yellow-500 text-gray-900 hover:bg-yellow-600"
                : "bg-gray-700 text-white hover:bg-gray-800"
            )}
            aria-label={`Toggle dark mode: currently ${darkMode ? 'enabled' : 'disabled'}`}
          >
            {darkMode ? <FaSun className="inline-block mr-2" /> : <FaMoon className="inline-block mr-2" />}
            {darkMode ? "Disable" : "Enable"}
          </button>
        </div>

        <h3 className="text-lg font-semibold mb-3 mt-6 text-gray-900 dark:text-white">Notifications</h3>
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
          <span>Enable Reminder Alerts</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              value=""
              className="sr-only peer"
              checked={enableReminderNotifications}
              onChange={() => setEnableReminderNotifications(!enableReminderNotifications)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-900 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300 sr-only">Toggle Reminder Alerts</span>
          </label>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          More settings coming soon...
        </p>
      </div>
    </>
  );

  // --- Main Content Pages ---

  const DashboardContent = () => (
    <>
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900 dark:text-white">Welcome, {profile?.name || "User"}!</h1>

      {/* Health Score and Explore Features Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col lg:grid lg:grid-cols-3 gap-6 items-center">
        {/* Overall Health Score */}
        <div className="flex flex-col items-center justify-center p-4">
          <h2 className="font-semibold text-xl mb-3 text-gray-900 dark:text-white">Overall Health Score</h2>
          <ProgressRing
            radius={100}
            stroke={12}
            progress={healthScore}
            color="#10b981"
          />
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Based on your reported metrics.</p>
        </div>

        {/* Horizontal Scrollable List of Pages (Explore Features) */}
        <div className="lg:col-span-2 flex flex-col justify-center w-full px-4 lg:px-0">
          <h2 className="font-semibold text-xl mb-3 text-gray-900 dark:text-white">Explore Features</h2>
          <div className="overflow-x-auto whitespace-nowrap scroll-smooth py-2 -mx-4 px-4 custom-scrollbar">
            {/* The primary dashboard navigation buttons */}
            <button
              className={clsx(
                "inline-flex flex-col items-center justify-center min-w-[120px] h-28 p-3 mr-4 rounded-xl",
                "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
                "hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-800 dark:hover:text-white",
                "transition-colors duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2",
                activePage === "dashboard" && "bg-green-200 dark:bg-green-600 text-green-800 dark:text-white"
              )}
              onClick={() => setActivePage("dashboard")}
              aria-label="Go to Dashboard"
            >
              <span className="text-4xl text-green-600 dark:text-green-400 mb-2"><FaHome /></span>
              <span className="text-sm font-medium text-center">Dashboard</span>
            </button>
            
            {/* Dynamically render other feature buttons from the 'pages' array */}
            {pages.map((page) => (
              <button
                key={page.id}
                className={clsx(
                  "inline-flex flex-col items-center justify-center min-w-[120px] h-28 p-3 mr-4 rounded-xl",
                  "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
                  "hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-800 dark:hover:text-white",
                  "transition-colors duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2",
                  activePage === page.pageKey && "bg-green-200 dark:bg-green-600 text-green-800 dark:text-white"
                )}
                onClick={() => setActivePage(page.pageKey)}
                aria-label={`Go to ${page.name}`}
              >
                <span className="text-4xl text-green-600 dark:text-green-400 mb-2">{page.icon}</span>
                <span className="text-sm font-medium text-center">{page.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Health Metrics Section */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Your Key Health Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard icon={<FaHeart />} label="Heart Rate" value={profile?.heartRate || 'N/A'} unit="bpm" type="heartRate" onUpdate={handleUpdateMetric} />
          <MetricCard icon={<FaBed />} label="Sleep Hours" value={profile?.sleepHours || 'N/A'} unit="hrs" type="sleepHours" onUpdate={handleUpdateMetric} />
          <MetricCard icon={<FaRunning />} label="Active Hours" value={profile?.activeHours || 'N/A'} unit="hrs" type="activeHours" onUpdate={handleUpdateMetric} />
          <MetricCard icon={<FaWeight />} label="Weight" value={profile?.weight || 'N/A'} unit="kg" type="weight" onUpdate={handleUpdateMetric} />
        </div>
      </section>

      {/* Health Score Over Time Chart */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Health Score Over Time (Last 7 Days)</h2>
        {progressTimeline.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={progressTimeline} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <XAxis
                dataKey="date"
                stroke={darkMode ? "#9ca3af" : "#374151"}
                tickLine={false}
                axisLine={{ stroke: darkMode ? "#4b5563" : "#e5e7eb" }}
              />
              <YAxis
                domain={[0, 100]}
                stroke={darkMode ? "#9ca3af" : "#374151"}
                tickLine={false}
                axisLine={{ stroke: darkMode ? "#4b5563" : "#e5e7eb" }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3', stroke: darkMode ? "#6b7280" : "#9ca3af" }}
                contentStyle={{
                  backgroundColor: darkMode ? "#1f2937" : "#fff",
                  borderColor: darkMode ? "#4b5563" : "#ddd",
                  color: darkMode ? "#d1d5db" : "#111",
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                labelStyle={{ color: darkMode ? "#d1d5db" : "#111" }}
                itemStyle={{ color: '#10b981' }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 5, fill: '#10b981', stroke: 'white', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#059669', stroke: 'white', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">No health score data available for the timeline.</p>
        )}
      </section>
    </>
  );

  return (
    <div className={clsx("min-h-screen flex", darkMode ? "dark bg-gray-900 text-white" : "bg-gray-100 text-black")}>
      {/* Profile Setup Modal */}
      <Modal isOpen={showProfileSetupModal && !profile} onClose={() => { /* Can't close until profile is set */ }} title="Welcome! Set Up Your Profile">
        <p className="text-gray-700 dark:text-gray-300 mb-4">Let's get started by setting up your basic profile information.</p>
        <div className="space-y-3">
          <input
            className="w-full p-2 rounded-md border border-gray-300 dark:bg-gray-900 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Your Name"
            value={initialProfileData.name}
            onChange={(e) => setInitialProfileData({ ...initialProfileData, name: e.target.value })}
            required
          />
          <input
            type="email"
            className="w-full p-2 rounded-md border border-gray-300 dark:bg-gray-900 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Your Email"
            value={initialProfileData.email}
            onChange={(e) => setInitialProfileData({ ...initialProfileData, email: e.target.value })}
            required
          />
          <input
            type="number"
            className="w-full p-2 rounded-md border border-gray-300 dark:bg-gray-900 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Age (e.g., 30)"
            value={initialProfileData.age}
            onChange={(e) => setInitialProfileData({ ...initialProfileData, age: parseInt(e.target.value) || '' })}
          />
            <select
            className="w-full p-2 rounded-md border border-gray-300 dark:bg-gray-900 dark:border-gray-600 text-gray-900 dark:text-white"
            value={initialProfileData.gender}
            onChange={(e) => setInitialProfileData({ ...initialProfileData, gender: e.target.value })}
            >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            </select>
          <input
            type="number"
            className="w-full p-2 rounded-md border border-gray-300 dark:bg-gray-900 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Current Weight in kg (e.g., 70)"
            value={initialProfileData.weight}
            onChange={(e) => setInitialProfileData({ ...initialProfileData, weight: parseFloat(e.target.value) || '' })}
          />
          <input
            type="number"
            className="w-full p-2 rounded-md border border-gray-300 dark:bg-gray-900 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Sleep Hours per night (e.g., 7)"
            value={initialProfileData.sleepHours}
            onChange={(e) => setInitialProfileData({ ...initialProfileData, sleepHours: parseFloat(e.target.value) || '' })}
          />
          <input
            type="number"
            className="w-full p-2 rounded-md border border-gray-300 dark:bg-gray-900 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Active Hours per day (e.g., 1.5)"
            value={initialProfileData.activeHours}
            onChange={(e) => setInitialProfileData({ ...initialProfileData, activeHours: parseFloat(e.target.value) || '' })}
          />
          <input
            type="number"
            className="w-full p-2 rounded-md border border-gray-300 dark:bg-gray-900 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Resting Heart Rate (e.g., 70)"
            value={initialProfileData.heartRate}
            onChange={(e) => setInitialProfileData({ ...initialProfileData, heartRate: parseFloat(e.target.value) || '' })}
          />

          <button
            onClick={handleProfileSetupSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded-md w-full hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Save Profile
          </button>
        </div>
      </Modal>

      {/* Left Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl rounded-r-3xl p-6 flex flex-col justify-between z-30 transform transition-transform duration-300 ease-in-out">
        {/* Profile Info */}
        {profile && (
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-green-600 dark:text-green-400">{profile.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-300">{profile.email}</p>
          </div>
        )}

        {/* Tab Headers for Left Sidebar */}
        <nav className="flex mb-6 space-x-6">
          <button
            className={clsx(
              "flex items-center gap-2 font-semibold text-base py-2 px-3 rounded-md transition-colors duration-200",
              activeTab === "profile"
                ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
                : "text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400"
            )}
            onClick={() => setActiveTab("profile")}
            aria-label="View Profile"
          >
            <FaUser className="text-xl" /> Profile
          </button>
          <button
            className={clsx(
              "flex items-center gap-2 font-semibold text-base py-2 px-3 rounded-md transition-colors duration-200",
              activeTab === "settings"
                ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
                : "text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400"
            )}
            onClick={() => setActiveTab("settings")}
            aria-label="View Settings"
          >
            <FaCog className="text-xl" /> Settings
          </button>
        </nav>

        <div className="overflow-y-auto flex-grow pb-4 custom-scrollbar">
          {activeTab === "profile" ? <ProfileTab /> : <SettingsTab />}
        </div>

        {/* Dark mode toggle bottom */}
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-between text-gray-500 dark:text-gray-400">
          <div className="flex gap-2 items-center cursor-pointer hover:text-green-500 dark:hover:text-green-400 transition-colors duration-200" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <FaSun className="text-xl text-yellow-400" /> : <FaMoon className="text-xl text-gray-700" />}
            <span className="font-medium">Dark Mode</span>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-8 space-y-8 overflow-y-auto ml-80 transition-all duration-300 ease-in-out">
        {renderError()}
        {activePage === "dashboard" && <DashboardContent />}
        {activePage === "documents" && <DocumentManager onBackClick={() => setActivePage("dashboard")} />} {/* Render DocumentManager */}
        {activePage === "medicine" && <MedicineIdentifier onBackClick={() => setActivePage("dashboard")} />}
        {activePage === "pill" && <PillIdentifier onBackClick={() => setActivePage("dashboard")} />}
        {activePage === "symptom" && <SymptomChecker onBackClick={() => setActivePage("dashboard")} />}
        {activePage === "health" && <HealthOverviewAnalytics onBackClick={() => setActivePage("dashboard")} />}
        {activePage === "lifestyle" && <LifestyleAnalytics onBackClick={() => setActivePage("dashboard")} />}
        {activePage === "meditation" && <GuidedMeditation onBackClick={() => setActivePage("dashboard")} />}
        {activePage === "nutrition" && <NutritionGuide onBackClick={() => setActivePage("dashboard")} />}
        {activePage === "calendar" && <HealthCalendar onBackClick={() => setActivePage("dashboard")} />}


        {/* If none match, maybe show a 404 or default message */}
        {!["dashboard", "health","lifestyle", "documents", "medicine", "pill", "symptom", "meditation", "nutrition", "calendar"].includes(activePage) && (
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Page Not Found</h2>
            <p className="text-gray-700 dark:text-gray-300">
              The page you requested does not exist.
            </p>
            <button
                onClick={() => setActivePage("dashboard")}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200"
            >
                Back to Dashboard
            </button>
          </div>
        )}
      </main>

      {/* Reminder Alert (conditional rendering based on enableReminderNotifications) */}
      {enableReminderNotifications && showReminderAlert && upcomingReminders.length > 0 && (
        <ReminderAlert reminders={upcomingReminders} onClose={() => setShowReminderAlert(false)} />
      )}

      {/* Tailwind CSS custom styles (place this in your global CSS or as part of a <style> tag) */}
      <style>{`
        /* Animation for Reminder Alert */
        @keyframes slideIn {
          from {opacity: 0; transform: translateY(100%);}
          to {opacity: 1; transform: translateY(0);}
        }
        .animate-slideIn {
          animation: slideIn 0.4s ease forwards;
        }

        /* Custom Scrollbar for better aesthetics */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px; /* For horizontal scrollbars */
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f0f0f0; /* Light background for track */
          border-radius: 10px;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151; /* Dark background for track in dark mode */
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #a7a7a7; /* Gray thumb */
          border-radius: 10px;
          border: 2px solid #f0f0f0; /* Padding around thumb */
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #6b7280; /* Darker gray thumb in dark mode */
          border: 2px solid #374151;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #888; /* Darker gray on hover */
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #555;
        }
      `}</style>
    </div>
  );
}