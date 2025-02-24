import { memo, forwardRef } from 'react';
import '../ProfessionalResumePreview.css';

const ProfessionalResumePreview = memo(forwardRef(({ data }, ref) => {
    return (
        <div className="resume-preview" ref={ref}>
            <div className="resume-header">
                <div className="header-left">
                    <h1 className="resume-name">{data.personal.name}</h1>
                    <p className="resume-location">{data.personal.address}</p>
                </div>
                <div className="header-right">
                    <p className="resume-phone">{data.personal.phone}</p>
                    <p className="resume-email">{data.personal.email}</p>
                </div>
            </div>

            {/* Summary Section */}
            {data.personal.summary && (
                <Section title="Summary">
                    <p className="resume-summary">{data.personal.summary}</p>
                </Section>
            )}

            {/* Experience Section */}
            {data.experience.length > 0 && (
                <Section title="Experience">
                    {data.experience.map((experience, index) => (
                        <div key={index} className="experience-item">
                            <div className="experience-header">
                                <span className="job-title">{experience.jobTitle}</span>
                                <span className="employment-dates">{formatDate(experience.StartDate)} - {formatDate(experience.EndDate)}</span>
                            </div>
                            <span className="company-location">{experience.company} - {experience.Location}</span>
                            <ul className="responsibilities-list">
                                {experience.tasks?.length > 0 ? ( 
                                    experience.tasks.map((task, i) => (
                                        <li key={i} className="task-item">{task}</li> 
                                    ))
                                ) : (
                                    <li>No tasks available.</li> 
                                )}
                            </ul>
                        </div>
                    ))}
                </Section>
            )}

            {/* Skills Section */}
            {data.skills.length > 0 && (
                <Section title="Skills">
                    <ul className="skills-list">
                        {data.skills.map((skill, index) => (
                            <li key={index}>{skill}</li>
                        ))}
                    </ul>
                </Section>
            )}

            {/* Education Section */}
            {data.education.length > 0 && (
                <Section title="Education">
                    {data.education.map((education, index) => (
                        <div key={index} className="education-item">
                            <div className="education-header">
                                <span className="education-name">{education.university}</span>
                                <span className="graduation-date">{formatDate(education.graduationDate)}</span>
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

const formatDate = (date) => {
    if (date instanceof Date && !isNaN(date)) {
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const year = date.getFullYear(); 
        return `${month}/${year}`; 
    } else if (typeof date === 'string') {
        const [month, year] = date.split('/');
        if (month && year) {
            const formattedMonth = String(month).padStart(2, '0'); 
            return `${formattedMonth}/${year}`; 
        }
    }
    return "Invalid Date"; 
};

export default ProfessionalResumePreview;
