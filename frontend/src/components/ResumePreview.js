import React, { forwardRef } from 'react';
import '../CSS/ResumePreview.css';

const Section = ({ title, children }) => (
    <div className="resume-section">
        <div className="section-lines">
            <span className="section-title">{title}</span>
        </div>
        {children}
    </div>
);

const ResumePreview = forwardRef(({ data }, ref) => {
    if (!data || Object.keys(data).length === 0) {
        console.warn("⚠️ Warning: ResumePreview received empty data.");
        return <p className="error-message">⚠️ No resume data available. Please fill in the form.</p>;
    }

    const renderContent = () => (
        <>
            <div className="resume-header">
                <h1>{data?.personal?.name || "Your Name"}</h1>
                <p>
                    <a href={`mailto:${data?.personal?.email}`} className="contact-link">
                        {data?.personal?.email || "your.email@example.com"}
                    </a> | {" "}
                    {data?.personal?.phone || "000-000-0000"} | {" "}
                    {data?.personal?.address || "Your Address"}
                </p>
                {data?.personal?.linkedin && (
                    <p>
                        <a href={data.personal.linkedin} target="_blank" rel="noopener noreferrer" className="contact-link">
                            {data.personal.linkedin}
                        </a>
                    </p>
                )}
            </div>

            {data?.personal?.summary && (
                <Section title="Summary">
                    <p>{data.personal.summary}</p>
                </Section>
            )}

            {Array.isArray(data?.skills) && data.skills.length > 0 && (
                <Section title="Skills">
                    <ul className="skills-list">
                        {data.skills.map((skill, index) => (
                            <li key={index}>{skill}</li>
                        ))}
                    </ul>
                </Section>
            )}

            {Array.isArray(data?.projects) && data.projects.length > 0 && (
                <Section title="Projects">
                    {data.projects.map((project, index) => (
                        <div key={index} className="project-item">
                            <span className="project-name">{project.name || "Project Name"}</span>
                            {Array.isArray(project.tasks) && project.tasks.length > 0 && (
                                <ul className="task-list">
                                    {project.tasks.map((task, i) => (
                                        <li key={i}>{task}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </Section>
            )}

            {Array.isArray(data?.education) && data.education.length > 0 && (
                <Section title="Education">
                    {data.education.map((education, index) => (
                        <div key={index} className="education-item">
                            <div className="education-header">
                                <span className="education-name">{education.institution || "Your Institution"}</span>
                                <span className="graduation-date">{education.graduationDate || "Graduation Date"}</span>
                            </div>
                            <div className="education-details">
                                <span className="course-name">{education.course || "Course Name"}</span>
                                <span className="education-location">{education.location || "Location"}</span>
                            </div>
                        </div>
                    ))}
                </Section>
            )}
        </>
    );

    return (
        <div className="resume-preview-container" ref={ref}>
            <div className="resume-preview">
                {renderContent()}
            </div>
        </div>
    );
});

export default ResumePreview;
