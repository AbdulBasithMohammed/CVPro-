import React from 'react';
import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../styles/ExportButton.css'

const ExportButton = ({ targetRef }) => {
    const [exportFormat, setExportFormat] = useState('pdf');

    const generatePDF = async () => {
        const input = targetRef.current;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageHeight = pdf.internal.pageSize.getHeight();

        const canvas = await html2canvas(input, {
            scale: 2,
            useCORS: true,
            windowHeight: input.scrollHeight
        });

        const imgProps = pdf.getImageProperties(canvas);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        let heightLeft = pdfHeight;
        let position = 0;

        pdf.addImage(canvas, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - pdfHeight;
            pdf.addPage();
            pdf.addImage(canvas, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;
        }

        pdf.save('resume.pdf');
    };

    return (
        <div className="export-controls">
            <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
            >
                <option value="pdf">PDF</option>
            </select>

            <button
                onClick={generatePDF}
                className="export-button"
            >
                Export
            </button>
        </div>
    );
};

export default ExportButton;