import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUpload } from "react-icons/fi";
import axios from "axios";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const RateMyResume = () => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(null);
    const [feedback, setFeedback] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
            navigate("/login");
        }
    }, [navigate]);

    const validateFile = (file) => {
        const fileType = file.name.split(".").pop().toLowerCase();
        if (["pdf"].includes(fileType)) {
            setFile(file);
            setError("");
            setSuccess("");
            return true;
        } else {
            setError("Only PDF files are allowed.");
            setFile(null);
            return false;
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            validateFile(selectedFile);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            validateFile(droppedFile);
        }
    };

    // Function to render file preview
    const renderFilePreview = () => {
        if (!file) return null;
        
        return (
            <embed
                src={URL.createObjectURL(file)}
                type="application/pdf"
                width="100%"
                height="600px"
                className="rounded-lg shadow-lg"
            />
        );
    };

    const handleRateResume = async () => {
        if (!file) {
            setError("Please upload a resume first.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("resume", file);

        try {
            const response = await axios.post("http://172.17.3.79:8000/resume/rate/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`
                }
            });

            const { score, feedback } = response.data;
            setScore(score);
            setFeedback(feedback);
            setError("");
        } catch (error) {
            console.error("Rating error:", error);
            setError("Failed to rate resume. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <Navbar />

            <div className="flex-grow container mx-auto px-6 py-8">
                <div className="text-center mb-10">
                    <h2 className="text-6xl font-extrabold tracking-wide mb-4">
                        Rate My Resume
                    </h2>
                    <p className="text-xl text-gray-400">
                        Upload your resume and get instant feedback on its effectiveness
                    </p>
                </div>

                {/* Upload Section - Only show if no file is uploaded */}
                {!file && (
                    <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed ${
                                isDragging ? 'border-blue-500 bg-gray-700' : 'border-gray-600'
                            } rounded-lg hover:border-gray-500 transition-colors`}
                        >
                            <FiUpload className={`text-4xl mb-4 ${isDragging ? 'text-blue-400' : 'text-gray-400'}`} />
                            <label className="cursor-pointer">
                                <span className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition-colors">
                                    Choose PDF File
                                </span>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept=".pdf"
                                />
                            </label>
                            <p className="mt-2 text-sm text-gray-400">
                                Drag & drop your PDF file here or click to browse
                            </p>
                        </div>
                    </div>
                )}

                {/* Error or Success Messages */}
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                {success && <p className="text-green-500 text-center mt-4">{success}</p>}

                {/* Preview and Rate Section */}
                {file && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                            <h3 className="text-xl font-semibold mb-4">
                                {file.name}
                            </h3>
                            <div className="mb-6">
                                {renderFilePreview()}
                            </div>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={handleRateResume}
                                    disabled={loading}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-500 transition-colors transform hover:scale-105 duration-200"
                                >
                                    {loading ? "Analyzing..." : "Rate My Resume"}
                                </button>

                                <label className="cursor-pointer">
                                    <span className="inline-block bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-500 transition-colors transform hover:scale-105 duration-200">
                                        Change File
                                    </span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept=".pdf"
                                    />
                                </label>
                            </div>

                            {/* Rating Results */}
                            {score !== null && (
                                <div className="mt-8 p-6 bg-gray-700 rounded-lg">
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold mb-2">Resume Score</h3>
                                        <div className="text-4xl font-bold text-blue-400">{score}/100</div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-semibold mb-3">Feedback:</h4>
                                        <ul className="space-y-2">
                                            {feedback.map((item, index) => (
                                                <li 
                                                    key={index}
                                                    className={`flex items-center ${
                                                        item.startsWith('✓') ? 'text-green-400' : 'text-red-400'
                                                    }`}
                                                >
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default RateMyResume; 