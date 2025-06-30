import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FaArrowLeft,
  FaTimesCircle,
  FaCheckCircle,
  FaRobot,
  FaSpinner,
} from 'react-icons/fa'; // <- FA5 icons

import {
  FaBowlFood,
  FaBrain,
  FaLeaf,
} from 'react-icons/fa6'; // <- FA6 icons

import './NutritionGuide.css'; // Create this file for custom styles
import clsx from 'clsx'; // For conditional classes

const NutritionGuide = ({ onBackClick }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [nutritionResponse, setNutritionResponse] = useState({
        generalAdvice: '',
        whatToEat: [],
        whatNotToEat: []
    });
    const [query, setQuery] = useState(''); // State for the user's input query
    const [messages, setMessages] = useState([]); // Stores chat history with Groq

    const groqApiKey = process.env.GROQ_API_KEY;

    const scrollRef = useRef(null); // Ref for scrolling to bottom of messages

    // Scroll to the bottom of the messages container on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const parseGroqResponse = (text) => {
        const sections = {
            generalAdvice: '',
            whatToEat: [],
            whatNotToEat: []
        };

        // Attempt to split into sections based on headings
        const generalMatch = text.match(/^(.*?)(?:## What to Eat|## Foods to Eat|## What You Should Eat)/s);
        if (generalMatch && generalMatch[1]) {
            sections.generalAdvice = generalMatch[1].trim();
        } else {
            sections.generalAdvice = text.split(/##/)[0].trim(); // Fallback if no specific heading
        }

        const whatToEatMatch = text.match(/(?:## What to Eat|## Foods to Eat|## What You Should Eat)(.*?)(?:## What Not to Eat|## Foods to Avoid|## What You Should Avoid|$)/s);
        if (whatToEatMatch && whatToEatMatch[1]) {
            sections.whatToEat = whatToEatMatch[1].split('\n').filter(line => line.trim().startsWith('* ') || line.trim().startsWith('- ')).map(line => line.trim().substring(2).trim());
        }

        const whatNotToEatMatch = text.match(/(?:## What Not to Eat|## Foods to Avoid|## What You Should Avoid)(.*)/s);
        if (whatNotToEatMatch && whatNotToEatMatch[1]) {
            sections.whatNotToEat = whatNotToEatMatch[1].split('\n').filter(line => line.trim().startsWith('* ') || line.trim().startsWith('- ')).map(line => line.trim().substring(2).trim());
        }

        // If no explicit lists found, try to extract paragraphs or sentences
        if (sections.whatToEat.length === 0 && sections.whatNotToEat.length === 0) {
            const lines = text.split('\n').filter(line => line.trim() !== '');
            const eatIndex = lines.findIndex(line => line.toLowerCase().includes('what to eat') || line.toLowerCase().includes('foods to eat'));
            const avoidIndex = lines.findIndex(line => line.toLowerCase().includes('what not to eat') || line.toLowerCase().includes('foods to avoid'));

            if (eatIndex !== -1) {
                // Take lines after "what to eat" until "what not to eat" or end
                for (let i = eatIndex + 1; i < (avoidIndex !== -1 ? avoidIndex : lines.length); i++) {
                    if (lines[i].trim() !== '') sections.whatToEat.push(lines[i].trim());
                }
            }
            if (avoidIndex !== -1) {
                // Take lines after "what not to eat" until end
                for (let i = avoidIndex + 1; i < lines.length; i++) {
                    if (lines[i].trim() !== '') sections.whatNotToEat.push(lines[i].trim());
                }
            }

            // Fallback for general advice if specific sections are still empty
            if (sections.generalAdvice === '') {
                sections.generalAdvice = text;
            }
        }

        return sections;
    };


    const fetchNutritionAdvice = useCallback(async (userPrompt) => {
        if (!groqApiKey) {
            setError("Groq API Key is not configured. Please set REACT_APP_GROQ_API_KEY in your .env.local file.");
            return;
        }

        setLoading(true);
        setError(null);

        // Add user message to history
        const updatedMessages = [...messages, { role: "user", content: userPrompt }];
        setMessages(updatedMessages);

        try {
            const groqApiUrl = "https://api.groq.com/openai/v1/chat/completions";

            const payload = {
                messages: updatedMessages, // Send the full chat history for context
                model: "llama3-8b-8192", // Use an active Groq model
                max_tokens: 1500, // Adjust token limit as needed for detailed responses
            };

            const response = await fetch(groqApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${groqApiKey}`,
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `Groq API error: ${response.status}`);
            }

            const result = await response.json();

            if (result.choices && result.choices.length > 0 && result.choices[0].message && result.choices[0].message.content) {
                const aiResponseContent = result.choices[0].message.content;

                // Add AI response to history
                setMessages(prevMessages => [...prevMessages, { role: "assistant", content: aiResponseContent }]);

                // Attempt to parse the response into structured sections
                const parsed = parseGroqResponse(aiResponseContent);
                setNutritionResponse(parsed);

            } else {
                throw new Error("Groq API response structure unexpected.");
            }
        } catch (err) {
            console.error("Error fetching nutrition advice:", err);
            setError(`Failed to get nutrition advice: ${err.message}. Please try again.`);
            setMessages(prevMessages => [...prevMessages, { role: "assistant", content: `Error: ${err.message}` }]); // Add error to chat history
        } finally {
            setLoading(false);
        }
    }, [groqApiKey, messages]); // Depend on messages to maintain chat context


    // Initial prompt for general nutrition advice when component mounts
    useEffect(() => {
        if (messages.length === 0) { // Only fetch initial advice if no messages yet
            fetchNutritionAdvice(
                "Provide comprehensive nutrition guidance. Start with general advice, then include a section titled '## What to Eat' with bullet points, and another section titled '## What Not to Eat' also with bullet points. Be concise but informative."
            );
        }
    }, [fetchNutritionAdvice, messages]); // Depend on fetchNutritionAdvice and messages

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (query.trim()) {
            fetchNutritionAdvice(query.trim());
            setQuery(''); // Clear the input field
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 p-8 flex flex-col items-center justify-center font-inter relative overflow-hidden">
            {/* Back to Dashboard Button */}
            <button
                onClick={onBackClick}
                className="absolute top-4 left-4 z-10 text-blue-600 hover:text-blue-800 flex items-center transition-colors duration-200 p-2 rounded-full bg-gray-100 shadow-md"
            >
                <FaArrowLeft className="mr-2" /> Back to Dashboard
            </button>

            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-5xl w-full flex flex-col space-y-8 relative z-[1]">
                <h1 className="text-4xl font-extrabold text-green-700 text-center leading-tight">
                    <FaBowlFood className="inline-block mr-3 text-green-600" /> Your Personal Nutrition Guide
                </h1>
                <p className="text-gray-600 text-lg text-center">
                    Get tailored advice on healthy eating from our AI assistant.
                </p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline ml-2">{error}</span>
                    </div>
                )}

                {/* Chat Interface / Response Display */}
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Chat History / General Response */}
                    <div className="flex-1 bg-gray-50 p-6 rounded-xl shadow-inner flex flex-col h-[500px]">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                            <FaRobot className="mr-2" /> AI Nutrition Chat
                        </h2>
                        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-2 mb-4 border border-gray-200 rounded-lg bg-white">
                            {messages.length === 0 && !loading && (
                                <p className="text-gray-500 italic">Waiting for initial nutrition advice...</p>
                            )}
                            {messages.map((msg, index) => (
                                <div key={index} className={clsx(
                                    "p-3 rounded-lg my-2 max-w-[80%]",
                                    msg.role === "user" ? "bg-blue-100 self-end ml-auto" : "bg-gray-200 self-start mr-auto"
                                )}>
                                    <strong className="capitalize">{msg.role}:</strong> {msg.content}
                                </div>
                            ))}
                            {loading && (
                                <div className="flex items-center justify-center p-3 my-2">
                                    <FaSpinner className="animate-spin mr-2 text-teal-500" />
                                    <span className="text-gray-600">Thinking...</span>
                                </div>
                            )}
                        </div>

                        {/* User Input Form */}
                        <form onSubmit={handleSendMessage} className="flex gap-2 mt-auto">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ask about specific foods, diets, or health goals..."
                                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-lg"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                className="bg-teal-500 hover:bg-teal-600 text-white p-3 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading || !query.trim()}
                            >
                                <FaRobot className="mr-2 hidden sm:inline" /> Ask AI
                            </button>
                        </form>
                    </div>

                    {/* What to Eat / What Not to Eat sections */}
                    <div className="flex-1 flex flex-col gap-8">
                        <div className="bg-green-50 p-6 rounded-xl shadow-inner h-full">
                            <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center">
                                <FaCheckCircle className="mr-2" /> What to Eat
                            </h2>
                            {loading ? (
                                <p className="text-gray-500 italic">Loading suggestions...</p>
                            ) : nutritionResponse.whatToEat.length > 0 ? (
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    {nutritionResponse.whatToEat.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">No specific "What to Eat" suggestions yet. Ask the AI for general healthy foods or specific diet advice!</p>
                            )}
                        </div>

                        <div className="bg-red-50 p-6 rounded-xl shadow-inner h-full">
                            <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center">
                                <FaTimesCircle className="mr-2" /> What Not to Eat
                            </h2>
                            {loading ? (
                                <p className="text-gray-500 italic">Loading suggestions...</p>
                            ) : nutritionResponse.whatNotToEat.length > 0 ? (
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    {nutritionResponse.whatNotToEat.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">No specific "What Not to Eat" suggestions yet. Ask the AI about foods to limit or avoid.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NutritionGuide;