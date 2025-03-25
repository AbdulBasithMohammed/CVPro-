import { useMemo } from "react";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun, AlignmentType, TabStopType, UnderlineType, BorderStyle, Table, WidthType,  TableRow, TableCell, TableLayoutType, ExternalHyperlink} from "docx";
import "../CSS/Buttons.css";

const ExportButton = ({ targetRef, isFormValid, data, selectedTemplate = "freshie" }) => {    

    const generateSkillTable = (skills, style = {}) => {
        const rows = [];
    
        for (let i = 0; i < skills.length; i += 2) {
            const leftSkill = skills[i];
            const rightSkill = skills[i + 1];
    
            rows.push(
                new TableRow({
                    children: [
                        new TableCell({
                            children: leftSkill
                                ? [new Paragraph({
                                    children: [new TextRun({ text: `• ${leftSkill}`, ...style })],
                                    indent: { left: 350 },
                                    spacing: { after: 100 },
                                })]
                                : [new Paragraph("")],
                            borders: {
                                top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                            },
                        }),
                        new TableCell({
                            children: rightSkill
                                ? [new Paragraph({
                                    children: [new TextRun({ text: `• ${rightSkill}`, ...style })],
                                    indent: { left: 350 },
                                    spacing: { after: 100 },
                                })]
                                : [new Paragraph("")],
                            borders: {
                                top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                            },
                        }),
                    ],
                })
            );
        }
    
        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows,
            layout: TableLayoutType.AUTOFIT,
        });
    };
    
    
    
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

            console.log("📢 Exporting PDF - Element Dimensions:", input.clientWidth, input.clientHeight);

            const canvas = await html2canvas(input, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#fff",
                width: 794,
                height: 1123,
            });

            const imgData = canvas.toDataURL("image/png");

            pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
    
            pdf.save("resume.pdf");
            alert("✅Resume successfully exported as PDF!");
        } catch (error) {
            console.error("❌ Error generating PDF:", error);
            alert("Failed to export resume. Please try again.");
        }
    };

    const generateDOCX = async () => {
      const isExperienced = selectedTemplate === "experienced";

        const resumeData = data;

        const addSectionSpacing = (height = 200) =>
          new Paragraph({
              children: [],
              spacing: { before: height },
          });

          // Accept 'doc' as parameter
          const createHyperlink = (url, displayText, style = {}) => {
            return new Paragraph({
              children: [
                new ExternalHyperlink({
                  link: url,
                  children: [
                    new TextRun({
                      text: displayText,
                      style: "Hyperlink",
                      color: "0A66C2",
                      underline: { type: UnderlineType.SINGLE },
                      bold: true,
                      ...style,
                    }),
                  ],
                }),
              ],
              alignment: templateStyles.alignment,
              spacing: { after: 100 },
            });
          };                
    
        if (
            !resumeData?.personal?.name ||
            !resumeData?.personal?.email ||
            !resumeData?.personal?.phone ||
            !resumeData?.personal?.address
        ) {
            alert("⚠️ Please fill in all personal details (name, email, phone, address) before exporting.");
            return;
        }

        const createParagraph = (text, style = {}) => {
            if (!text || text.trim() === "") return null;
            return new Paragraph({
                children: [new TextRun({ text, ...style })],
                indent: { left: 350 },
                alignment: templateStyles.alignment || AlignmentType.LEFT,
                spacing: { after: 150 },
            });
        };
    
        const generateList = (items, style = {}) =>
            (items || []).filter(Boolean).map((item) =>
                new Paragraph({
                    children: [new TextRun({ text: "• " + item, ...style })],
                    indent: { left: 350 },
                    spacing: { after: 100 },
                })
            );
    
            const sectionHeader = (title, style = {}) => {
              if (isExperienced) {
                  // Left-aligned underlined header for experienced template
                  return new Paragraph({
                      children: [
                          new TextRun({
                              text: title.toUpperCase(),
                              underline: {
                                  type: UnderlineType.SINGLE,
                                  color: style?.color || "000000",
                              },
                              ...style,
                          }),
                      ],
                      alignment: AlignmentType.LEFT,
                      spacing: { after: 150 },
                  });
              } else {
                  // Center-aligned header with decorative lines for freshie template
                  const docxPageWidth = 100;
                  const titleLength = title.length;
                  const lineLength = Math.max(15, Math.floor((docxPageWidth - titleLength * 2) / 2));
                  const leftLine = "─".repeat(lineLength);
                  const rightLine = "─".repeat(lineLength);
          
                  return new Paragraph({
                      children: [
                          new TextRun({ text: leftLine, bold: true, size: 14 }),
                          new TextRun({ text: `  ${title.toUpperCase()}  `, bold: true, size: 22, ...style }),
                          new TextRun({ text: rightLine, bold: true, size: 14 }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { after: 100 },
                  });
              }
          };
          
        const freshieTemplate = {
            fontSize: 22,
            nameStyle: { bold: true, size: 36, color: "000000" },
            sectionStyle: { bold: true, size: 24, color: "000000" },
            textStyle: { size: 22, color: "000000" },
            listStyle: { size: 22, color: "000000" },
            italicsStyle: { italics: true, size: 22, color: "000000" },
            rightAlignStyle: { size: 22, color: "000000", alignment: AlignmentType.RIGHT },
            alignment: AlignmentType.CENTER,
        };

        const experiencedTemplate = {
          fontSize: 26,
          nameStyle: { bold: true, size: 36, color: "000000" },
          sectionStyle: { bold: true, size: 24, color: "000000" },
          textStyle: { size: 22, color: "000000" },
          listStyle: { size: 22, color: "000000" },
          italicsStyle: { italics: true, size: 22, color: "000000" },
          rightAlignStyle: { size: 22, color: "000000", alignment: AlignmentType.RIGHT },
          alignment: AlignmentType.LEFT,
      };

      const templateStyles = isExperienced ? experiencedTemplate : freshieTemplate;
    
      const doc = new Document({
        sections: [
            {
                properties: {
                    page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
                },
                children: [], // Placeholder for now
            },
        ],
    });
    
        const docContent = [
            new Paragraph({
                children: [new TextRun({ text: resumeData.personal.name?.toUpperCase(), ...templateStyles.nameStyle })],
                alignment: templateStyles.alignment,
                spacing: { after: 40 }, 
            }),
    
            ...(isExperienced
              ? [
                resumeData.personal.email &&
                createHyperlink(`mailto:${resumeData.personal.email}`, resumeData.personal.email, {
                  bold: true,
                  ...templateStyles.textStyle,
                }),            
                  resumeData.personal.phone && new Paragraph({
                    children: [new TextRun({ text: resumeData.personal.phone, ...templateStyles.textStyle })],
                    alignment: AlignmentType.LEFT,
                  }),
                  resumeData.personal.address && new Paragraph({
                    children: [new TextRun({ text: resumeData.personal.address, ...templateStyles.textStyle })],
                    alignment: AlignmentType.LEFT,
                  }),
                ].filter(Boolean)
              : [
                new Paragraph({
                  children: [
                    new ExternalHyperlink({
                      link: `mailto:${resumeData.personal.email}`,
                      children: [
                        new TextRun({
                          text: resumeData.personal.email,
                          color: "0A66C2",
                          underline: { type: UnderlineType.SINGLE },
                          bold: true,
                          ...templateStyles.textStyle,
                        }),
                      ],
                    }),                                
                      new TextRun({ text: " | " }),
                      new TextRun({ text: resumeData.personal.phone || "", ...templateStyles.textStyle }),
                      new TextRun({ text: " | " }),
                      new TextRun({ text: resumeData.personal.address || "", ...templateStyles.textStyle }),
                    ],
                    alignment: templateStyles.alignment,
                  }),
                ]),
                
                ...(resumeData.personal?.linkedin?.trim()
                ? [
                    createHyperlink(doc, resumeData.personal.linkedin, resumeData.personal.linkedin, {
                      bold: true,
                      ...templateStyles.textStyle,
                      spacing: { after: 40 },
                    }),
                  ]
                : []),              

            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph("")],
                        borders: {
                          top: { style: BorderStyle.SINGLE, size: 14, color: "000000" },
                          bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, // Thicker line
                          left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                          right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                        },
                      }),
                    ],
                  }),
                ],
                layout: TableLayoutType.AUTOFIT,
                spacing: { after: 40 },
              }),
              
            // Optional Summary Section (only if non-empty)
            ...(resumeData.personal?.summary?.trim()
            ? [
                sectionHeader("SUMMARY", templateStyles.sectionStyle),
                new Paragraph({
                  children: [new TextRun({ text: resumeData.personal.summary, ...templateStyles.textStyle })],
                  alignment: AlignmentType.LEFT, // ✅ Force left alignment
                  indent: { left: 350 },
                  spacing: { after: 150 },
                }),
               ]
            : []),
    
            // Experience Section (Only for 'experienced' template)
