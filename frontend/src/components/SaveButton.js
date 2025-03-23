import React from 'react';
import '../CSS/ResumeBuilder.css'; 

const SaveButton = ({ handleSave, isFormValid }) => {
  return (
    <button 
      onClick={handleSave} 
      className={`save-button ${!isFormValid ? 'disabled' : ''}`}
      disabled={!isFormValid}
    >
      Save
    </button>
  );
};

export default SaveButton;
