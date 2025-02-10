import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import backgroundImage from "../assets/signupbg2.jpg";
import googlelogo from "../assets/google.png";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to control password visibility
  const [rememberMe, setRememberMe] = useState(false); // State for Remember Me checkbox
  const navigate = useNavigate();

  // Effect to load stored credentials from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    const storedPassword = localStorage.getItem("password");
    if (storedEmail && storedPassword) {
      setFormData({ email: storedEmail, password: storedPassword });
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password) {
      setMessage("Password is required.");
      return;
    }
    if (!formData.email) {
      setMessage("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage("Invalid email format.");
      return;
    }
    if (formData.password.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      return;
    }
    if (!/(?=.*[A-Z])/.test(formData.password)) {
      setMessage("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/(?=.*[!@#$%^&*])/.test(formData.password)) {
      setMessage("Password must contain at least one special character (!@#$%^&*).");
      return;
    }
    if (!/(?=.*\d)/.test(formData.password)) {
      setMessage("Password must contain at least one digit.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/login/", formData, {
        headers: { "Content-Type": "application/json" },
      });

      setMessage("Login successful!");
      const { access_token, refresh_token, user } = response.data; // Destructure tokens and user data from response

      // Store access token, refresh token, and user details in localStorage
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("user", JSON.stringify(user)); // Store user details as JSON

      // If Remember Me is checked, store email and password in localStorage
      if (rememberMe) {
        localStorage.setItem("email", formData.email);
        localStorage.setItem("password", formData.password);
      } else {
        // Clear credentials from localStorage if "Remember Me" is unchecked
        localStorage.removeItem("email");
        localStorage.removeItem("password");
      }

      navigate("/dashboard");

    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="w-full max-w-md p-8 bg-black bg-opacity-90 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-extrabold text-white text-center mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-500 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"} // Toggle between text and password
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-500 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-300">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                className="mr-2"
              /> 
              Remember Me
            </label>
            <a href="/forgotpassword" className="hover:underline">Forgot Password?</a>
          </div>
          {message && <p className="text-center text-red-500 mt-4">{message}</p>}
          <button
            type="submit"
            className="w-full p-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          <p className="text-center text-white mt-4">OR</p>

          <button
            type="button"
            className="w-full p-3 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-400 flex items-center justify-center"
          >
            <img src={googlelogo} alt="Google" className="w-5 h-5 mr-2" />
            Sign Up with Google
          </button><br/>
          <Link to = "/signup">
          <button
            type="button"
            className="w-full p-3 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-400 flex items-center justify-center"
          >
            Sign Up with Email
          </button></Link>
        </form>
      </div>
    </div>
  );
};

export default Login;
