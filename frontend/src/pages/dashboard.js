import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const Dashboard = () => {
  const [userResumes, setUserResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Retrieve user details from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const accessToken = localStorage.getItem("access_token");

  // Function to generate a time-based greeting
  const getTimeBasedGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 12) return "Good Morning";
    if (currentHour >= 12 && currentHour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  useEffect(() => {
    if (!accessToken || !user?._id) {
      navigate("/login");
      return;
    }

    const fetchResumes = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/resume/retrieve`, {
          params: { user_id: user._id }, // Send user_id as a query parameter
        });

        console.log("API Response:", response.data);
        setUserResumes(response.data);
      } catch (error) {
        console.error("Error fetching resumes:", error);
        setError("Failed to load resumes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-between">
      <Navbar />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Greeting Section */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-light text-gray-300 tracking-wide">
            Hi, {user?.first_name || "User"} 👋
          </h2>
          <h2 className="text-6xl font-extrabold text-white mt-3 tracking-wide">
            Your Dashboard
          </h2>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center mt-6">
            <span className="text-lg text-gray-300">Loading your resumes...</span>
          </div>
        ) : error ? (
          <div className="text-center mt-6">
            <p className="text-xl text-red-400">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create Resume Card */}
            <div
              onClick={() => navigate("/createresume")}
              className="cursor-pointer bg-gray-800 bg-opacity-80 backdrop-blur-lg rounded-xl shadow-lg border border-gray-700 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:bg-opacity-90 p-6 text-center flex flex-col justify-center items-center"
            >
              <div className="relative w-48 h-60 mx-auto mb-4 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                  +
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-200 tracking-wide">
                Create Resume
              </h3>
            </div>

            {/* Resume Cards */}
            {userResumes.length > 0 &&
              userResumes.map((resume) => {
                const imageSrc = resume.image_id
                  ? `http://localhost:8000/resume/image/${resume.image_id}`
                  : "https://via.placeholder.com/250";

                return (
                  <div
                    key={resume._id}
                    className="bg-gray-800 bg-opacity-80 backdrop-blur-lg rounded-xl shadow-lg border border-gray-700 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:bg-opacity-90 p-6 text-center"
                  >
                    {/* Resume Thumbnail */}
                    <div className="relative w-48 h-60 mx-auto mb-4">
                      <img
                        src={imageSrc}
                        alt={resume.title || "Resume Thumbnail"}
                        className="w-full h-full object-cover rounded-lg shadow-md border border-gray-600"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/250";
                        }}
                      />
                    </div>

                    {/* Resume Details */}
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-200 tracking-wide">
                        {resume.title || "Untitled Resume"}
                      </h3>
                      <div className="mt-4 flex justify-center space-x-4">
                        <Link
                          to={`/resume/${resume._id}`}
                          className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow hover:bg-blue-500 transition-all duration-200"
                        >
                          View Resume
                        </Link>
                        <Link
                          to={`/editresume/${resume._id}`}
                          className="px-5 py-2 bg-[#1DB954] text-black text-sm font-semibold rounded-lg shadow hover:bg-[#2BAF2B] transition-all duration-200"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
