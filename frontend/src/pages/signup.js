import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import backgroundImage from "../assets/signupbg2.jpg";
import googlelogo from "../assets/google.png"

const Signup = () => {
  const [Fname, setFName] = useState("");
  const [Lname, setLName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!Fname) {
      setError("First Name is required.");
      return;
    }
    if (!Lname) {
      setError("Last Name is required.");
      return;
    }
    if (!email) {
      setError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/(?=.*[!@#$%^&*])/.test(password)) {
      setError("Password must contain at least one special character (!@#$%^&*).");
      return;
    }
    if (!/(?=.*\d)/.test(password)) {
      setError("Password must contain at least one digit.");
      return;
    }
    if (!confirmPassword) {
      setError("Confirm Password is required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("https://localhost:8002/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Fname, Lname, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Signup successful!");
        navigate("/dashboard");
      } else {
        setError(data.message || "Signup failed.");
      }
    } catch (error) {
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="w-full max-w-md p-8 bg-black bg-opacity-90 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-extrabold text-white text-center mb-6">Sign Up to CVPRO+</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="First Name"
            value={Fname}
            onChange={(e) => setFName(e.target.value)}
            className="w-full p-3 border border-gray-500 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={Lname}
            onChange={(e) => setLName(e.target.value)}
            className="w-full p-3 border border-gray-500 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-500 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-500 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border border-gray-500 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          {error && (
            <p className="text-red-500 text-center">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-500 text-center">
              {success}
            </p>
          )}
          <button
            type="submit"
            className="w-full p-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500"
          >
            Sign Up
          </button>
          <p className="text-center text-gray-400">OR</p>
          <button
            type="button"
            className="w-full p-3 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-400 flex items-center justify-center"
          >
            <img src={googlelogo} alt="Google" className="w-5 h-5 mr-2" />
            Sign Up with Google
          </button>
          <p className="text-center text-gray-400 mt-4">
            Already have an account? <Link to="/login" className="text-blue-400 hover:text-white">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
