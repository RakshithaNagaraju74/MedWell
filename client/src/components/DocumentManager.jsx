// DocumentManager.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FaUpload, FaFilePdf, FaImage, FaTrash, FaCalendarAlt, FaSortAlphaDown, FaSortNumericDown, FaFileMedical, FaTimesCircle, FaCheckCircle, FaExclamationCircle, FaArrowLeft, FaSpinner, FaExclamationTriangle, FaEdit, FaDownload } from 'react-icons/fa';
import clsx from 'clsx';
import { useFirebaseUser } from '../context/FirebaseUserContext'; // Adjust path based on your project structure

// Corrected API base URL to just the host and port
const API_BASE_URL = 'http://localhost:5000'; // <--- CORRECTED: Just the base URL

export default function DocumentManager({ onBackClick }) {
    const { currentUser, loadingAuth } = useFirebaseUser();
    const [documents, setDocuments] = useState([]);
    const [loadingDocuments, setLoadingDocuments] = useState(true);
    const [errorDocuments, setErrorDocuments] = useState(null);

    // State for the upload form
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [documentType, setDocumentType] = useState(''); // 'prescription', 'report', 'medication', 'other'
    const [documentDate, setDocumentDate] = useState('');
    const [documentTitle, setDocumentTitle] = useState('');
    const [loading, setLoading] = useState(false); // For upload operation
    const [error, setError] = useState(null);     // For upload errors
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const [selectedDocument, setSelectedDocument] = useState(null); // For view/edit
    const [showViewEditModal, setShowViewEditModal] = useState(false);

    // Fetch documents when currentUser changes (i.e., user logs in/out)
    useEffect(() => {
        if (currentUser) {
            fetchDocuments();
        } else if (!loadingAuth) {
            setDocuments([]);
            setLoadingDocuments(false);
        }
    }, [currentUser, loadingAuth]);

    // Effect for file preview when selectedFile changes
    useEffect(() => {
        if (selectedFile) {
            const fileReader = new FileReader();
            fileReader.onloadend = () => {
                setFilePreview(fileReader.result);
            };
            fileReader.readAsDataURL(selectedFile);
        } else {
            setFilePreview(null);
        }
    }, [selectedFile]);

    // Function to reset upload form states
    const resetUploadForm = () => {
        setSelectedFile(null);
        setFilePreview(null);
        setDocumentType('');
        setDocumentDate('');
        setDocumentTitle('');
        setLoading(false);
        setError(null);
        setUploadSuccess(false);
    };

    const fetchDocuments = async () => {
        setLoadingDocuments(true);
        setErrorDocuments(null);
        if (!currentUser || !currentUser.email) {
            setErrorDocuments("User not authenticated. Please log in to view documents.");
            setLoadingDocuments(false);
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/documents/${currentUser.email}`, {
                headers: {
                    'Authorization': `Bearer ${await currentUser.getIdToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("API Response Data:", data);
            if (!Array.isArray(data.documents)) {
                console.error("API response is not an array:", data);
                setErrorDocuments("Received unexpected data format from server. Expected an array of documents.");
                setDocuments([]);
                return;
            }
            setDocuments(data.documents);
        } catch (error) {
            console.error('Error fetching documents:', error);
            setErrorDocuments('Failed to fetch documents. Please try again.');
        } finally {
            setLoadingDocuments(false);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            // setNewDocumentFile(file); // This was for a different modal, keeping selectedFile for current form
            // setNewDocumentName(file.name); // Same as above
        } else {
            setSelectedFile(null);
            // setNewDocumentFile(null);
            // setNewDocumentName('');
        }
        setUploadSuccess(false);
        setError(null);
    };

    const handleAddDocument = async (e) => {
        e.preventDefault();
        if (!currentUser || !currentUser.email) {
            alert('User not logged in. Cannot add document.');
            return;
        }
        if (!selectedFile) { // Using selectedFile for the current form
            alert('Please select a file to upload.');
            return;
        }
        if (!documentType || !documentTitle.trim()) {
            alert('Please select a document type and enter a title.');
            return;
        }

        setLoading(true);
        setError(null);
        setUploadSuccess(false);

        const formData = new FormData();
        formData.append('document', selectedFile); // Using selectedFile
        formData.append('userId', currentUser.email);
        formData.append('documentType', documentType);
        formData.append('documentTitle', documentTitle);
        if (documentDate) {
            formData.append('documentDate', documentDate);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${await currentUser.getIdToken()}`
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            setUploadSuccess(true);
            resetUploadForm();
            await fetchDocuments();
        } catch (error) {
            console.error('Error uploading document:', error);
            setError(`Failed to upload document: ${error.message}`);
            setUploadSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDocument = async (id) => {
        if (!currentUser || !currentUser.email) {
            alert('User not logged in. Cannot delete document.');
            return;
        }
        if (!window.confirm("Are you sure you want to delete this document?")) {
            return;
        }

        setLoadingDocuments(true);
        setErrorDocuments(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${await currentUser.getIdToken()}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            await fetchDocuments();
        } catch (error) {
            console.error('Error deleting document:', error);
            setErrorDocuments('Failed to delete document. Please try again.');
        } finally {
            setLoadingDocuments(false);
        }
    };

    const handleViewEditDocument = (doc) => {
        setSelectedDocument(doc);
        setShowViewEditModal(true);
    };

    const handleUpdateDocument = async (updatedDoc) => {
        if (!currentUser || !currentUser.email) {
            alert('User not logged in. Cannot update document.');
            return;
        }
        setLoadingDocuments(true);
        setErrorDocuments(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/documents/${updatedDoc._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await currentUser.getIdToken()}`
                },
                body: JSON.stringify(updatedDoc),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            await fetchDocuments();
            setShowViewEditModal(false);
        } catch (error) {
            console.error('Error updating document:', error);
            setErrorDocuments(`Failed to update document: ${error.message}`);
        } finally {
            setLoadingDocuments(false);
        }
    };

    if (loadingAuth) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white flex items-center justify-center">
                <FaSpinner className="animate-spin text-4xl text-blue-500 mr-3" />
                <span className="text-xl">Loading authentication...</span>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white p-4 sm:p-6 lg:p-8">
                <button
                    onClick={onBackClick}
                    className="mb-6 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center transition-colors duration-200"
                >
                    <FaArrowLeft className="mr-2" /> Back to Dashboard
                </button>
                <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <FaExclamationTriangle className="text-7xl text-red-500 mb-6 animate-bounce" />
                    <h2 className="text-3xl font-extrabold mb-4 text-gray-900 dark:text-white">Authentication Required</h2>
                    <p className="text-lg text-gray-700 dark:text-gray-300 max-w-md text-center">
                        Please log in to your account to access and manage your personal documents.
                    </p>
                    {/* Optionally, add a prominent login button here */}
                    {/* <button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300">
                        Go to Login
                    </button> */}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={onBackClick}
                    className="mb-6 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center transition-colors duration-200"
                >
                    <FaArrowLeft className="mr-2" /> Back to Dashboard
                </button>
                <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900 dark:text-white drop-shadow-md">
                    Secure Document Hub
                </h1>

                {/* Upload Document Section */}
                <section className="mb-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 animate-fade-in-up">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">Upload New Document</h2>
                    <form onSubmit={handleAddDocument} className="space-y-6">
                        <div>
                            <label htmlFor="file-upload" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Select File (PDF, JPEG, PNG)
                            </label>
                            <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                accept=".pdf, .jpg, .jpeg, .png"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-900 dark:text-white
                                           file:mr-4 file:py-2 file:px-5
                                           file:rounded-full file:border-0
                                           file:text-sm file:font-semibold
                                           file:bg-blue-500 file:text-white
                                           hover:file:bg-blue-600 transition-colors duration-200
                                           dark:file:bg-indigo-600 dark:file:hover:bg-indigo-700
                                           border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                            />
                            {filePreview && (
                                <div className="mt-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 shadow-inner">
                                    <h4 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-200">File Preview:</h4>
                                    {selectedFile.type.startsWith('image/') ? (
                                        <img src={filePreview} alt="Preview" className="max-w-full h-auto rounded-md shadow-md" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                                            <FaFilePdf className="text-6xl text-red-500 mb-2" />
                                            <span className="text-center">PDF Preview Not Available</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="documentTitle" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Document Title
                            </label>
                            <input
                                type="text"
                                id="documentTitle"
                                value={documentTitle}
                                onChange={(e) => setDocumentTitle(e.target.value)}
                                placeholder="e.g., Annual Health Checkup Report"
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="documentType" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Document Type
                            </label>
                            <div className="relative">
                                <select
                                    id="documentType"
                                    value={documentType}
                                    onChange={(e) => setDocumentType(e.target.value)}
                                    className="block appearance-none w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    required
                                >
                                    <option value="">Select Type</option>
                                    <option value="prescription">Prescription</option>
                                    <option value="report">Report</option>
                                    <option value="medication">Medication</option>
                                    <option value="other">Other</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="documentDate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Document Date (Optional)
                            </label>
                            <input
                                type="date"
                                id="documentDate"
                                value={documentDate}
                                onChange={(e) => setDocumentDate(e.target.value)}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>

                        <div className="flex justify-end items-center gap-4 pt-4">
                            {loading ? (
                                <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                                    <FaSpinner className="animate-spin mr-3 text-xl" /> Uploading...
                                </div>
                            ) : error ? (
                                <div className="text-red-500 flex items-center font-medium">
                                    <FaExclamationCircle className="mr-3 text-xl" /> {error}
                                </div>
                            ) : uploadSuccess ? (
                                <div className="text-green-600 flex items-center font-medium">
                                    <FaCheckCircle className="mr-3 text-xl" /> Upload Successful!
                                </div>
                            ) : null}

                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                <FaUpload className="mr-2 text-lg" /> Upload Document
                            </button>
                        </div>
                    </form>
                </section>

                {/* Document List Section */}
                <section className="mb-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">My Documents</h2>
                        {/* Optional: Add sort/filter controls here if needed */}
                        {/* <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Sort by:</span>
                            <FaSortAlphaDown className="text-xl cursor-pointer hover:text-blue-500 transition-colors" title="Sort by Name" />
                            <FaSortNumericDown className="text-xl cursor-pointer hover:text-blue-500 transition-colors" title="Sort by Date" />
                        </div> */}
                    </div>

                    {loadingDocuments ? (
                        <div className="text-center py-12 flex flex-col items-center justify-center text-blue-500">
                            <FaSpinner className="animate-spin text-5xl mb-4" />
                            <span className="text-xl font-medium">Loading your documents...</span>
                        </div>
                    ) : errorDocuments ? (
                        <div className="text-center text-red-500 py-12 flex flex-col items-center bg-red-50 dark:bg-red-900 rounded-lg border border-red-200 dark:border-red-700">
                            <FaExclamationTriangle className="text-5xl mb-4" />
                            <div className="text-lg font-medium">{errorDocuments}</div>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <FaFileMedical className="text-5xl mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                            <p className="text-lg font-medium">No documents uploaded yet. Start by uploading one above!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {documents.map((doc) => (
                                <div
                                    key={doc._id}
                                    className="relative flex flex-col border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-gray-50 dark:bg-gray-700 shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out transform hover:-translate-y-1"
                                >
                                    <div className="flex items-center mb-3">
                                        {doc.fileMimeType && doc.fileMimeType.startsWith('image/') ? (
                                            <FaImage className="text-blue-500 text-3xl mr-3" />
                                        ) : (
                                            <FaFilePdf className="text-red-500 text-3xl mr-3" />
                                        )}
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                            {doc.documentTitle}
                                        </h3>
                                    </div>

                                    <div className="flex-grow">
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                            <strong className="font-medium">Type:</strong> <span className="capitalize">{doc.documentType}</span>
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center">
                                            <FaCalendarAlt className="inline-block mr-2 text-md" />
                                            <strong className="font-medium">Date:</strong> {doc.documentDate ? new Date(doc.documentDate).toLocaleDateString() : 'N/A'}
                                        </p>

                                        {doc.fileMimeType && doc.fileMimeType.startsWith('image/') && (
                                            <div className="mb-4">
                                                <img
                                                    src={`${API_BASE_URL}${doc.filePath}`}
                                                    alt={doc.documentTitle}
                                                    className="w-full h-32 object-cover rounded-md border border-gray-200 dark:border-gray-600"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-200 dark:border-gray-600">
                                        <a
                                            href={`${API_BASE_URL}${doc.filePath}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-semibold flex items-center transition-colors duration-200"
                                        >
                                            <FaDownload className="mr-2" /> View/Download
                                        </a>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleViewEditDocument(doc)}
                                                className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 flex items-center text-sm font-medium transition-colors duration-200"
                                                title="Edit Document Details"
                                            >
                                                <FaEdit className="inline-block mr-1" /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDocument(doc._id)}
                                                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center text-sm font-medium transition-colors duration-200"
                                                title="Delete Document"
                                            >
                                                <FaTrash className="inline-block mr-1" /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* View/Edit Document Modal */}
                {showViewEditModal && selectedDocument && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center p-4 z-50 animate-fade-in">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg transform scale-95 animate-scale-in">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Document Details</h3>
                                <button onClick={() => setShowViewEditModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200">
                                    <FaTimesCircle className="text-3xl" />
                                </button>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="editDocumentTitle" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Document Title
                                    </label>
                                    <input
                                        type="text"
                                        id="editDocumentTitle"
                                        value={selectedDocument.documentTitle}
                                        onChange={(e) => setSelectedDocument({ ...selectedDocument, documentTitle: e.target.value })}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="editDocumentType" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Document Type
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="editDocumentType"
                                            value={selectedDocument.documentType}
                                            onChange={(e) => setSelectedDocument({ ...selectedDocument, documentType: e.target.value })}
                                            className="block appearance-none w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        >
                                            <option value="prescription">Prescription</option>
                                            <option value="report">Report</option>
                                            <option value="medication">Medication</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="editDocumentDate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Document Date
                                    </label>
                                    <input
                                        type="date"
                                        id="editDocumentDate"
                                        value={selectedDocument.documentDate ? new Date(selectedDocument.documentDate).toISOString().split('T')[0] : ''}
                                        onChange={(e) => setSelectedDocument({ ...selectedDocument, documentDate: e.target.value })}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                                <div>
                                    <p className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        File Type: <span className="font-normal">{selectedDocument.fileMimeType || 'N/A'}</span>
                                    </p>
                                    {selectedDocument.filePath && (
                                        <a
                                            href={`${API_BASE_URL}${selectedDocument.filePath}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline flex items-center font-medium transition-colors duration-200"
                                        >
                                            <FaDownload className="mr-2 text-lg" /> View Original File
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    onClick={() => setShowViewEditModal(false)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-full transition-colors duration-200 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleUpdateDocument(selectedDocument)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}