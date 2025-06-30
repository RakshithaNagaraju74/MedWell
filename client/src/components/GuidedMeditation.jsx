import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Player } from "@lottiefiles/react-lottie-player";
import meditationLottie from "../assets/animation/zen_meditation.json"; // Ensure this path is correct
import './GuidedMeditation.css'; // For custom styles like modal and messages
import { FaArrowLeft, FaSpinner } from 'react-icons/fa'; // Import icons for back button and loading

// Import local audio files
// IMPORTANT: You MUST have these files in your src/assets/audio/ folder
import song1 from '../assets/music/morning-calm.mp3'; // Adjust path if your audio folder is different
import song2 from '../assets/music/stress-relief.mp3';
import song3 from '../assets/music/gratitude-focus.mp3';
import song4 from '../assets/music/stress-relief.mp3';
import song5 from '../assets/music/morning-calm.mp3';


// Define meditation sessions with basic info and initial narration prompts
const meditations = [
  { id: 'morning-calm', category: 'Morning Calm', duration: 10, title: 'Morning Calm Meditation', audioUrl: song1, prompt: 'Narrate a calming visualization for a morning calm meditation, focusing on gentle awakening and setting positive intentions.', description: "Start your day with peace and positive intentions." },
  { id: 'stress-relief', category: 'Stress Relief', duration: 15, title: 'Stress Relief Journey', audioUrl: song2, prompt: 'Guide a visualization for stress relief, imagining tension melting away like snow.', description: "Release tension and find deep relaxation." },
  { id: 'gratitude-focus', category: 'Gratitude Focus', duration: 5, title: 'Gratitude Focus Practice', audioUrl: song3, prompt: 'Lead a short meditation focusing on cultivating gratitude for simple things in life.', description: "Connect with appreciation and positivity." },
  { id: 'deep-sleep', category: 'Sleep', duration: 20, title: 'Deep Sleep Induction', audioUrl: song4, prompt: 'Narrate a meditation to guide one into deep, restorative sleep.', description: "A gentle journey into peaceful slumber." },
  { id: 'focus-boost', category: 'Focus', duration: 10, title: 'Focus Enhancer', audioUrl: song5, prompt: 'Narrate a meditation designed to enhance mental clarity and concentration.', description: "Sharpen your mind for improved productivity." },
];

