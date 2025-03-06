import React, { memo, forwardRef } from 'react';
import '../CSS/ProfessionalResumePreview.css';

// Section Component
const Section = ({ title, children }) => (
    <div className="resume-section-prof">
        <div className="section-lines-prof">
            <span className="section-title-prof">{title}</span>
        </div>
        {children}
    </div>
);

// Professional Resume Preview Component
const ProfessionalResumePreview = memo(forwardRef(({ data }, ref) => {
    return (
        <div className="resume-preview-prof" ref={ref}>
            <div className="resume-header-prof">
                <div className="header-left-prof">
                    <h1>{data?.personal?.name || "Your Name"}</h1>
                    <p className="resume-email-prof">
                        <a href={`mailto:${data?.personal?.email || "your.email@example.com"}`} className="contact-link">
                            {data?.personal?.email || "your.email@example.com"}
                        </a>
                    </p>
                    <p className="resume-phone-prof">
                        {data?.personal?.phone || "000-000-0000"}
                    </p>
                    <p className="resume-location-prof">
                        {data?.personal?.address || "Your Address"}
                    </p>
                    {data?.personal?.linkedin && (
                        <p className="resume-linkedin-prof">
                            <a href={data.personal.linkedin} target="_blank" rel="noopener noreferrer" className="contact-link">
                                {data.personal.linkedin}
                            </a>
                        </p>
                    )}
                </div>
            </div>

            {data?.personal?.summary && (
                <Section title="Summary">
                    <p>{data.personal.summary}</p>
                </Section>
            )}

            {data?.experience?.length > 0 && (
                <Section title="Work Experience">
                    {data.experience.map((experience, index) => (
                        <div key={index} className="work-experience-item-prof">
                            <div className="work-header-prof">
                                <span className="work-company-name-prof">
                                    {experience.company || "Company Name"}</span>
                                    <span className="work-dates-prof">
                                        {experience.startDate || "Start Date"} - {experience.endDate || "End Date"}
                                </span>
                            </div>
                            <div className="work-header-prof">
                                <span className="work-role-prof">{experience.jobTitle || "Job Title"}</span>
                                <span className="work-location-prof">
                                    {experience.location ? `${experience.location}` : ""}
                                </span>
                            </div>
                            <ul className="work-tasks-prof">
                                {experience.tasks?.map((task, i) => (
                                    <li key={i}>{task}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </Section>
            )}

            {data?.skills?.length > 0 && (
                <Section title="Skills">
                    <ul className="skills-list-prof">
                        {data.skills.map((skill, index) => (
                            <li key={index}>{skill}</li>
                        ))}
                    </ul>
                </Section>
            )}

            {data?.projects?.length > 0 && (
                <Section title="Projects">
                    {data.projects.map((project, index) => (
                        <div key={index} className="project-item-prof">
                            <span className="project-name-prof">{project.name}</span>
                            <ul className="task-list-prof">
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
                        <div key={index} className="education-item-prof">
                            <div className="education-header-prof">
                                <span className="education-name-prof">{education.institution || "Your Institution"}</span>
                                <span className="graduation-date-prof">{education.graduationDate || "Graduation Date"}</span>
                            </div>
                            <div className="education-details-prof">
                                <span className="course-name-prof">{education.course || "Course Name"}</span>
                                <span className="education-location-prof">{education.location || "Location"}</span>
                            </div>
                        </div>
                    ))}
                </Section>
            )}
        </div>
    );
}));

export default ProfessionalResumePreview;
