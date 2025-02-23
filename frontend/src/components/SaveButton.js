import React from 'react';
import '../SaveButton.css';

const SaveButton = ({ targetRef }) => {
  const handleSave = async () => {
    // Save functionality logic (if any needed in the future)
    console.log('Resume saved:', targetRef.current);
  };

  return (
    <div className="save-controls">
      <button
        onClick={handleSave}
        className="save-button">
        Save
      </button>
    </div>
  );
};

export default SaveButton;
