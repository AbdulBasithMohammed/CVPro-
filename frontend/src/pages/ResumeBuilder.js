import React, { useState, useRef } from 'react';
import EditorSection from '../components/EditorSection';
import ResumePreview from '../components/ResumePreview';
import SaveButton from '../components/SaveButton';
// import '../template-resume.css';
import Navbar from '../components/navbar';
import Footer from '../components/footer';

const ResumeBuilder = () => {
  const [resumeData, setResumeData] = useState({
    personal: { name: '', email: '', phone: '', address: '', summary: '' },
    skills: [],
    experience: [{jobTitle: '', company: '', startDate: '', endDate: '', tasks: ['']}],
    education: [{ institution: '', graduationDate: '', course: '', location: '' }],
    projects: [],
  });

  // Maintain a flag for overall form validity
  const [isFormValid, setIsFormValid] = useState(false);
  const previewRef = useRef();

  const updateSection = (section, data, index = null) => {
    if (index !== null) {
      setResumeData(prev => {
        const updatedSection = [...prev[section]];
        updatedSection[index] = data;
        return { ...prev, [section]: updatedSection };
      });
    } else {
      setResumeData(prev => ({ ...prev, [section]: data }));
    }
  };

  const handleSave = () => {
    if (isFormValid) {
      console.log('Form is valid. Saving data...');
      // Place your save logic here.
    } else {
      console.log('Cannot save: fix the errors first.');
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
          onValidationChange={setIsFormValid}
        />
        <SaveButton onClick={handleSave} disabled={!isFormValid} />
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