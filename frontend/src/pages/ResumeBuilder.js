import React, { useState, useRef } from 'react';
import EditorSection from '../components/EditorSection';
import ResumePreview from '../components/ResumePreview';
import SaveButton from '../components/SaveButton';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
console.log("✅ ResumeBuilder.js is running!");

const ResumeBuilder = () => {
  console.log("ResumeBuilder component is rendering..."); // ✅ Debug log

  const [resumeData, setResumeData] = useState({
    personal: { name: '', email: '', phone: '', address: '', summary: '' },
    skills: [],
    experience: [{ jobTitle: '', company: '', startDate: '', endDate: '', tasks: [''] }],
    education: [{ institution: '', graduationDate: '', course: '', location: '' }],
    projects: [],
  });

  const [isFormValid, setIsFormValid] = useState(false); // ✅ Track form validation
  const previewRef = useRef();
  
  // Force re-render function (only if needed)
  const [, forceUpdate] = useState(); 

  const updateSection = (section, data) => {
    setResumeData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const handleValidationChange = (isValid) => {
    console.log("handleValidationChange received:", isValid); // ✅ Debug log
    setIsFormValid(isValid);
    forceUpdate({}); // ✅ Force re-render if state isn't updating
  };

  const handleSave = () => {
    if (isFormValid) {
      console.log("Form is valid. Saving data...", resumeData);
      localStorage.setItem('resumeData', JSON.stringify(resumeData));
      alert('Resume data saved successfully!');
    } else {
      console.log("Cannot save: fix the errors first.");
    }
  };

  console.log("ResumeBuilder - isFormValid:", isFormValid); // ✅ Debug log

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-grow p-4">
        <div className="flex-1 p-4 bg-white shadow-md rounded-lg mr-4">
          <EditorSection
            data={resumeData}
            updateSection={updateSection}
            onValidationChange={handleValidationChange}
          />
          <SaveButton 
            handleSave={handleSave} 
            disabled={!isFormValid} 
          />
        </div>
        <div className="flex-1 p-4 bg-white shadow-md rounded-lg">
          <ResumePreview ref={previewRef} data={resumeData} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResumeBuilder;
