import React, { useState } from 'react';
import '../EditorSection.css';

const EditorSection = ({ data, updateSection }) => {
    const [summaryLength, setSummaryLength] = useState(data.personal.summary.length);
    const MAX_SUMMARY_LENGTH = 300;

    // ✅ Get the selected template from localStorage
    const selectedTemplate = localStorage.getItem("selectedTemplate") || "freshie"; // Default to "freshie"

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

    // ✅ Work Experience Section (Only Show if "experienced")
    const addWorkExperience = () => {
        addItem('experience', { jobTitle: '', company: '', startDate: '', endDate: '', tasks: [''] });
    };

    const handleWorkExperienceChange = (index, field, value) => {
        handleArrayChange('experience', index, field, value);
    };

    const removeWorkExperience = (index) => {
        removeItem('experience', index);
    };

    const addWorkTask = (index) => {
        const updatedExperience = [...data.experience];
        updatedExperience[index].tasks.push('');
        updateSection('experience', updatedExperience);
    };

    const handleWorkTaskChange = (index, taskIndex, value) => {
        const updatedExperience = [...data.experience];
        updatedExperience[index].tasks[taskIndex] = value;
        updateSection('experience', updatedExperience);
    };

    const removeWorkTask = (index, taskIndex) => {
        const updatedExperience = [...data.experience];
        updatedExperience[index].tasks.splice(taskIndex, 1);
        updateSection('experience', updatedExperience);
    };

    // ✅ Skills Section
    const addSkill = () => {
        updateSection('skills', [...data.skills, '']);
    };

    const handleSkillChange = (index, value) => {
        const updatedSkills = [...data.skills];
        updatedSkills[index] = value;
        updateSection('skills', updatedSkills);
    };

    const removeSkill = (index) => {
        updateSection('skills', data.skills.filter((_, i) => i !== index));
    };

    // ✅ Education Section
    const addEducation = () => {
        if (data.education.length < 2) {
            addItem('education', { institution: '', graduationDate: '', course: '', location: '' });
        }
    };

    const handleEducationChange = (index, field, value) => {
        handleArrayChange('education', index, field, value);
    };

    const removeEducation = (index) => {
        removeItem('education', index);
    };

    return (
        <div className="editor-container">
            {/* ✅ Personal Details */}
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

            {/* ✅ Skills Section */}
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

            {/* ✅ Conditionally Show Work Experience (Only if 'experienced') */}
            {selectedTemplate === "experienced" && (
                <div className="editor-section">
                    <h2>Work Experience</h2>
                    <button onClick={addWorkExperience}>Add Work Experience</button>
                    {data.experience.map((exp, index) => (
                        <div key={index} className="item-group">
                            {['jobTitle', 'company', 'startDate', 'endDate', 'location'].map((field) => (
                                <div key={field} className="form-group">
                                    <label>{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                                    <input
                                        value={exp[field]}
                                        onChange={(e) => handleWorkExperienceChange(index, field, e.target.value)}
                                        placeholder={field}
                                    />
                                </div>
                            ))}
                            <div className="tasks-section">
                                <label>Tasks</label>
                                {exp.tasks.map((task, taskIndex) => (
                                    <div key={taskIndex} className="task-input">
                                        <input
                                            value={task}
                                            onChange={(e) => handleWorkTaskChange(index, taskIndex, e.target.value)}
                                        />
                                        <button className="remove-task" onClick={() => removeWorkTask(index, taskIndex)}>×</button>
                                    </div>
                                ))}
                                <button className="add-task" onClick={() => addWorkTask(index)}>Add Task</button>
                            </div>
                            <button className="remove-item" onClick={() => removeWorkExperience(index)}>Remove Work Experience</button>
                        </div>
                    ))}
                </div>
            )}

            {/* ✅ Education Section */}
            <div className="editor-section">
                <h2>Education</h2>
                <button onClick={addEducation} disabled={data.education.length >= 2}>Add Education</button>
                {data.education.map((education, index) => (
                    <div key={index} className="item-group">
                        {['institution', 'graduationDate', 'course', 'location'].map((field) => (
                            <div key={field} className="form-group">
                                <label>{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                                <input
                                    value={education[field]}
                                    onChange={(e) => handleEducationChange(index, field, e.target.value)}
                                    placeholder={field}
                                />
                            </div>
                        ))}
                        <button className="remove-item" onClick={() => removeEducation(index)}>Remove Education</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EditorSection;
