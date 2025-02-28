import React, { useState, useEffect } from 'react';
import '../CSS/SaveButton.css';

const SaveButton = ({ handleSave }) => {
  // State to track form validity
  const [isFormValid, setIsFormValid] = useState(false);

  // Function to check the validation status from localStorage
  const checkFormValidity = () => {
    const isValid = localStorage.getItem("formIsValid");
    return isValid === "true"; // Convert string to boolean
  };

  // Effect to continuously monitor localStorage for changes
  useEffect(() => {
    // Initial check
    setIsFormValid(checkFormValidity());

    // Set up interval to check regularly
    const intervalId = setInterval(() => {
      const currentValidity = checkFormValidity();
      setIsFormValid(currentValidity);
    }, 500); // Check every 500ms

    // Optional: Set up storage event listener for direct updates
    const handleStorageChange = (e) => {
      if (e.key === "formIsValid") {
        setIsFormValid(e.newValue === "true");
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    // Clean up on component unmount
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array means this runs once on mount

  const onSaveClick = () => {
    // Check one more time before saving
    if (checkFormValidity()) {
      handleSave();
    } else {
      // Optionally show an error message
      alert("Please fix all validation errors before saving");
    }
  };

  return (
    <div className="save-controls">
      <button 
        onClick={onSaveClick} 
        className={`save-button ${!isFormValid ? 'disabled' : ''}`}
        disabled={!isFormValid}
      >
        Save
      </button>
      {!isFormValid && (
        <p className="error-message">Please fix all validation errors before saving</p>
      )}
    </div>
  );
};

export default SaveButton;