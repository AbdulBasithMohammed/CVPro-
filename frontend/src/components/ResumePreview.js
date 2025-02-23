import React from 'react';
import { memo, forwardRef } from 'react';
import '../ResumePreview.css';

const ResumePreview = memo(forwardRef(({ data }, ref) => {
    return (
        <div className="resume-preview" ref={ref}>
            <div className="resume-header">
                <h1>{data.personal.name}</h1>
                <p>{data.personal.email} | {data.personal.phone} | {data.personal.address}</p>
            </div>

            {data.personal.summary && (
                <Section title="Summary">
                    <p>{data.personal.summary}</p>
                </Section>
            )}

            {data.skills.length > 0 && (
                <Section title="Skills">
                    <ul className="skills-list">
                        {data.skills.map((skill, index) => (
                            <li key={index}>{skill}</li>
                        ))}
                    </ul>
                </Section>
            )}

            {data.projects.length > 0 && (
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

            {data.education.length > 0 && (
                <Section title="Education">
                    {data.education.map((education, index) => (
                        <div key={index} className="education-item">
                            <div className="education-header">
                                <span className="education-name">{education.university}</span>
                                <span className="graduation-date">{education.graduationDate}</span>
                            </div>
                            <div className="education-details">
                                <span className="course-name">{education.course}</span>
                                <span className="education-location">{education.location}</span>
                            </div>
                        </div>
                    ))}
                </Section>
            )}
        </div>
    );
}));

const Section = ({ title, children }) => (
    <div className="resume-section">
        <div className="section-lines">
            <span className="section-title">{title}</span>
        </div>
        {children}
    </div>
);

export default ResumePreview;
