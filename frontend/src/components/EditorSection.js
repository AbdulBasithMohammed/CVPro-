import React from 'react';
import { useState } from 'react';
import '../EditorSection.css';


const EditorSection = ({ data, updateSection }) => {
    const [summaryLength, setSummaryLength] = useState(data.personal.summary.length);
    const MAX_SUMMARY_LENGTH = 300;

    const handleInputChange = (section, field, value) => {
        const updatedData = { ...data[section], [field]: value };
        updateSection(section, updatedData);
    };

    const handleSummaryChange = (e) => {
        const value = e.target.value;
        if (value.length <= MAX_SUMMARY_LENGTH) {
            setSummaryLength(value.length);
            handleInputChange('personal', 'summary', value);
        }
    };

    const handleArrayChange = (section, index, field, value) => {
        const newData = [...data[section]];
        newData[index][field] = value;
        updateSection(section, newData);
    };

    const addItem = (section, newItem) => {
        updateSection(section, [...data[section], newItem]);
    };

    const removeItem = (section, index) => {
        updateSection(section, data[section].filter((_, i) => i !== index));
    };

    const addSkill = () => {
        const updatedSkills = [...data.skills, ''];
        updateSection('skills', updatedSkills);
    };

    const handleSkillChange = (index, value) => {
        const updatedSkills = [...data.skills];
        updatedSkills[index] = value;
        updateSection('skills', updatedSkills);
    };

    const removeSkill = (index) => {
        const updatedSkills = data.skills.filter((_, i) => i !== index);
        updateSection('skills', updatedSkills);
    };

    const addEducation = () => {
        if (data.education.length < 2) {
            updateSection('education', [...data.education, { university: '', graduationDate: '', location: '', course: '' }]);
        }
    };

    const handleEducationChange = (index, field, value) => {
        const updatedEducation = [...data.education];
        updatedEducation[index][field] = value;
        updateSection('education', updatedEducation);
    };

    const removeEducation = (index) => {
        updateSection('education', data.education.filter((_, i) => i !== index));
    };

    // Work Experience Section Functions
    const addWorkExperience = () => {
        updateSection('workExperience', [
            ...data.workExperience,
            { companyName: '', startDate: '', endDate: '', role: '', location: '', tasks: [] }
        ]);
    };

    const handleWorkExperienceChange = (index, field, value) => {
        const updatedWorkExperience = [...data.workExperience];
        updatedWorkExperience[index][field] = value;
        updateSection('workExperience', updatedWorkExperience);
    };

    const removeWorkExperience = (index) => {
        updateSection('workExperience', data.workExperience.filter((_, i) => i !== index));
    };

    const addWorkTask = (index) => {
        const updatedWorkExperience = [...data.workExperience];
        updatedWorkExperience[index].tasks.push('');
        updateSection('workExperience', updatedWorkExperience);
    };

    const handleWorkTaskChange = (index, taskIndex, value) => {
        const updatedWorkExperience = [...data.workExperience];
        updatedWorkExperience[index].tasks[taskIndex] = value;
        updateSection('workExperience', updatedWorkExperience);
    };

    const removeWorkTask = (index, taskIndex) => {
        const updatedWorkExperience = [...data.workExperience];
        updatedWorkExperience[index].tasks.splice(taskIndex, 1);
        updateSection('workExperience', updatedWorkExperience);
    };
    

    return (
        <div className="editor-container">
            <div className="editor-section">
                <h2>Personal Details</h2>
                {['name', 'email', 'phone', 'address'].map((field) => (
                    <div key={field} className="form-group">
                        <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                        <input
                            type={field === 'email' ? 'email' : 'text'}
                            value={data.personal[field]}
                            onChange={(e) => handleInputChange('personal', field, e.target.value)}
                        />
                    </div>
                ))}
                <div className="form-group">
                    <label>Summary</label>
                    <textarea
                        value={data.personal.summary}
                        onChange={handleSummaryChange}
                        maxLength={MAX_SUMMARY_LENGTH}
                    />
                    <div className="char-count">{summaryLength} / {MAX_SUMMARY_LENGTH} characters</div>
                </div>
            </div>

            {/* Skills Section */}
            <div className="editor-section">
                <h2>Skills</h2>
                <button onClick={addSkill}>Add Skill</button>
                <div className="skills-list">
                    {data.skills.map((skill, index) => (
                        <div key={index} className="form-group">
                            <input
                                value={skill}
                                onChange={(e) => handleSkillChange(index, e.target.value)}
                                placeholder={`Skill ${index + 1}`}
                            />
                            <button className="remove-skill" onClick={() => removeSkill(index)}>×</button>
                        </div>
                    ))}
                </div>
            </div>

            {[{ section: 'experience', title: 'Work Experience' }, { section: 'projects', title: 'Projects' }].map(({ section, title }) => (
                <div key={section} className="editor-section">
                    <h2>{title}</h2>
                    <button onClick={() => addItem(section, section === 'experience' ? {
                        Company: '', Position: '', StartDate: '', EndDate: '', Tasks: [], Location: ''
                    } : {
                        name: '', tasks: [] 
                    })}>Add {title.slice(0, -1)}</button>
                    {data[section].map((item, index) => (
                        <div key={index} className="item-group">
                            {Object.keys(item).filter(field => field !== 'tasks').map((field) => (
                                <div key={field} className="form-group">
                                    <label>{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                                    {field === 'tasks' ? null : (
                                        field.includes('Date') ? (
                                            <input
                                                type="text"
                                                value={item[field] || ''}
                                                onChange={(e) => handleArrayChange(section, index, field, e.target.value)}
                                                placeholder="MM/YYYY"
                                                maxLength={7}
                                                pattern="\d{2}/\d{4}"
                                            />
                                        ) : (
                                            <input
                                                value={item[field]}
                                                onChange={(e) => handleArrayChange(section, index, field, e.target.value)}
                                            />
                                        )
                                    )}
                                </div>
                            ))}
                            <div className="tasks-section">
                                <label>Tasks</label>
                                {item.tasks?.map((task, taskIndex) => (
                                    <div key={taskIndex} className="task-input">
                                        <input
                                            value={task}
                                            onChange={(e) => {
                                                const newItems = [...data[section]];
                                                newItems[index].tasks[taskIndex] = e.target.value;
                                                updateSection(section, newItems);
                                            }}
                                        />
                                        <button className="remove-task" onClick={() => {
                                            const newItems = [...data[section]];
                                            newItems[index].tasks.splice(taskIndex, 1);
                                            updateSection(section, newItems);
                                        }}>×</button>
                                    </div>
                                ))}
                                <button className="add-task" onClick={() => {
                                    const newItems = [...data[section]];
                                    newItems[index].tasks = [...(newItems[index].tasks || []), ''];
                                    updateSection(section, newItems);
                                }}>Add Task</button>
                            </div>
                            <button className="remove-item" onClick={() => removeItem(section, index)}>Remove {title.slice(0, -1)}</button>
                        </div>
                    ))}
                </div>
            ))}

            {/* Education Section */}
            <div className="editor-section">
                <h2>Education</h2>
                <button onClick={addEducation} disabled={data.education.length >= 2}>Add Education</button>
                {data.education.map((education, index) => (
                    <div key={index} className="item-group">
                        <div className="form-group">
                            <label>University/College</label>
                            <input
                                value={education.university}
                                onChange={(e) => handleEducationChange(index, 'university', e.target.value)}
                                placeholder="University/College Name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Graduation Date (mm/yyyy)</label>
                            <input
                                type="month"
                                value={education.graduationDate}
                                onChange={(e) => handleEducationChange(index, 'graduationDate', e.target.value)}
                                placeholder="Graduation Date"
                            />
                        </div>
                        <div className="form-group">
                            <label>Location</label>
                            <input
                                value={education.location}
                                onChange={(e) => handleEducationChange(index, 'location', e.target.value)}
                                placeholder="Location"
                            />
                        </div>
                        <div className="form-group">
                            <label>Course</label>
                            <input
                                value={education.course}
                                onChange={(e) => handleEducationChange(index, 'course', e.target.value)}
                                placeholder="Course Name"
                            />
                        </div>
                        <button className="remove-item" onClick={() => removeEducation(index)}>Remove Education</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EditorSection;
