import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../CSS/ResumeBuilder.css'; 

const ExportButton = ({ targetRef, isFormValid }) => {
    const generatePDF = async () => {
        if (!isFormValid) {
            alert("Please fix all validation errors before exporting.");
            return;
        }
    
        const input = targetRef.current;
        if (!input) {
            alert("Resume preview not found.");
            return;
        }
    
        try {
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            console.log("Element Width:", input.clientWidth, "Height:", input.clientHeight);
    
            const canvas = await html2canvas(input, {
                scale: 2, 
                useCORS: true,
                backgroundColor: "#fff",
                width: 794, 
                height: 1123,
            });
    
            console.log("Canvas Width:", canvas.width, "Canvas Height:", canvas.height);
    
            const imgData = canvas.toDataURL("image/png");
    
            pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
    
            pdf.save("resume.pdf");
            alert("Resume successfully exported as PDF!");
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to export resume. Please try again.");
        }
    };

    return (
        <>
            <button
                onClick={generatePDF}
                className={`export-button ${!isFormValid ? 'disabled' : ''}`}
                disabled={!isFormValid}
            >
                Export
            </button>

            {!isFormValid && (
                <p className="error-message">Please fix all validation errors before exporting</p>
            )}
        </>
    );
};

export default ExportButton;
