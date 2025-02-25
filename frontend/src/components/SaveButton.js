import React from 'react';
import '../CSS/SaveButton.css';

const SaveButton = ({ handleSave }) => {
  return (
    <div className="save-controls">
      <button onClick={handleSave} className="save-button">
        Save
      </button>
    </div>
  );
};

export default SaveButton;