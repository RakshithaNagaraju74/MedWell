// LifestyleAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { FaRunning, FaBed, FaPlusCircle, FaExclamationTriangle, FaTimesCircle, FaArrowLeft, FaRegLightbulb } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import clsx from 'clsx';
import { getAuth } from 'firebase/auth'; // ✅ Firebase Auth

// Base URL for your API
const API_BASE_URL = 'http://localhost:5000'; // Replace if needed

export default function LifestyleAnalytics({ onBackClick }) {
  const [userEmail, setUserEmail] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [sleepData, setSleepData] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [loadingSleep, setLoadingSleep] = useState(true);
  const [errorActivity, setErrorActivity] = useState(null);
  const [errorSleep, setErrorSleep] = useState(null);

  // State for Add Activity Modal
  const [newActivity, setNewActivity] = useState({
    date: new Date().toISOString().split('T')[0],
    steps: '',
    activeMinutes: '',
    caloriesBurned: '',
    activityType: 'walking',
  });
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);

  // State for Add Sleep Modal
  const [newSleep, setNewSleep] = useState({
    date: new Date().toISOString().split('T')[0],
    durationHours: '',
    qualityRating: 3,
  });
  const [showAddSleepModal, setShowAddSleepModal] = useState(false);

  // Authenticate user and set email
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch data when userEmail is available
  useEffect(() => {
    if (userEmail) {
      fetchActivityData();
      fetchSleepData();
    }
  }, [userEmail]);

  // --- API Functions ---

  const fetchActivityData = async () => {
    setLoadingActivity(true);
    setErrorActivity(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/lifestyle/activity/${userEmail}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setActivityData(data);
    } catch (error) {
      console.error('Error fetching activity data:', error);
      setErrorActivity('Failed to fetch activity data. Please try again.');
    } finally {
      setLoadingActivity(false);
    }
  };

  const fetchSleepData = async () => {
    setLoadingSleep(true);
    setErrorSleep(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/lifestyle/sleep/${userEmail}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSleepData(data);
    } catch (error) {
      console.error('Error fetching sleep data:', error);
      setErrorSleep('Failed to fetch sleep data. Please try again.');
    } finally {
      setLoadingSleep(false);
    }
  };

  const handleAddActivity = async () => {
    if (!userEmail) {
      alert('User not logged in.');
      return;
    }
    setLoadingActivity(true);
    setErrorActivity(null);
    try {
      const payload = { ...newActivity, userId: userEmail };
      const response = await fetch(`${API_BASE_URL}/api/lifestyle/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      await fetchActivityData();
      resetActivityForm();
      setShowAddActivityModal(false);
    } catch (error) {
      console.error('Error adding activity:', error);
      setErrorActivity(`Failed to add activity: ${error.message}`);
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleDeleteActivity = async (id) => {
    setLoadingActivity(true);
    setErrorActivity(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/lifestyle/activity/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchActivityData();
    } catch (error) {
      console.error('Error deleting activity:', error);
      setErrorActivity('Failed to delete activity. Please try again.');
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleAddSleep = async () => {
    if (!userEmail) {
      alert('User not logged in.');
      return;
    }
    setLoadingSleep(true);
    setErrorSleep(null);
    try {
      const payload = { ...newSleep, userId: userEmail };
      const response = await fetch(`${API_BASE_URL}/api/lifestyle/sleep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      await fetchSleepData();
      resetSleepForm();
      setShowAddSleepModal(false);
    } catch (error) {
      console.error('Error adding sleep entry:', error);
      setErrorSleep(`Failed to add sleep entry: ${error.message}`);
    } finally {
      setLoadingSleep(false);
    }
  };

  const handleDeleteSleep = async (id) => {
    setLoadingSleep(true);
    setErrorSleep(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/lifestyle/sleep/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchSleepData();
    } catch (error) {
      console.error('Error deleting sleep entry:', error);
      setErrorSleep('Failed to delete sleep entry. Please try again.');
    } finally {
      setLoadingSleep(false);
    }
  };

  // --- Helper Functions ---

  const getQualityColor = (quality) => {
    if (quality >= 4) return 'text-green-500';
    if (quality >= 2) return 'text-yellow-500';
    return 'text-red-500';
  };

  const resetActivityForm = () => {
    setNewActivity({
      date: new Date().toISOString().split('T')[0],
      steps: '',
      activeMinutes: '',
      caloriesBurned: '',
      activityType: 'walking',
    });
  };

  const resetSleepForm = () => {
    setNewSleep({
      date: new Date().toISOString().split('T')[0],
      durationHours: '',
      qualityRating: 3,
    });
  };

  // --- Rendered Component ---

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onBackClick}
          className="mb-6 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center transition duration-200 ease-in-out"
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>
        <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-800 dark:text-white">Lifestyle Analytics</h1>

        {/* Activity Tracking Section */}
        <section className="mb-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold flex items-center text-gray-700 dark:text-gray-200">
              <FaRunning className="mr-3 text-green-500 text-3xl" /> Activity Tracking
            </h2>
            <button
              onClick={() => { setShowAddActivityModal(true); resetActivityForm(); }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-xl shadow-md transition duration-300 ease-in-out flex items-center"
            >
              <FaPlusCircle className="mr-2" /> Add Activity
            </button>
          </div>
          {loadingActivity ? (
            <div className="text-center py-12 text-lg text-gray-600 dark:text-gray-400">Loading activity data...</div>
          ) : errorActivity ? (
            <div className="text-center text-red-500 py-12 flex flex-col items-center justify-center">
              <FaExclamationTriangle className="text-5xl mb-4" />
              <div className="text-lg font-medium">{errorActivity}</div>
            </div>
          ) : activityData.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-lg">No activity entries yet. Add your first activity!</p>
          ) : (
            <>
              <div className="h-72 sm:h-96 w-full mb-8 bg-gray-50 dark:bg-gray-700 rounded-xl p-4 shadow-inner">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`} />
                    <Line type="monotone" dataKey="steps" stroke="#34D399" name="Steps" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="activeMinutes" stroke="#60A5FA" name="Active Minutes" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <h3 className="text-2xl font-semibold mb-5 text-gray-700 dark:text-gray-200">Recent Activities</h3>
              <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                  <thead className="bg-gray-200 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                    <tr>
                      <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Type</th>
                      <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Steps</th>
                      <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Active Mins</th>
                      <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Calories</th>
                      <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityData.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).map((entry) => (
                      <tr key={entry._id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 ease-in-out">
                        <td className="py-3 px-5 text-sm">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="py-3 px-5 text-sm capitalize">{entry.activityType}</td>
                        <td className="py-3 px-5 text-sm">{entry.steps}</td>
                        <td className="py-3 px-5 text-sm">{entry.activeMinutes}</td>
                        <td className="py-3 px-5 text-sm">{entry.caloriesBurned}</td>
                        <td className="py-3 px-5 text-sm">
                          <button
                            onClick={() => handleDeleteActivity(entry._id)} 
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center transition duration-200 ease-in-out"
                          >
                            <FaTimesCircle className="inline-block mr-1" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        {/* Sleep Tracking Section */}
        <section className="mb-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold flex items-center text-gray-700 dark:text-gray-200">
              <FaBed className="mr-3 text-blue-500 text-3xl" /> Sleep Tracking
            </h2>
            <button
              onClick={() => { setShowAddSleepModal(true); resetSleepForm(); }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-xl shadow-md transition duration-300 ease-in-out flex items-center"
            >
              <FaPlusCircle className="mr-2" /> Add Sleep Entry
            </button>
          </div>
          {loadingSleep ? (
            <div className="text-center py-12 text-lg text-gray-600 dark:text-gray-400">Loading sleep data...</div>
          ) : errorSleep ? (
            <div className="text-center text-red-500 py-12 flex flex-col items-center justify-center">
              <FaExclamationTriangle className="text-5xl mb-4" />
              <div className="text-lg font-medium">{errorSleep}</div>
            </div>
          ) : sleepData.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-lg">No sleep entries yet. Add your first sleep record!</p>
          ) : (
            <>
              <div className="h-72 sm:h-96 w-full mb-8 bg-gray-50 dark:bg-gray-700 rounded-xl p-4 shadow-inner">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sleepData}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`} />
                    <Area type="monotone" dataKey="durationHours" stroke="#60A5FA" fillOpacity={0.7} fill="#60A5FA" name="Duration (Hours)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <h3 className="text-2xl font-semibold mb-5 text-gray-700 dark:text-gray-200">Recent Sleep Entries</h3>
              <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                  <thead className="bg-gray-200 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                    <tr>
                      <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Duration (Hours)</th>
                      <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Quality (1-5)</th>
                      <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sleepData.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).map((entry) => (
                      <tr key={entry._id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 ease-in-out">
                        <td className="py-3 px-5 text-sm">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="py-3 px-5 text-sm">{entry.durationHours}</td>
                        <td className={clsx("py-3 px-5 text-sm font-bold", getQualityColor(entry.qualityRating))}>{entry.qualityRating}</td>
                        <td className="py-3 px-5 text-sm">
                          <button
                            onClick={() => handleDeleteSleep(entry._id)} 
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center transition duration-200 ease-in-out"
                          >
                            <FaTimesCircle className="inline-block mr-1" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        {/* Health Insights & Nudges */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-3xl font-bold flex items-center mb-6 text-gray-700 dark:text-gray-200">
            <FaRegLightbulb className="mr-3 text-yellow-500 text-3xl" /> Health Insights & Nudges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-50 dark:bg-gray-700 p-6 rounded-xl shadow-inner border border-blue-100 dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Your Progress Snapshot:</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-3 text-base">
                <li>
                  Your average daily steps are {' '}
                  <span className="font-bold text-blue-700 dark:text-blue-300">
                    {(activityData.reduce((sum, d) => sum + (d.steps || 0), 0) / (activityData.length || 1)).toFixed(0)}
                  </span>
                  , showing consistent activity.
                </li>
                <li>
                  You average {' '}
                  <span className="font-bold text-blue-700 dark:text-blue-300">
                    {(sleepData.reduce((sum, d) => sum + (d.durationHours || 0), 0) / (sleepData.length || 1)).toFixed(1)} hours
                  </span>{' '}
                  of sleep. Try to maintain a regular sleep schedule for optimal rest.
                </li>
              </ul>
            </div>
            <div className="bg-pink-50 dark:bg-gray-700 p-6 rounded-xl shadow-inner border border-pink-100 dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Actionable Nudges:</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-3 text-base">
                <li>
                  Consider adding more strength training to your routine for holistic fitness.
                </li>
                <li>
                  Ensure you're drinking enough water throughout the day, especially with increased activity.
                </li>
                <li>
                  If you track food, aim to increase your vegetable intake by one serving daily.
                </li>
                <li>
                  Mindfulness exercises could enhance your sleep quality and overall well-being.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Add Activity Modal */}
        {showAddActivityModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-7 w-full max-w-lg transform scale-95 animate-scale-up border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-b pb-3 border-gray-200 dark:border-gray-700">Add New Activity</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="activityDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    id="activityDate"
                    name="date"
                    value={newActivity.date}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                  />
                </div>
                <div>
                  <label htmlFor="activityType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Activity Type
                  </label>
                  <select
                    id="activityType"
                    name="activityType"
                    value={newActivity.activityType}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, activityType: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                  >
                    <option value="walking">Walking</option>
                    <option value="running">Running</option>
                    <option value="cycling">Cycling</option>
                    <option value="gym">Gym</option>
                    <option value="swimming">Swimming</option>
                    <option value="yoga">Yoga</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="steps" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Steps
                  </label>
                  <input
                    type="number"
                    id="steps"
                    name="steps"
                    value={newActivity.steps}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, steps: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                    placeholder="e.g., 8000"
                    min="0"
                  />
                </div>
                <div>
                  <label htmlFor="activeMinutes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Active Minutes
                  </label>
                  <input
                    type="number"
                    id="activeMinutes"
                    name="activeMinutes"
                    value={newActivity.activeMinutes}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, activeMinutes: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                    placeholder="e.g., 45"
                    min="0"
                  />
                </div>
                <div>
                  <label htmlFor="caloriesBurned" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Calories Burned
                  </label>
                  <input
                    type="number"
                    id="caloriesBurned"
                    name="caloriesBurned"
                    value={newActivity.caloriesBurned}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, caloriesBurned: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                    placeholder="e.g., 300"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => { setShowAddActivityModal(false); resetActivityForm(); }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-5 rounded-lg transition duration-200 ease-in-out shadow-sm hover:shadow-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddActivity}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg transition duration-300 ease-in-out shadow-md hover:shadow-lg"
                >
                  Add Activity
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Sleep Modal */}
        {showAddSleepModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-7 w-full max-w-md transform scale-95 animate-scale-up border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-b pb-3 border-gray-200 dark:border-gray-700">Add New Sleep Entry</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="sleepDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    id="sleepDate"
                    name="date"
                    value={newSleep.date}
                    onChange={(e) => setNewSleep(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                  />
                </div>
                <div>
                  <label htmlFor="durationHours" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duration (Hours)
                  </label>
                  <input
                    type="number"
                    id="durationHours"
                    name="durationHours"
                    value={newSleep.durationHours}
                    onChange={(e) => setNewSleep(prev => ({ ...prev, durationHours: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                    placeholder="e.g., 7.5"
                    step="0.1"
                    min="0"
                    max="24"
                  />
                </div>
                <div>
                  <label htmlFor="qualityRating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quality Rating (1-5)
                  </label>
                  <input
                    type="range"
                    id="qualityRating"
                    min="1"
                    max="5"
                    value={newSleep.qualityRating}
                    onChange={(e) => setNewSleep(prev => ({ ...prev, qualityRating: Number(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500"
                  />
                  <div className="text-center text-base font-semibold text-gray-600 dark:text-gray-400 mt-2">{newSleep.qualityRating} / 5</div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => { setShowAddSleepModal(false); resetSleepForm(); }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-5 rounded-lg transition duration-200 ease-in-out shadow-sm hover:shadow-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSleep}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg transition duration-300 ease-in-out shadow-md hover:shadow-lg"
                >
                  Add Sleep Entry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}