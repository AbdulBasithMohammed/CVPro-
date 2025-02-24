import React, { useState, useRef } from 'react';
import '@progress/kendo-theme-default/dist/all.css';
import EditorSection from '../components/EditorSection';
import ResumePreview from '../components/ResumePreview';
import SaveButton from '../components/SaveButton';
import '../template-resume.css';
import html2canvas from "html2canvas";
import Navbar from '../components/navbar';
import Footer from '../components/footer'
import { BASE_URL } from "../Constant";

function TemplateSelection() {
  const [resumeData, setResumeData] = useState({
    personal: {
      name: '',
      email: '',
      phone: '',
      address: '',
      summary: '',
    },
    skills: [],
    experience: [],
    education: [
      {
        institution: '',
        graduationDate: '',
        course: '',
        location: '',
      },
    ],
    projects: [],
  });

  const previewRef = useRef();

  const updateSection = (section, data, index = null) => {
    if (index !== null) {
      setResumeData((prev) => {
        const updatedSection = [...prev[section]];
        updatedSection[index] = data;
        return {
          ...prev,
          [section]: updatedSection,
        };
      });
    } else {
      setResumeData((prev) => ({
        ...prev,
        [section]: data,
      }));
    }
  };



  const handleSave = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id;

    if (!userId) {
        alert("User ID not found. Please log in again.");
        return;
    }

    // Capture resume preview as image
    const resumeElement = previewRef.current;
    const fullCanvas = await html2canvas(resumeElement);
    
    // Create a thumbnail canvas
    const thumbnailCanvas = document.createElement("canvas");
    const ctx = thumbnailCanvas.getContext("2d");
    
    // Set thumbnail size (adjust as needed)
    thumbnailCanvas.width = 150;
    thumbnailCanvas.height = 200;
    ctx.drawImage(fullCanvas, 0, 0, 150, 300);

    // Convert images to Blob format
    const fullImageBlob = await new Promise((resolve) => fullCanvas.toBlob(resolve, "image/png"));
    const thumbnailBlob = await new Promise((resolve) => thumbnailCanvas.toBlob(resolve, "image/png"));

    const formData = new FormData();
    formData.append("image", fullImageBlob, "resume.png");  // Full-size image
    formData.append("thumbnail", thumbnailBlob, "resume_thumbnail.png");  // Thumbnail
    formData.append("user_id", userId);  // Send user ID

    try {
        const response = await fetch(BASE_URL+"/resume/create/", {
            method: "POST",
            body: formData,
        });

        console.log(formData);

        if (response.ok) {
            const result = await response.json();
            console.log("Resume saved:", result);
            alert("Resume saved successfully!");
        } else {
            console.error("Failed to save resume");
            alert("Error saving resume");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Network error, please try again");
    }
};
  

  return (
    <div className='Navbar'>
      <Navbar/>
      
    
    <div className="app-container">
      <div className="editor-section">
        <EditorSection data={resumeData} updateSection={updateSection} />
        <SaveButton handleSave={handleSave} />
      </div>
      <ResumePreview ref={previewRef} data={resumeData} />
    </div>
    <div className='Footer'>
      <Footer/>
    </div></div>
  );
}

export default TemplateSelection;