const GuidedMeditation = ({ onBackClick }) => {
  const [selectedMeditation, setSelectedMeditation] = useState(null);
  const [narration, setNarration] = useState("");
  const [loadingNarration, setLoadingNarration] = useState(false); // Loading for AI narration
  const [playMusic, setPlayMusic] = useState(true);
  const [enableVoice, setEnableVoice] = useState(true);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false); // State for background music playback
  const [sessionCount, setSessionCount] = useState(() => {
    const storedCount = localStorage.getItem('meditationSessionCount');
    return storedCount ? parseInt(storedCount, 10) : 0;
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);

  const backgroundMusicRef = useRef(new Audio());
  const messageTimeoutRef = useRef(null);
  const speechSynthesisUtteranceRef = useRef(null); // To keep track of the current utterance

  // --- Voice Synthesis Setup ---
  useEffect(() => {
    window.speechSynthesis.onvoiceschanged = () => {
      // Voices might not be immediately available, so this ensures they are loaded.
      // No explicit action needed here, just ensures the browser's voice list is updated.
    };

    // Load voice preference from localStorage
    const savedVoicePreference = localStorage.getItem("enableVoice");
    if (savedVoicePreference !== null) {
      setEnableVoice(JSON.parse(savedVoicePreference));
    }
  }, []);

  // --- Local Storage for Session Count ---
  useEffect(() => {
    localStorage.setItem('meditationSessionCount', sessionCount.toString());
  }, [sessionCount]);

  // --- Background Music Volume Control ---
  useEffect(() => {
    backgroundMusicRef.current.volume = volume;
  }, [volume]);

  // --- Message Display Logic ---
  const showMessage = useCallback((msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  }, []);

  // --- Speech Synthesis Function ---
  const speak = useCallback((text) => {
    if (!text || !enableVoice) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech if voice is disabled
      return;
    }

    window.speechSynthesis.cancel(); // Cancel ongoing speech before starting new one

    const voices = window.speechSynthesis.getVoices();
    // Prefer a Google US English voice if available, otherwise fallback to default
    const selectedVoice = voices.find((v) => v.name.includes("Google US English")) || voices[0];

    const utter = new SpeechSynthesisUtterance(text);
    utter.voice = selectedVoice;
    utter.lang = "en-US";
    utter.pitch = 1;
    utter.rate = 1;

    utter.onend = () => {
      console.log('Narration ended.');
    };
    utter.onerror = (event) => {
      // This will fire "interrupted" when window.speechSynthesis.cancel() is called.
      // It's often harmless if new speech immediately follows.
      console.error('Speech synthesis error:', event.error);
      if (event.error !== 'interrupted') { // Only show message for actual problems
          showMessage('Voice narration failed. Your browser might not support it or an error occurred.', 'error');
      }
    };

    speechSynthesisUtteranceRef.current = utter; // Store reference to current utterance

    // Small delay to ensure voices are ready
    setTimeout(() => {
      window.speechSynthesis.speak(utter);
    }, 100);
  }, [enableVoice, showMessage]);

  // --- Handle Session Start (AI Narration & Music) ---
  const handleSessionStart = useCallback(async () => {
    if (!selectedMeditation) {
      showMessage('Please select a meditation first!', 'error');
      return;
    }

    setLoadingNarration(true);
    setNarration(""); // Clear previous narration
    setIsPlayingMusic(false); // Pause music while fetching narration
    window.speechSynthesis.cancel(); // Stop any ongoing speech

    try {
      // --- Groq API Call ---
      // Get Groq API Key from environment variable
      const groqApiKey = process.env.GROQ_API_KEY;


      if (!groqApiKey) {
        throw new Error("Groq API Key is not configured. Please set REACT_APP_GROQ_API_KEY in your .env.local file.");
      }

      const groqApiUrl = "https://api.groq.com/openai/v1/chat/completions";

      const payload = {
        messages: [
          {
            role: "user",
            content: selectedMeditation.prompt,
          },
        ],
        model: "llama3-8b-8192", // Ensure this is a currently active Groq model
        max_tokens: 500, // Adjust as needed for narration length
      };

      const response = await fetch(groqApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      let generatedNarrationText = "Sorry, I couldn't generate the narration at this time. Please try again.";
      let apiSuccess = response.ok;

      if (apiSuccess && result.choices && result.choices.length > 0 && result.choices[0].message && result.choices[0].message.content) {
        generatedNarrationText = result.choices[0].message.content;
      } else {
        console.error("Groq API response error or unexpected structure:", result);
        if (result.error && result.error.message) {
            generatedNarrationText = `Error from AI: ${result.error.message}`;
        } else {
            generatedNarrationText = "Sorry, an unexpected error occurred while generating narration. Please check console for details.";
        }
        apiSuccess = false; // Mark as unsuccessful if data structure is bad
      }

      setNarration(generatedNarrationText);
      if (apiSuccess) {
          showMessage('Narration ready!', 'success');
      } else {
          showMessage('Error generating narration. Please check console.', 'error');
      }


      if (enableVoice && apiSuccess) { // Only speak if API call was successful
        speak(generatedNarrationText);
      }

      if (playMusic && selectedMeditation.audioUrl) {
        backgroundMusicRef.current.src = selectedMeditation.audioUrl;
        backgroundMusicRef.current.loop = true; // Loop background music
        backgroundMusicRef.current.play().catch(e => {
          console.error("Background music playback failed:", e);
          showMessage('Background music failed to play. Your browser might block autoplay.', 'error');
        });
        setIsPlayingMusic(true);
      }

    } catch (error) {
      console.error("Error fetching narration from AI (Groq):", error);
      setNarration("Sorry, there was an error generating the session narration.");
      showMessage(`Error generating narration: ${error.message}. Please try again.`, 'error');
    } finally {
      setLoadingNarration(false);
    }
  }, [selectedMeditation, enableVoice, playMusic, speak, showMessage]);

  // --- Background Music Playback Control ---
  useEffect(() => {
    const audio = backgroundMusicRef.current;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleMusicEnded = () => {
      console.log('Background music ended (should not happen if looped).');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleMusicEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleMusicEnded);
      audio.pause();
      audio.src = '';
      setProgress(0);
    };
  }, []);

  // --- UI Control Functions ---
  const handleMeditationSelect = (med) => {
    setSelectedMeditation(med);
    // Reset states when a new meditation is selected
    setNarration("");
    setIsPlayingMusic(false);
    backgroundMusicRef.current.pause();
    backgroundMusicRef.current.src = '';
    window.speechSynthesis.cancel();
    setProgress(0);
    showMessage(`Selected: ${med.title}`, 'success');
  };

  const handlePlayPauseMusic = () => {
    if (backgroundMusicRef.current) {
      if (isPlayingMusic) {
        backgroundMusicRef.current.pause();
        showMessage('Background music paused.', 'success');
      } else {
        backgroundMusicRef.current.play().catch(e => {
          console.error("Background music playback failed:", e);
          showMessage('Background music failed to play. Your browser might block autoplay.', 'error');
        });
        showMessage('Background music playing.', 'success');
      }
      setIsPlayingMusic(!isPlayingMusic);
    }
  };

  const handleVoiceToggle = (event) => {
    const newValue = event.target.checked;
    setEnableVoice(newValue);
    localStorage.setItem("enableVoice", JSON.stringify(newValue));
    if (!newValue) {
      window.speechSynthesis.cancel(); // Stop speech if voice is disabled
      showMessage('Voice narration disabled.', 'success');
    } else if (narration) {
      speak(narration); // Restart speech if narration exists and voice is enabled
      showMessage('Voice narration enabled.', 'success');
    }
  };

  const handleMusicToggle = (event) => {
    const newValue = event.target.checked;
    setPlayMusic(newValue);
    if (!newValue) {
      backgroundMusicRef.current.pause();
      setIsPlayingMusic(false);
      showMessage('Background music disabled.', 'success');
    } else if (selectedMeditation && narration && !isPlayingMusic) { // Only attempt to play if a session is active
      backgroundMusicRef.current.src = selectedMeditation.audioUrl;
      backgroundMusicRef.current.loop = true;
      backgroundMusicRef.current.play().catch(e => {
        console.error("Background music playback failed:", e);
        showMessage('Background music failed to play. Your browser might block autoplay.', 'error');
      });
      setIsPlayingMusic(true);
      showMessage('Background music enabled.', 'success');
    }
    localStorage.setItem("playMusic", JSON.stringify(newValue)); // Save preference
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    backgroundMusicRef.current.volume = newVolume;
  };

  const handleSkip = (secondsToSkip) => {
    if (backgroundMusicRef.current && selectedMeditation) {
      backgroundMusicRef.current.currentTime = Math.min(backgroundMusicRef.current.duration, backgroundMusicRef.current.currentTime + secondsToSkip);
      showMessage(`Skipped ${secondsToSkip} seconds.`, 'success');
    } else {
      showMessage('No music playing to skip.', 'error');
    }
  };

  const handleRewind = (secondsToRewind) => {
    if (backgroundMusicRef.current && selectedMeditation) {
      backgroundMusicRef.current.currentTime = Math.max(0, backgroundMusicRef.current.currentTime - secondsToRewind);
      showMessage(`Rewound ${secondsToRewind} seconds.`, 'success');
    } else {
      showMessage('No music playing to rewind.', 'error');
    }
  };

  const handleRepeatSession = () => {
    if (selectedMeditation) {
      // Re-trigger narration and music from start
      handleSessionStart();
      showMessage('Repeating current session!', 'success');
      // Increment session count here if repeating counts as a new session
      setSessionCount(prevCount => prevCount + 1);
    } else {
      showMessage('No meditation selected to repeat.', 'error');
    }
  };

  const completeSessionManually = () => {
    if (selectedMeditation) {
      // Stop all audio/speech
      backgroundMusicRef.current.pause();
      window.speechSynthesis.cancel();
      setIsPlayingMusic(false);
      setProgress(0);

      setSessionCount(prevCount => prevCount + 1); // Increment session count
      setShowCompletionModal(true); // Show completion modal
      showMessage('Session manually completed!', 'success');
    } else {
      showMessage('No active meditation to complete.', 'error');
    }
  };

  const startNewSession = () => {
    setShowCompletionModal(false);
    setSelectedMeditation(null);
    setNarration("");
    setIsPlayingMusic(false);
    backgroundMusicRef.current.pause();
    backgroundMusicRef.current.src = '';
    window.speechSynthesis.cancel();
    setProgress(0);
    showMessage('Ready for a new session!', 'info');
  };

  const clearAllSessions = () => {
    if (window.confirm('Are you sure you want to clear all completed sessions? This cannot be undone.')) {
        setSessionCount(0);
        showMessage('All sessions cleared!', 'success');
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const currentTime = backgroundMusicRef.current ? backgroundMusicRef.current.currentTime : 0;
  const durationTime = backgroundMusicRef.current ? backgroundMusicRef.current.duration : 0;
  const remainingTime = durationTime - currentTime;

  return (
    // Added 'relative' to the outermost div for correct absolute positioning of the back button
    <div className="min-h-screen bg-gradient-to-bl from-blue-100 via-violet-100 to-rose-100 p-8 flex flex-col items-center justify-center font-inter relative">
      {/* Global Message Display */}
      {message && (
        <div className={`app-message ${messageType} fixed top-4 z-50`}>
          {message}
        </div>
      )}

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="text-2xl font-semibold text-teal-700 mb-3">Meditation Completed!</h3>
            <p className="text-gray-700 mb-2">Congratulations on completing your session!</p>
            <p className="text-gray-700 mb-4">You have now completed <strong className="text-purple-600 text-xl">{sessionCount}</strong> meditations.</p>
            <button onClick={() => { setShowCompletionModal(false); startNewSession(); }} className="modal-button">
              Great! Start New Session
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-8">

        {/* Back to Dashboard Button */}
        {/* Ensures the button is visually prominent and clickable */}
        <button
            onClick={onBackClick}
            className="absolute top-4 left-4 z-10 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center transition-colors duration-200 p-2 rounded-full bg-gray-100 dark:bg-gray-700 shadow-md"
        >
            <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>


        {/* Left Section: Lottie Animation */}
        <div className="w-full md:w-1/2 flex justify-center items-center">
          <Player autoplay loop src={meditationLottie} className="w-full h-auto max-h-80" />
        </div>

        {/* Right Section: Controls and Narration */}
        <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-purple-700 leading-tight">
            Find Your Inner Zen
          </h1>
          <p className="text-gray-600 text-lg">
            Breathe in serenity, breathe out stress, and let this moment of calm renew you.
          </p>

          {/* Session Count & Clear Button */}
          <div className="flex items-center justify-center md:justify-start space-x-4 text-gray-700 text-lg font-medium">
            <span>Sessions Completed: <span className="text-purple-600 font-bold">{sessionCount}</span></span>
            <button onClick={clearAllSessions} className="px-4 py-2 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition-all text-sm">
              Clear All
            </button>
          </div>


          {/* Meditation Selection */}
          <div className="space-y-3">
            <label htmlFor="meditation-select" className="block text-xl font-semibold text-gray-800">
              Choose Your Meditation:
            </label>
            <select
              id="meditation-select"
              value={selectedMeditation ? selectedMeditation.id : ''}
              onChange={(e) => {
                const med = meditations.find(m => m.id === e.target.value);
                handleMeditationSelect(med);
              }}
              className="p-3 rounded-lg text-lg shadow-sm bg-white border border-gray-300 w-full focus:ring-purple-500 focus:border-purple-500 transition"
            >
              <option value="" disabled>Select a session...</option>
              {meditations.map((med) => (
                <option key={med.id} value={med.id}>
                  {med.title} ({med.duration} min) - {med.category}
                </option>
              ))}
            </select>
          </div>

          {selectedMeditation && (
            <div className="bg-purple-50 p-4 rounded-lg shadow-inner text-gray-800 text-md">
              <p className="font-semibold mb-1">{selectedMeditation.title}</p>
              <p className="text-sm italic">{selectedMeditation.description}</p>
            </div>
          )}

          {/* Start Session Button */}
          <button
            onClick={handleSessionStart}
            disabled={!selectedMeditation || loadingNarration}
            className="px-8 py-4 text-white bg-teal-500 hover:bg-teal-600 rounded-xl shadow-lg transition-all transform hover:scale-105 w-full text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingNarration ? (
              <div className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-3" /> Generating Narration...
              </div>
            ) : "Start Meditation"}
          </button>

          {/* Narration Display */}
          <div className="mt-4 max-w-full p-6 bg-purple-50 rounded-xl shadow-md text-lg text-gray-800 whitespace-pre-wrap leading-relaxed text-center">
            {loadingNarration ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                <span>Generating your personalized meditation...</span>
              </div>
            ) : narration ? (
              narration
            ) : (
              <p className="text-gray-500">Your custom narration will appear here after you start the session.</p>
            )}
          </div>

          {/* Playback Controls (visible only if a meditation is selected and narration is generated) */}
          {selectedMeditation && narration && (
            <div className="space-y-4 bg-gray-50 p-6 rounded-xl shadow-inner">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Playback Controls</h3>

              {/* Progress Bar & Time Display */}
              <div className="w-full">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{formatTime(currentTime)}</span>
                  <span>-{formatTime(remainingTime)}</span>
                </div>
              </div>

              {/* Main Control Buttons */}
              <div className="flex justify-center items-center space-x-4">
                <button onClick={() => handleRewind(15)} className="p-3 rounded-full bg-blue-500 text-white shadow-md hover:bg-blue-600 transition-all transform hover:scale-110 text-xl">
                  ⏪
                </button>
                <button
                  onClick={handlePlayPauseMusic}
                  className="p-4 rounded-full bg-teal-500 text-white shadow-lg hover:bg-teal-600 transition-all transform hover:scale-110 text-2xl"
                >
                  {isPlayingMusic ? '⏸️' : '▶️'}
                </button>
                <button onClick={() => handleSkip(15)} className="p-3 rounded-full bg-blue-500 text-white shadow-md hover:bg-blue-600 transition-all transform hover:scale-110 text-xl">
                  ⏩
                </button>
              </div>

              {/* Secondary Control Buttons */}
              <div className="flex justify-center items-center space-x-4 mt-4">
                <button onClick={handleRepeatSession} className="px-5 py-2 bg-purple-500 text-white rounded-full shadow hover:bg-purple-600 transition-all text-md">
                  🔁 Repeat Session
                </button>
                <button onClick={completeSessionManually} className="px-5 py-2 bg-green-500 text-white rounded-full shadow hover:bg-green-600 transition-all text-md">
                  ✅ Mark Complete
                </button>
                <button onClick={startNewSession} className="px-5 py-2 bg-gray-500 text-white rounded-full shadow hover:bg-gray-600 transition-all text-md">
                  Start New
                </button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center justify-center space-x-3 w-full max-w-xs mx-auto mt-4 text-gray-700">
                <label htmlFor="volume" className="font-semibold">Volume:</label>
                <input
                  type="range"
                  id="volume"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <span className="w-10 text-right">{Math.round(volume * 100)}%</span>
              </div>

              {/* Music and Voice Toggles */}
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <label htmlFor="music-toggle" className="text-gray-700 font-medium">Background Music:</label>
                  <input
                    type="checkbox"
                    id="music-toggle"
                    checked={playMusic}
                    onChange={handleMusicToggle}
                    className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label htmlFor="voice-toggle" className="text-gray-700 font-medium">Voice Narration:</label>
                  <input
                    type="checkbox"
                    id="voice-toggle"
                    checked={enableVoice}
                    onChange={handleVoiceToggle}
                    className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuidedMeditation;