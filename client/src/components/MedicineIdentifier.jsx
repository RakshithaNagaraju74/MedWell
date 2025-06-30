import React, { useState } from 'react';
import { FaUpload, FaSpinner, FaFileImage, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import { FaArrowLeft } from 'react-icons/fa'; // Import FaArrowLeft

export default function MedicineIdentifier({ onBackClick }) { // Add onBackClick prop
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setResult(null);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
      setError("Please select an image file (PNG, JPG, JPEG).");
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("No image selected for upload.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/api/prescriptions/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to upload image and process prescription.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "An unexpected error occurred during upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-white dark:bg-gray-800 flex flex-col p-6 items-center">
      {/* Back to Dashboard Button */}
      <div className="w-full max-w-4xl flex justify-start mb-4">
        <button
          onClick={onBackClick} // Use the onBackClick prop
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white text-center">
        Medicine Identifier
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        Upload an image of your prescription to get it digitized and identify medicines.
      </p>
      <p className="text-gray-600 dark:text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        Better Handwriting and image quality lead to better results.
      </p>

      <div className="flex flex-col flex-grow max-w-4xl w-full mx-auto gap-6 pb-6">
        <div className="w-full max-w-md bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 flex flex-col mx-auto">
          <div className="mb-4 flex-grow">
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-green-400 rounded-lg cursor-pointer bg-green-50 hover:bg-green-100 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors duration-200 h-full"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-48 w-auto object-contain rounded-md mb-2"
                />
              ) : (
                <FaFileImage className="text-5xl text-green-600 dark:text-green-300 mb-3" />
              )}
              <p className="text-green-700 dark:text-green-200 font-semibold text-lg">
                {selectedFile ? selectedFile.name : "Click to select image"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">PNG, JPG, or JPEG (Max 10MB)</p>
              <input
                id="image-upload"
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Always visible Remove Image button */}
          <button
            onClick={handleRemoveFile}
            disabled={!selectedFile}
            className={`mt-2 flex items-center justify-center w-full transition-colors duration-200 rounded-md py-2 font-medium ${
              selectedFile
                ? "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                : "text-gray-400 cursor-not-allowed dark:text-gray-500"
            }`}
          >
            <FaTimesCircle className="mr-2" />
            Remove Image
          </button>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="w-full bg-green-600 text-white py-3 rounded-md flex items-center justify-center hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 mt-4"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Processing...
              </>
            ) : (
              <>
                <FaUpload className="mr-2" /> Upload and Identify
              </>
            )}
          </button>

          {error && (
            <div className="mt-6 p-4 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-md flex items-center shadow-sm">
              <FaTimesCircle className="mr-3 text-xl" />
              <p className="font-medium">{error}</p>
            </div>
          )}
        </div>

        {result && (
          <div className="w-full bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 flex flex-col flex-grow min-h-0 mx-auto max-w-4xl">
            <h2 className="text-xl font-bold mb-4 text-green-700 dark:text-green-300 flex items-center">
              <FaCheckCircle className="mr-2" /> Identification Complete!
            </h2>

            <div className="flex-grow flex flex-col min-h-0">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Digitized Prescription:
              </h3>
              <div className="p-4 bg-green-50 dark:bg-green-900 rounded-md border border-green-300 dark:border-green-700 text-gray-900 dark:text-white whitespace-pre-wrap flex-grow overflow-auto">
                {result.digitalPrescription || "Could not digitize prescription."}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}