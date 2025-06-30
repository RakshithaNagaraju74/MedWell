// SymptomChecker.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaMicrophone, FaSpinner, FaExclamationTriangle, FaTimes, FaStethoscope, FaComments, FaArrowLeft } from 'react-icons/fa'; // Added FaStethoscope, FaComments, FaArrowLeft
import clsx from 'clsx';

const BACKEND_URL = 'http://localhost:5000'; // Ensure this matches your backend URL

export default function SymptomChecker({ onBackClick }) { // Add onBackClick prop
  const [symptomsInput, setSymptomsInput] = useState('');
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [symptomCheckLoading, setSymptomCheckLoading] = useState(false);
  const [symptomCheckError, setSymptomCheckError] = useState(null);

  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);

  // New state to manage active section: 'none', 'symptomChecker', or 'chatbot'
  const [activeSection, setActiveSection] = useState('none');

  const chatMessagesRef = useRef(null);

  // Scroll to bottom of chat messages when history updates
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Handle symptom identification
  const handleSymptomCheck = async () => {
    setSymptomCheckLoading(true);
    setSymptomCheckError(null);
    setDiseaseResult(null); // Clear previous results

    // Basic validation
    if (!symptomsInput.trim()) {
      setSymptomCheckError("Please enter some symptoms.");
      setSymptomCheckLoading(false);
      return;
    }

    // Convert comma-separated string to an array of trimmed symptoms
    const symptomsArray = symptomsInput.split(',').map(s => s.trim()).filter(s => s.length > 0);

    if (symptomsArray.length === 0) {
      setSymptomCheckError("Please enter valid symptoms (e.g., 'fever, headache').");
      setSymptomCheckLoading(false);
      return;
    }

    try {
      console.log('Frontend: Sending symptoms for identification:', symptomsArray);
      const res = await fetch(`${BACKEND_URL}/api/symptom-checker/identify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: symptomsArray }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to identify diseases.');
      }

      const data = await res.json();
      console.log('Frontend: Disease identification result:', data);
      setDiseaseResult(data.result); // Assuming backend returns { result: "..." }
      setSymptomCheckError(null);
    } catch (err) {
      console.error('Frontend: Error during symptom identification:', err);
      setSymptomCheckError(`Error: ${err.message}`);
    } finally {
      setSymptomCheckLoading(false);
    }
  };

  // Handle chatbot message submission
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatHistory((prev) => [...prev, { role: 'user', message: userMessage }]);
    setChatInput('');
    setChatLoading(true);
    setChatError(null);

    try {
      console.log('Frontend: Sending chat message:', userMessage);
      const res = await fetch(`${BACKEND_URL}/api/chat`, { // New chat endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, chatHistory: chatHistory.map(msg => ({ role: msg.role, content: msg.message })) }), // Send partial history for context
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to get chat response.');
      }

      const data = await res.json();
      console.log('Frontend: Chat response:', data);
      setChatHistory((prev) => [...prev, { role: 'ai', message: data.response }]); // Assuming backend returns { response: "..." }
      setChatError(null);
    } catch (err) {
      console.error('Frontend: Error during chat:', err);
      setChatError(`Chat Error: ${err.message}`);
      setChatHistory((prev) => [...prev, { role: 'ai', message: `Sorry, I couldn't process that. ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-gray-850 text-gray-900 dark:text-white p-6 md:p-10 font-sans">
      {/* Back to Dashboard Button */}
      {(activeSection === 'symptomChecker' || activeSection === 'chatbot') && (
        <div className="w-full max-w-4xl mx-auto flex justify-start mb-4">
          <button
            onClick={() => {
              setActiveSection('none'); // Go back to section selection
              if (onBackClick) onBackClick(); // Also trigger dashboard back if provided
            }}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2" /> Back to Main Menu
          </button>
        </div>
      )}

      <h1 className="text-5xl font-extrabold text-center mb-12 text-green-700 dark:text-green-400 drop-shadow-lg animate-fade-in-down">
        AI Health Assistant
      </h1>

      <div className="max-w-4xl mx-auto mb-10 text-center">
        {activeSection === 'none' && (
          <div className="flex flex-col md:flex-row gap-8 justify-center animate-fade-in">
            <button
              onClick={() => setActiveSection('symptomChecker')}
              className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-700 group"
            >
              <FaStethoscope className="text-6xl mb-4 group-hover:animate-bounce-subtle" />
              <span className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Symptom Checker</span>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Enter your symptoms to identify possible conditions.
              </p>
            </button>
            <button
              onClick={() => setActiveSection('chatbot')}
              className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 group"
            >
              <FaComments className="text-6xl mb-4 group-hover:animate-bounce-subtle" />
              <span className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Health Chatbot</span>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Ask general health questions and get information.
              </p>
            </button>
          </div>
        )}
      </div>

      {/* Conditional rendering of sections based on activeSection state */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
        {activeSection === 'symptomChecker' && (
          <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 flex flex-col transform transition-all duration-300 animate-fade-in lg:col-span-2">
            {/* Symptom Checker takes full width */}
            <h2 className="text-3xl font-bold mb-5 text-gray-900 dark:text-white">
              Identify Possible Diseases
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-7 leading-relaxed">
              Enter your symptoms separated by commas (e.g., fever, headache, sore throat) and let our AI suggest possible conditions. This is for informational purposes only.
            </p>
            <div className="flex-grow flex flex-col space-y-6">
              <textarea
                className="w-full p-5 rounded-2xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-400 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-y min-h-[120px] shadow-sm"
                placeholder="e.g., headache, fatigue, nausea, mild cough"
                value={symptomsInput}
                onChange={(e) => setSymptomsInput(e.target.value)}
              />
              <button
                onClick={handleSymptomCheck}
                disabled={symptomCheckLoading}
                className="w-full bg-green-600 text-white py-4 rounded-2xl flex items-center justify-center hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-bold text-lg shadow-md"
              >
                {symptomCheckLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-3 text-xl" /> Analyzing Symptoms...
                  </>
                ) : (
                  <>
                    <FaStethoscope className="mr-3 text-xl" /> Get Possible Diseases
                  </>
                )}
              </button>

              {symptomCheckError && (
                <div className="mt-4 p-4 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg flex items-center shadow-sm">
                  <FaExclamationTriangle className="mr-3 text-xl" />
                  <p className="font-medium">{symptomCheckError}</p>
                </div>
              )}

              {diseaseResult && (
                <div className="mt-6 p-6 bg-green-50 dark:bg-green-900 rounded-2xl border border-green-300 dark:border-green-700 shadow-lg animate-fade-in flex-grow flex flex-col">
                  <h3 className="text-xl font-bold mb-3 text-green-800 dark:text-green-300 flex items-center">
                    <FaRobot className="mr-2" /> AI Diagnosis (Experimental):
                  </h3>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl text-gray-900 dark:text-white whitespace-pre-wrap flex-grow overflow-auto custom-scrollbar">
                    {diseaseResult}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {activeSection === 'chatbot' && (
          <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 flex flex-col transform transition-all duration-300 animate-fade-in lg:col-span-2">
            {/* Chatbot Section takes full width */}
            <h2 className="text-3xl font-bold mb-5 text-gray-900 dark:text-white">
              Health Chatbot
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-7 leading-relaxed">
              Ask me general health questions, get information on conditions, medications, or healthy living.
            </p>
            <div className="flex-grow flex flex-col bg-gray-50 dark:bg-gray-700 rounded-2xl shadow-inner overflow-hidden">
              <div ref={chatMessagesRef} className="flex-grow p-4 space-y-4 overflow-y-auto custom-scrollbar">
                {chatHistory.length === 0 && (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                    <FaRobot className="text-5xl mx-auto mb-4 text-blue-400" />
                    <p>Type your first message to start the health conversation!</p>
                  </div>
                )}
                {chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={clsx(
                      "p-3 rounded-xl max-w-[85%] shadow-sm",
                      msg.role === 'user'
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 self-end ml-auto"
                        : "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 self-start mr-auto"
                    )}
                  >
                    <p className="font-medium">{msg.message}</p>
                  </div>
                ))}
                {chatLoading && (
                  <div className="p-3 rounded-xl max-w-[85%] bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 self-start mr-auto shadow-sm">
                    <FaSpinner className="animate-spin inline-block mr-2" /> Typing...
                  </div>
                )}
                {chatError && (
                  <div className="p-3 rounded-xl bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 shadow-sm">
                    <FaExclamationTriangle className="inline-block mr-2" /> {chatError}
                  </div>
                )}
              </div>
              <form onSubmit={handleChatSubmit} className="border-t border-gray-200 dark:border-gray-600 p-4 flex gap-3">
                <input
                  type="text"
                  className="flex-grow p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  placeholder="Ask me anything about health..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-md flex items-center justify-center"
                  disabled={chatLoading || !chatInput.trim()}
                >
                  <FaPaperPlane className="text-xl" />
                </button>
                {/* Voice input button - functionality to be added */}
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 p-3 rounded-xl hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors duration-200 shadow-md flex items-center justify-center"
                  title="Voice input (Coming Soon)"
                  disabled // Temporarily disabled
                >
                  <FaMicrophone className="text-xl" />
                </button>
              </form>
            </div>
          </section>
        )}
      </div>

      <style>{`
        /* Fade-in animation for sections */
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        /* Fade-in-down for main title */
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out forwards;
        }

        /* Subtle bounce on hover for choice buttons */
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .group:hover .group-hover\\:animate-bounce-subtle {
          animation: bounce-subtle 0.6s ease-in-out infinite;
        }

        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #e0e7ff; /* Lighter blue for track */
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #93c5fd; /* Light blue thumb */
          border-radius: 10px;
          border: 2px solid #e0e7ff; /* Border matching track */
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #6b7280;
          border: 2px solid #374151;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #60a5fa;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #4b5563;
        }
      `}</style>
    </div>
  );
}