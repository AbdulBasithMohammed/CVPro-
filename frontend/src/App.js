import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./pages/signup";
import Home from "./pages/home";
import Login from "./pages/login";
// import AboutUs from "./pages/aboutus";
// import ContactUs from "./pages/contactus";
import ForgotPassword from "./pages/forgot-password";
import ResetPass from "./pages/reset-password"

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* <Route path="/aboutus" element={<AboutUs />} /> */}
        {/* <Route path="/contactus" element={<ContactUs />} /> */}
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/resetpassword" element={<ResetPass />} />

      </Routes>
    </Router>
  );
};
export default App;