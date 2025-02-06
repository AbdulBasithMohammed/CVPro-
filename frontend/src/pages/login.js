import React, { useState } from "react";
import backgroundImage from "../assets/signupbg2.jpg";
import googlelogo from "../assets/google.png";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setMessage("Email and password are required!");
      return;
    }
    setMessage("Login successful! (Waiting for backend integration)");
  };

  
  return (
      <div
          className="min-h-screen bg-cover bg-center flex items-center justify-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="w-full max-w-md p-8 bg-black bg-opacity-80 rounded-xl shadow-2xl">
          <h2 className="text-3xl font-extrabold text-white text-center mb-6">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-500 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-500 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />

            <div className="flex items-center justify-between text-sm text-gray-300">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" /> Remember Me
              </label>
              <a href={"/forgotpassword"} className="hover:underline">Forgot Password?</a>
            </div>

            <button
                type="submit"
                className="w-full p-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500"
            >
              Log In
            </button>
          </form>

          <p className="text-center text-white mt-4">OR</p>

          <button
              type="button"
              className="w-full p-3 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-400 flex items-center justify-center"
          >
            <img src={googlelogo} alt="Google" className="w-5 h-5 mr-2" />
            Sign Up with Google
          </button>

          {message && <p className="text-center text-red-500 mt-4">{message}</p>}
        </div>
      </div>
  );
};

export default Login;
