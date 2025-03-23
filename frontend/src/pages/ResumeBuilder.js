import React, { useState, useRef } from 'react';
import EditorSection from '../components/EditorSection';
import ResumePreview from '../components/ResumePreview';
import SaveButton from '../components/SaveButton';
import ExportButton from '../components/ExportButton'; // ✅ Import ExportButton
import Navbar from '../components/navbar';
import Footer from '../components/footer';

console.log("✅ ResumeBuilder.js is running!");

const ResumeBuilder = () => {
  console.log("ResumeBuilder component is rendering..."); // ✅ Debug log

  const [resumeData, setResumeData] = useState({
    personal: { name: '', email: '', phone: '', address: '', linkedin: '', summary: '' },
    skills: [],
    experience: [{ jobTitle: '', company: '', startDate: '', endDate: '', tasks: [''] }],
    education: [{ institution: '', graduationDate: '', course: '', location: '' }],
    projects: [],
  });

  const [isFormValid, setIsFormValid] = useState(false); // ✅ Track form validation
  const [showError, setShowError] = useState(false); // ✅ Track if error message should be shown
  const previewRef = useRef();

  const updateSection = (section, data) => {
    setResumeData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const handleValidationChange = (isValid) => {
    console.log("handleValidationChange received:", isValid); // ✅ Debug log
    setIsFormValid(isValid);
    setShowError(!isValid); // ✅ Show error only if form is invalid
  };

  const handleSave = () => {
    if (isFormValid) {
      console.log("Form is valid. Saving data...", resumeData);
      localStorage.setItem('resumeData', JSON.stringify(resumeData));
      alert('Resume data saved successfully!');
    } else {
      setShowError(true); //  Show error if form is not valid
    }
  };

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

          {/* ✅ Show error message when form is invalid */}
          {showError && (
            <p className="text-red-600 font-semibold mt-2">
              Please fix all validation errors before exporting or saving.
            </p>
          )}

        <div className="button-controls">
          <SaveButton handleSave={handleSave} isFormValid={isFormValid} />
          <ExportButton targetRef={previewRef} isFormValid={isFormValid} />
        </div>

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