...(isExperienced && resumeData.experience?.length
    ? [
        sectionHeader("EXPERIENCE", templateStyles.sectionStyle),
        ...resumeData.experience.flatMap((exp) => {
          const leftIndent = 350;
          return [
            // Line 1: Company Name — Start - End Dates
            new Paragraph({
              children: [
                new TextRun({ text: exp.company || "", bold: true, size: 26 }),
                new TextRun({
                  text: exp.startDate && exp.endDate ? `\t${exp.startDate} - ${exp.endDate}` : "",
                  size: 20, 
                }),
              ],
              tabStops: [
                {
                  type: TabStopType.RIGHT,
                  position: 9350,
                },
              ],
              indent: { left: leftIndent },
              spacing: { after: 50 },
            }),
  
            // Line 2: Job Title — Location
            new Paragraph({
              children: [
                new TextRun({ text: exp.jobTitle || "", size: templateStyles.fontSize }),
                new TextRun({
                  text: exp.location ? `\t${exp.location}` : "",
                  italics: true,
                  size: 22,
                }),
              ],
              tabStops: [
                {
                  type: TabStopType.RIGHT,
                  position: 9350,
                },
              ],
              indent: { left: leftIndent },
              spacing: { after: 100 },
            }),
  
            // Tasks
            ...(exp.tasks && Array.isArray(exp.tasks)
              ? generateList(exp.tasks, templateStyles.listStyle)
              : []),
          ].filter(Boolean);
        }),
      ]
    : []),
  
            ...(resumeData.skills?.length ? [addSectionSpacing(), sectionHeader("SKILLS", templateStyles.sectionStyle)] : []),
            ...(resumeData.skills?.length ? [generateSkillTable(resumeData.skills, templateStyles.listStyle)] : []),

            ...(resumeData.projects?.length ? [addSectionSpacing(), sectionHeader("PROJECTS", templateStyles.sectionStyle)] : []),
            ...(resumeData.projects?.length
                ? resumeData.projects.flatMap((project) => [
                  new Paragraph({
                    children: [new TextRun({ text: project.name, bold: true, size: 24 })],
                    alignment: AlignmentType.LEFT,
                    spacing: { after: 100 },
                    indent: { left: 350 },
                  }),
                    ...generateList(project.tasks || [], templateStyles.listStyle),
                    addSectionSpacing(150),
                  ])
                : []),

                ...(resumeData.education?.length ? [addSectionSpacing(), sectionHeader("EDUCATION", templateStyles.sectionStyle)] : []),
                ...(resumeData.education?.length
                  ? resumeData.education.flatMap((edu) => {
                      const leftIndent = 350;
                      return [
                        // Row 1: Institution (left) + Graduation Date (right)
                        new Paragraph({
                          children: [
                            new TextRun({ text: edu.institution || "", bold: true, size: 24 }),
                            new TextRun({
                              text: edu.graduationDate ? "\t" + edu.graduationDate : "",
                              size: 20, 
                            }),
                          ],
                          tabStops: [
                            {
                              type: TabStopType.RIGHT,
                              position: 9350, // Align right (in twips, adjust as needed)
                            },
                          ],
                          indent: { left: leftIndent },
                          spacing: { after: 100 },
                        }),
                
                        // Row 2: Course (left) + Location (right)
                        new Paragraph({
                          children: [
                            new TextRun({ text: edu.course || "", italics: true, size: 22 }),
                            new TextRun({
                              text: edu.location ? "\t" + edu.location : "",
                              italics: true,
                              size: 22,
                            }),
                          ],
                          tabStops: [
                            {
                              type: TabStopType.RIGHT,
                              position: 9350,
                            },
                          ],
                          indent: { left: leftIndent },
                          spacing: { after: 150 },
                        }),
                      ];
                    })
                  : []),
                
        ].filter(Boolean);
    
        try {
            if (docContent.length === 0) {
                alert("⚠️ Cannot generate an empty document.");
                return;
            }
    
            const doc = new Document({
                sections: [
                    {
                        properties: {
                            page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
                        },
                        children: docContent,
                    },
                ],
            });
    
            const blob = await Packer.toBlob(doc);
    
            if (blob.size === 0) {
                throw new Error("Generated DOCX file is empty!");
            }
    
            saveAs(blob, "resume.docx");
            alert("✅ Resume successfully exported as DOCX!");
        } catch (error) {
            console.error("❌ Error generating DOCX:", error);
            alert("Failed to export resume as DOCX.");
        }
    };    
    
    return (
        <div className="button-controls">
            <button onClick={generatePDF} className={`export-button`} disabled={!isFormValid}>
                    Export as PDF
                </button>
            <button onClick={generateDOCX} className="export-button" disabled={!isFormValid}>
                Export as DOCX
            </button>
        </div>
    );
};

export default ExportButton;