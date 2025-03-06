import React, { memo, forwardRef } from 'react';
import '../CSS/ResumePreview.css';

// Section Component
const Section = ({ title, children }) => (
    <div className="resume-section">
        <div className="section-lines">
            <span className="section-title">{title}</span>
        </div>
        {children}
    </div>
);

// ResumePreview Component
const ResumePreview = memo(forwardRef(({ data }, ref) => {
    return (
        <div className="resume-preview-container">
            <div className="resume-preview" ref={ref}>
                <div className="resume-header">
                    <h1>{data?.personal?.name || "Your Name"}</h1>
                    <p>
                        <a href={`mailto:${data?.personal?.email || "your.email@example.com"}`} className="contact-link">
                            {data?.personal?.email || "your.email@example.com"}
                        </a> |
                        {" "}{ data?.personal?.phone || "000-000-0000"} |
                        {" "}{ data?.personal?.address || "Your Address"}
                        </p>
                        <p>
                        {data?.personal?.linkedin && (
                            <> <a href={data.personal.linkedin} target="_blank" rel="noopener noreferrer" className="contact-link">
                                {data.personal.linkedin}
                            </a></>
                        )}
                    </p>
                </div>

                {data?.personal?.summary && (
                    <Section title="Summary">
                        <p>{data.personal.summary}</p>
                    </Section>
                )}

                {data?.skills?.length > 0 && (
                    <Section title="Skills">
                        <ul className="skills-list">
                            {data.skills.map((skill, index) => (
                                <li key={index}>{skill}</li>
                            ))}
                        </ul>
                    </Section>
                )}

                {data?.projects?.length > 0 && (
                    <Section title="Projects">
                        {data.projects.map((project, index) => (
                            <div key={index} className="project-item">
                                <span className="project-name">{project.name}</span>
                                <ul className="task-list">
                                    {project.tasks?.map((task, i) => (
                                        <li key={i}>{task}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </Section>
                )}

                {data?.education?.length > 0 && (
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
            </div>
        </div>
    );
}));

export default ResumePreview;
