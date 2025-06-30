// PillIdentifier.jsx
import React, { useState } from 'react';
import { UploadCloud, Loader, Pill, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa'; // Import FaArrowLeft

export default function PillIdentifier({ onBackClick }) { // Add onBackClick prop
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError('');
  };

  const handleReset = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('Please upload an image.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await fetch('http://localhost:5000/api/medicines', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to identify medicine');

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white p-6 flex flex-col items-center">
      {/* Back to Dashboard Button */}
      <div className="w-full max-w-lg flex justify-start mb-4">
        <button
          onClick={onBackClick} // Use the onBackClick prop
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>
      </div>
      <motion.div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 w-full max-w-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-green-700 dark:text-green-400">
          <Pill className="w-7 h-7" /> Pill Identifier
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="sr-only">Upload Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border file:border-gray-300 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 dark:file:bg-gray-700 dark:file:text-gray-200 dark:file:border-gray-600 dark:hover:file:bg-gray-600"
            />
          </label>
          {preview && (
            <div className="mt-4 relative">
              <img src={preview} alt="Pill preview" className="max-w-full h-auto rounded-lg shadow-md mx-auto" />
              <button
                type="button"
                onClick={handleReset}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                <RefreshCcw className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex justify-end items-center gap-4 mt-6">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 transition-colors text-white py-2 px-4 rounded-lg font-semibold flex justify-center items-center gap-2"
              disabled={loading}
            >
              {loading ? <Loader className="animate-spin w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
              {loading ? 'Identifying...' : 'Identify Pill'}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 text-sm px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-red-500"
            >
              <RefreshCcw className="w-4 h-4" />
              Clear
            </button>
          </div>
        </form>

        {error && <p className="text-red-600 mt-4 font-medium">{error}</p>}

        {result && (
          <motion.div
            className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-xl font-semibold mb-2 text-green-800 dark:text-green-300">🧠 AI Result:</h2>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}