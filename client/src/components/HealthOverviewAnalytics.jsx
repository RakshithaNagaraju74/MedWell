// HealthOverviewAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth'; // ✅ Firebase Auth
import {
  FaHeartbeat, FaWeight, FaTint, FaThermometerHalf, FaPrescriptionBottleAlt, FaSmile, FaFrown,
  FaMeh, FaPlusCircle, FaTimesCircle, FaChartLine, FaExclamationTriangle, FaArrowLeft, FaSyringe
} from 'react-icons/fa';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area
} from 'recharts';
import clsx from 'clsx';

const API_BASE_URL = 'http://localhost:5000'; // Replace if needed

export default function HealthOverviewAnalytics({ onBackClick }) {
  const [userEmail, setUserEmail] = useState(null);
  const [activeVitalTab, setActiveVitalTab] = useState('bloodPressure');
  const [vitalSignsData, setVitalSignsData] = useState({
    bloodPressure: [], heartRate: [], temperature: [], oxygenSaturation: [], weight: [], bloodGlucose: [],
  });
  const [symptoms, setSymptoms] = useState([]);
  const [loadingVitals, setLoadingVitals] = useState(true);
  const [loadingSymptoms, setLoadingSymptoms] = useState(true);
  const [errorVitals, setErrorVitals]=useState(null);
  const [errorSymptoms, setErrorSymptoms] = useState(null);
  const [newSymptom, setNewSymptom] = useState('');
  const [newSymptomIntensity, setNewSymptomIntensity] = useState(3);
  const [showAddSymptomModal, setShowAddSymptomModal] = useState(false);
  const [newVitalSign, setNewVitalSign] = useState({
    type: 'bloodPressure', value: '', systolic: '', diastolic: '', unit: '', date: new Date().toISOString().split('T')[0],
  });
  const [showAddVitalSignModal, setShowAddVitalSignModal] = useState(false);

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

  useEffect(() => {
    if (userEmail) {
      fetchVitalSigns();
      fetchSymptoms();
    }
  }, [userEmail]);

  const fetchVitalSigns = async () => {
    setLoadingVitals(true);
    setErrorVitals(null);
    try {
      // Changed from query parameter to path parameter
      const response = await fetch(`${API_BASE_URL}/api/vitalsigns/${userEmail}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const organizedData = {
        bloodPressure: data.filter(d => d.type === 'bloodPressure').map(d => ({ ...d, date: new Date(d.date).toLocaleDateString() })),
        heartRate: data.filter(d => d.type === 'heartRate').map(d => ({ ...d, date: new Date(d.date).toLocaleDateString() })),
        temperature: data.filter(d => d.type === 'temperature').map(d => ({ ...d, date: new Date(d.date).toLocaleDateString() })),
        oxygenSaturation: data.filter(d => d.type === 'oxygenSaturation').map(d => ({ ...d, date: new Date(d.date).toLocaleDateString() })),
        weight: data.filter(d => d.type === 'weight').map(d => ({ ...d, date: new Date(d.date).toLocaleDateString() })),
        bloodGlucose: data.filter(d => d.type === 'bloodGlucose').map(d => ({ ...d, date: new Date(d.date).toLocaleDateString() })),
      };
      setVitalSignsData(organizedData);
    } catch (error) {
      console.error('Error fetching vital signs:', error);
      setErrorVitals('Failed to fetch vital signs data. Please try again.');
    } finally {
      setLoadingVitals(false);
    }
  };

  const fetchSymptoms = async () => {
    setLoadingSymptoms(true);
    setErrorSymptoms(null);
    try {
      // Changed from query parameter to path parameter
      const response = await fetch(`${API_BASE_URL}/api/symptoms/${userEmail}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSymptoms(data);
    } catch (error) {
      console.error('Error fetching symptoms:', error);
      setErrorSymptoms('Failed to fetch symptoms data. Please try again.');
    } finally {
      setLoadingSymptoms(false);
    }
  };

  const getVitalSignUnit = (type) => {
    switch (type) {
      case 'bloodPressure': return 'mmHg';
      case 'heartRate': return 'bpm';
      case 'temperature': return '°F';
      case 'oxygenSaturation': return '%';
      case 'weight': return 'lbs';
      case 'bloodGlucose': return 'mg/dL';
      default: return '';
    }
  };

  const handleAddVitalSign = async () => {
    if (!userEmail) {
      alert('User not logged in.');
      return;
    }
    setLoadingVitals(true);
    setErrorVitals(null);
    try {
      // Ensure unit is set based on the current type before sending
      const payload = {
        ...newVitalSign,
        userId: userEmail,
        unit: getVitalSignUnit(newVitalSign.type) // Set the unit here!
      };

      const response = await fetch(`${API_BASE_URL}/api/vitalsigns`, {
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
      await fetchVitalSigns(); // Refresh data after adding
      setNewVitalSign({
        type: 'bloodPressure', value: '', systolic: '', diastolic: '', unit: '', date: new Date().toISOString().split('T')[0],
      });
      setShowAddVitalSignModal(false);
    } catch (error) {
      console.error('Error adding vital sign:', error);
      setErrorVitals(`Failed to add vital sign: ${error.message}`);
    } finally {
      setLoadingVitals(false);
    }
  };

  const handleDeleteVitalSign = async (id) => {
    setLoadingVitals(true);
    setErrorVitals(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/vitalsigns/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchVitalSigns(); // Refresh data after deleting
    } catch (error) {
      console.error('Error deleting vital sign:', error);
      setErrorVitals('Failed to delete vital sign. Please try again.');
    } finally {
      setLoadingVitals(false);
    }
  };

  const handleAddSymptom = async () => {
    if (!userEmail || !newSymptom.trim()) {
      alert('Please enter a symptom and ensure you are logged in.');
      return;
    }
    setLoadingSymptoms(true);
    setErrorSymptoms(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/symptoms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userEmail,
          name: newSymptom, // Changed from 'symptom' to 'name' to match backend model
          intensity: newSymptomIntensity,
          date: new Date().toISOString().split('T')[0],
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchSymptoms(); // Refresh data after adding
      setNewSymptom('');
      setNewSymptomIntensity(3);
      setShowAddSymptomModal(false);
    } catch (error) {
      console.error('Error adding symptom:', error);
      setErrorSymptoms('Failed to add symptom. Please try again.');
    } finally {
      setLoadingSymptoms(false);
    }
  };

  const handleDeleteSymptom = async (id) => {
    setLoadingSymptoms(true);
    setErrorSymptoms(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/symptoms/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchSymptoms(); // Refresh data after deleting
    } catch (error) {
      console.error('Error deleting symptom:', error);
      setErrorSymptoms('Failed to delete symptom. Please try again.');
    } finally {
      setLoadingSymptoms(false);
    }
  };

  const handleVitalSignChange = (e) => {
    const { name, value } = e.target;
    setNewVitalSign(prev => {
      const updated = { ...prev, [name]: value };
      // If type changes, update the unit accordingly
      if (name === 'type') {
        updated.unit = getVitalSignUnit(value);
        // Reset value/systolic/diastolic when type changes
        updated.value = '';
        updated.systolic = '';
        updated.diastolic = '';
      }
      return updated;
    });
  };

  // Effect to set initial unit when modal opens or newVitalSign state changes
  useEffect(() => {
    if (showAddVitalSignModal) {
      setNewVitalSign(prev => ({
        ...prev,
        unit: getVitalSignUnit(prev.type)
      }));
    }
  }, [showAddVitalSignModal, newVitalSign.type]); // Depend on modal visibility and type

  const getVitalSignLabel = (type) => {
    switch (type) {
      case 'bloodPressure': return 'Blood Pressure';
      case 'heartRate': return 'Heart Rate';
      case 'temperature': return 'Temperature';
      case 'oxygenSaturation': return 'Oxygen Saturation';
      case 'weight': return 'Weight';
      case 'bloodGlucose': return 'Blood Glucose';
      default: return '';
    }
  };


  const getVitalSignIcon = (type) => {
    switch (type) {
      case 'bloodPressure': return <FaTint className="text-red-500 mr-2" />;
      case 'heartRate': return <FaHeartbeat className="text-pink-500 mr-2" />;
      case 'temperature': return <FaThermometerHalf className="text-orange-500 mr-2" />;
      case 'oxygenSaturation': return <FaPrescriptionBottleAlt className="text-blue-500 mr-2" />;
      case 'weight': return <FaWeight className="text-green-500 mr-2" />;
      case 'bloodGlucose': return <FaSyringe className="text-purple-500 mr-2" />;
      default: return null;
    }
  };

  const getSymptomIntensityIcon = (intensity) => {
    if (intensity <= 1) return <FaSmile className="text-green-500" />;
    if (intensity <= 3) return <FaMeh className="text-yellow-500" />;
    return <FaFrown className="text-red-500" />;
  };

  const formatTooltip = (value, name, props) => {
    if (name === 'systolic' || name === 'diastolic') {
      return [`${value} mmHg`, name === 'systolic' ? 'Systolic' : 'Diastolic'];
    }
    return [`${value} ${getVitalSignUnit(activeVitalTab)}`, getVitalSignLabel(activeVitalTab)];
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onBackClick}
          className="mb-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold mb-6 text-center">Health Overview Analytics</h1>

        {/* Vital Signs Section */}
        <section className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Vital Signs Tracking</h2>
            <button
              onClick={() => {
                setShowAddVitalSignModal(true);
                // Initialize the unit when opening the modal
                setNewVitalSign(prev => ({
                  ...prev,
                  unit: getVitalSignUnit(prev.type || 'bloodPressure'), // Default to bloodPressure unit
                  date: new Date().toISOString().split('T')[0] // Reset date
                }));
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"
            >
              <FaPlusCircle className="mr-2" /> Add Vital Sign
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {['bloodPressure', 'heartRate', 'temperature', 'oxygenSaturation', 'weight', 'bloodGlucose'].map(type => (
              <button
                key={type}
                onClick={() => setActiveVitalTab(type)}
                className={clsx(
                  "py-2 px-4 rounded-full text-sm font-medium",
                  activeVitalTab === type
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                )}
              >
                {getVitalSignLabel(type)}
              </button>
            ))}
          </div>

          {loadingVitals ? (
            <div className="text-center py-8">Loading vital signs...</div>
          ) : errorVitals ? (
            <div className="text-center text-red-500 py-8 flex flex-col items-center">
              <FaExclamationTriangle className="text-4xl mb-2" />
              <div>{errorVitals}</div>
            </div>
          ) : vitalSignsData[activeVitalTab] && vitalSignsData[activeVitalTab].length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">No {getVitalSignLabel(activeVitalTab)} entries yet.</p>
          ) : (
            <>
              <div className="h-64 sm:h-80 md:h-96 w-full mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <ResponsiveContainer width="100%" height="100%">
                  {activeVitalTab === 'bloodPressure' ? (
                    <LineChart data={vitalSignsData.bloodPressure}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={formatTooltip} />
                      <Line type="monotone" dataKey="systolic" stroke="#8884d8" name="Systolic" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="diastolic" stroke="#82ca9d" name="Diastolic" activeDot={{ r: 8 }} />
                    </LineChart>
                  ) : (
                    <LineChart data={vitalSignsData[activeVitalTab]}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                      <XAxis dataKey="value" />
                      <YAxis domain={['auto', 'auto']} />
                      <Tooltip formatter={formatTooltip} />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" name={getVitalSignLabel(activeVitalTab)} activeDot={{ r: 8 }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>

              <h3 className="text-xl font-semibold mb-3">Recent Entries</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <thead className="bg-gray-200 dark:bg-gray-700">
                    <tr>
                      <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Date</th>
                      <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Type</th>
                      <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Value</th>
                      <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vitalSignsData[activeVitalTab]
                      .slice()
                      .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date descending
                      .map((entry) => (
                        <tr key={entry._id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 ease-in-out">
                          <td className="py-3 px-4 text-sm">{new Date(entry.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-sm flex items-center">
                            {getVitalSignIcon(entry.type)} {getVitalSignLabel(entry.type)}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {entry.type === 'bloodPressure'
                              ? `${entry.systolic}/${entry.diastolic} ${entry.unit}`
                              : `${entry.value} ${entry.unit}`}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <button
                              onClick={() => handleDeleteVitalSign(entry._id)} // CHANGED HERE: entry.id to entry._id
                              className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
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

        {/* Symptoms Section */}
        <section className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Symptom Tracker</h2>
            <button
              onClick={() => setShowAddSymptomModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"
            >
              <FaPlusCircle className="mr-2" /> Add Symptom
            </button>
          </div>

          {loadingSymptoms ? (
            <div className="text-center py-8">Loading symptoms...</div>
          ) : errorSymptoms ? (
            <div className="text-center text-red-500 py-8 flex flex-col items-center">
              <FaExclamationTriangle className="text-4xl mb-2" />
              <div>{errorSymptoms}</div>
            </div>
          ) : symptoms.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">No symptom entries yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {symptoms.slice().sort((a,b) => new Date(b.date) - new Date(a.date)).map((symptom) => ( // Sort by date descending
                <div key={symptom._id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow flex items-center justify-between"> {/* CHANGED HERE: symptom.id to symptom._id */}
                  <div>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">{symptom.name}</p> {/* Changed from symptom.symptom to symptom.name */}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-1">{getSymptomIntensityIcon(symptom.intensity)}</span> Intensity: {symptom.intensity}/5
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(symptom.date).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteSymptom(symptom._id)} // CHANGED HERE: symptom.id to symptom._id
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 ml-4"
                  >
                    <FaTimesCircle className="inline-block" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Add Vital Sign Modal */}
        {showAddVitalSignModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Add New Vital Sign</h3>
              <div className="mb-4">
                <label htmlFor="vitalSignType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  id="vitalSignType"
                  name="type"
                  value={newVitalSign.type}
                  onChange={handleVitalSignChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="bloodPressure">Blood Pressure</option>
                  <option value="heartRate">Heart Rate</option>
                  <option value="temperature">Temperature</option>
                  <option value="oxygenSaturation">Oxygen Saturation</option>
                  <option value="weight">Weight</option>
                  <option value="bloodGlucose">Blood Glucose</option>
                </select>
              </div>
              {newVitalSign.type === 'bloodPressure' ? (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="systolic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Systolic (mmHg)
                    </label>
                    <input
                      type="number"
                      id="systolic"
                      name="systolic"
                      value={newVitalSign.systolic}
                      onChange={handleVitalSignChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., 120"
                    />
                  </div>
                  <div>
                    <label htmlFor="diastolic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Diastolic (mmHg)
                    </label>
                    <input
                      type="number"
                      id="diastolic"
                      name="diastolic"
                      value={newVitalSign.diastolic}
                      onChange={handleVitalSignChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., 80"
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <label htmlFor="value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Value ({getVitalSignUnit(newVitalSign.type)})
                  </label>
                  <input
                    type="number"
                    id="value"
                    name="value"
                    value={newVitalSign.value}
                    onChange={handleVitalSignChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={`e.g., ${newVitalSign.type === 'heartRate' ? '75' : newVitalSign.type === 'temperature' ? '98.6' : '...'}`}
                  />
                </div>
              )}
              <div className="mb-4">
                <label htmlFor="vitalSignDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="vitalSignDate"
                  name="date"
                  value={newVitalSign.date}
                  onChange={handleVitalSignChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddVitalSignModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddVitalSign}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Add Vital Sign
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Symptom Modal */}
        {showAddSymptomModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Add New Symptom</h3>
              <div className="mb-4">
                <label htmlFor="symptomName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Symptom Name
                </label>
                <input
                  type="text"
                  id="symptomName"
                  value={newSymptom}
                  onChange={(e) => setNewSymptom(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Headache, Fatigue"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="symptomIntensity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Intensity (1-5)
                </label>
                <input
                  type="range"
                  id="symptomIntensity"
                  min="1"
                  max="5"
                  value={newSymptomIntensity}
                  onChange={(e) => setNewSymptomIntensity(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">{newSymptomIntensity} / 5</div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddSymptomModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSymptom}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Add Symptom
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}