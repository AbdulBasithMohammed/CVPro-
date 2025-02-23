import React, { useState, useRef } from 'react';
import '@progress/kendo-theme-default/dist/all.css';
import EditorSection from '../components/EditorSection';
import ResumePreview from '../components/ResumePreview';
import SaveButton from '../components/SaveButton';
import '../template-resume.css';
import Navbar from '../components/navbar';
import Footer from '../components/footer'


const ResumeBuilder = () => {
  const [resumeData, setResumeData] = useState({
    personal: { name: '', email: '', phone: '', address: '', summary: '' },
    skills: [],
    experience: [],
    education: [{ institution: '', graduationDate: '', course: '', location: '' }],
    projects: [],
  });

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

  const formatGraduationDate = (date) => {
    const [month, year] = date.split('/');
    const dateObj = new Date(Number(year), Number(month) - 1);
    return isNaN(dateObj.getTime()) ? "Invalid Date" : dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className='Navbar'>
    <Navbar/>
    <div className="app-container">
      <div className="editor-section">
        <EditorSection data={resumeData} updateSection={updateSection} />
        <SaveButton targetRef={previewRef} />
      </div>
      <ResumePreview ref={previewRef} data={resumeData} formatGraduationDate={formatGraduationDate} />
    </div>
    <div className='Footer'><Footer/></div>
    </div>
  );
};

export default ResumeBuilder;
