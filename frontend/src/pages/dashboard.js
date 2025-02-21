import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/navbar"; // Assuming Navbar is in the same folder
import axios from "axios";

const Dashboard = () => {
  const [userResumes, setUserResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [message, setMessage] = useState("");
  const navigate = useNavigate();
  
  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user")); // Assuming user is stored as a JSON object

  // Function to get the greeting based on the current time
  const getTimeBasedGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour < 12 && currentHour>=6) {
      return "Good Morning";
    } else if (currentHour < 18 && currentHour>=12) {
      return "Good Afternoon";
    } 
    // else if (currentHour >=0 && currentHour<6)  {
    //   return "Good Night";
    // }
    else{
        return "Good Evening";
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      navigate("/login");
    } else {
      const fetchResumes = async () => {
        try {
          const response = await axios.get("http://127.0.0.1:8000/api/resumes/", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          setUserResumes(response.data);
          setLoading(false);
        } catch (error) {
          setLoading(false);
        }
      };

      fetchResumes();
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-4xl font-light text-center text-gray-100 mb-6">
         Hello {user?.first_name || "User"}, {getTimeBasedGreeting()}  
         <br/>
         </h2>
         <h2 className="text-4xl font-extrabold text-center text-gray-100 mb-6">
         Your Dashboard
        </h2>

        {/* {message && <p className="text-center text-red-500 mt-4">{message}</p>} */}

        {loading ? (
          <div className="flex justify-center items-center mt-6">
            <span className="text-xl text-gray-300">Loading your resumes...</span>
          </div>
        ) : (
          <>
            {/* Resumes Section */}
            {userResumes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {userResumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="bg-gray-800 p-6 rounded-lg shadow-xl transform transition-all duration-300 hover:scale-105 hover:bg-gray-700"
                  >
                    <h3 className="text-2xl font-semibold text-gray-200">{resume.title}</h3>
                    <p className="text-gray-400 mt-2">{resume.description || "No description provided."}</p>
                    <div className="mt-4">
                      <Link
                        to={`/resume/${resume.id}`}
                        className="text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        View Resume
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center mt-6">
                <p className="text-xl text-gray-300">You haven't uploaded any resumes yet.</p>
              </div>
            )}

            {/* Upload New Resume Button */}
            <div className="mt-8 text-center">
              <Link
                to="/upload"
                className="inline-block bg-black text-white text-lg py-3 px-6 rounded-full shadow-lg hover:bg-gray-800 transform hover:scale-110 transition-all duration-300"
              >
                Upload New Resume
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
