import React, { useState, useEffect } from 'react';
import '../CSS/EditorSection.css';

const EditorSection = ({ data, updateSection, onValidationChange }) => {
    const [summaryLength, setSummaryLength] = useState(data.personal.summary.length);
    const [addressLength, setAddressLength] = useState(data.personal.address ? data.personal.address.length : 0);
    const MAX_SUMMARY_LENGTH = 300;
    const MAX_ADDRESS_LENGTH = 50;
    const MAX_SKILL_LENGTH = 50;

    // Validation helper functions
    const isValidEmail = (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPhone = (phone) => {
        const digits = phone.replace(/\D/g, '');
        return digits.length >= 10;
    };
    const isValidDateFormat = (date) =>
        /^\d{2}\/\d{4}$/.test(date);
    const isRequiredFieldFilled = (value) => 
        value && value.trim() !== '';

    // Get the selected template from localStorage
    const selectedTemplate = localStorage.getItem("selectedTemplate") || "freshie"; // Default to "freshie"
    
    // Revalidate whenever data changes and update localStorage with form validity
    useEffect(() => {
      let valid = true;
      
      // Personal details validation
      // Name, email, phone, and address are required
      if (!isRequiredFieldFilled(data.personal.name) || 
          !isRequiredFieldFilled(data.personal.email) || 
          !isRequiredFieldFilled(data.personal.phone) || 
          !isRequiredFieldFilled(data.personal.address)) {
        valid = false;
      }
      // Email
      if (!isValidEmail(data.personal.email)) {
        valid = false;
      }
      // Phone
      if (!isValidPhone(data.personal.phone)) {
        valid = false;
      }
      
      // Skills validation
      if (data.skills && data.skills.length > 0) {
        // Check for empty skills or skills exceeding length limit
        if (data.skills.some(skill => skill.trim() === '' || skill.length > MAX_SKILL_LENGTH)) {
          valid = false;
        }
      }
      
      // Work Experience validation - only if the template is "experienced"
      if (selectedTemplate === "experienced" && data.experience && data.experience.length > 0) {
        data.experience.forEach(exp => {
          // Required fields
          if (!isRequiredFieldFilled(exp.jobTitle) || 
              !isRequiredFieldFilled(exp.company) || 
              !isRequiredFieldFilled(exp.startDate) || 
              !isRequiredFieldFilled(exp.endDate)) {
            valid = false;
          }
          // Date format validation
          if ((exp.startDate && !isValidDateFormat(exp.startDate)) || 
              (exp.endDate && !isValidDateFormat(exp.endDate))) {
            valid = false;
          }
          // Empty tasks validation
          if (exp.tasks && exp.tasks.some(task => task.trim() === '')) {
            valid = false;
          }
        });
      }
      
      // Projects validation
      if (data.projects && data.projects.length > 0) {
        data.projects.forEach(project => {
          // Required name field
          if (!isRequiredFieldFilled(project.name)) {
            valid = false;
          }
          // Empty tasks validation
          if (project.tasks && project.tasks.some(task => task.trim() === '')) {
            valid = false;
          }
        });
      }
      
      // Education validation
      if (data.education && data.education.length > 0) {
        data.education.forEach(edu => {
          // Required fields
          if (!isRequiredFieldFilled(edu.institution) || 
              !isRequiredFieldFilled(edu.course) || 
              !isRequiredFieldFilled(edu.graduationDate)) {
            valid = false;
          }
          // Graduation date format
          if (edu.graduationDate && !isValidDateFormat(edu.graduationDate)) {
            valid = false;
          }
        });
      }
      
      // Store the form validity status in localStorage
      localStorage.setItem("formIsValid", valid.toString());
      
      // Still call the callback if it exists (for backward compatibility)
      onValidationChange && onValidationChange(valid);
    }, [data, onValidationChange, selectedTemplate]);

    const handleInputChange = (section, field, value) => {
        if (section === 'personal' && field === 'address') {
            // Address character limit check
            if (value.length <= MAX_ADDRESS_LENGTH) {
                setAddressLength(value.length);
                const updatedData = { ...data[section], [field]: value };
                updateSection(section, updatedData);
            }
        } else {
            const updatedData = { ...data[section], [field]: value };
            updateSection(section, updatedData);
        }
    };

    const handleSummaryChange = (e) => {
        const value = e.target.value;
        if (value.length <= MAX_SUMMARY_LENGTH) {
            setSummaryLength(value.length);
            handleInputChange('personal', 'summary', value);
        }
    };

    const handleArrayChange = (section, index, field, value) => {
        // For skill field, check length limit
        if (section === 'skills' && value.length > MAX_SKILL_LENGTH) {
            return;
        }
        
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

    // Check if work experience is valid for adding another one
    const isWorkExperienceValid = () => {
        if (!data.experience || data.experience.length === 0) return true;
        
        return data.experience.every(exp => 
            isRequiredFieldFilled(exp.jobTitle) && 
            isRequiredFieldFilled(exp.company) && 
            isRequiredFieldFilled(exp.startDate) && 
            isValidDateFormat(exp.startDate) && 
            isRequiredFieldFilled(exp.endDate) && 
            isValidDateFormat(exp.endDate) &&
            (exp.tasks && exp.tasks.every(task => task.trim() !== ''))
        );
    };

    // Work Experience Section (Only Show if "experienced")
    const addWorkExperience = () => {
        if (!isWorkExperienceValid()) return;
        addItem('experience', { jobTitle: '', company: '', startDate: '', endDate: '', location: '', tasks: [''] });
    };

    const handleWorkExperienceChange = (index, field, value) => {
        handleArrayChange('experience', index, field, value);
    };

    const removeWorkExperience = (index) => {
        removeItem('experience', index);
    };

    const addWorkTask = (index) => {
        // Don't add new task if any existing tasks are empty
        const exp = data.experience[index];
        if (exp.tasks.some(task => task.trim() === '')) {
            return;
        }
        
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
    
    // Check if projects are valid for adding another one
    const isProjectValid = () => {
        if (!data.projects || data.projects.length === 0) return true;
        
        return data.projects.every(project => 
            isRequiredFieldFilled(project.name) &&
            (project.tasks && project.tasks.every(task => task.trim() !== ''))
        );
    };
    
    // Projects Section
    const addProject = () => {
        if (!isProjectValid()) return;
        addItem('projects', { name: '', tasks: [''] });
    };
    
    const handleProjectChange = (index, field, value) => {
        handleArrayChange('projects', index, field, value);
    };
    
    const removeProject = (index) => {
        removeItem('projects', index);
    };
    
    const addProjectTask = (index) => {
        // Don't add new task if any existing tasks are empty
        const project = data.projects[index];
        if (project.tasks.some(task => task.trim() === '')) {
            return;
        }
        
        const updatedProjects = [...data.projects];
        updatedProjects[index].tasks.push('');
        updateSection('projects', updatedProjects);
    };
    
    const handleProjectTaskChange = (index, taskIndex, value) => {
        const updatedProjects = [...data.projects];
        updatedProjects[index].tasks[taskIndex] = value;
        updateSection('projects', updatedProjects);
    };
    
    const removeProjectTask = (index, taskIndex) => {
        const updatedProjects = [...data.projects];
        updatedProjects[index].tasks.splice(taskIndex, 1);
        updateSection('projects', updatedProjects);
    };

    // Skills Section
    const addSkill = () => {
        // Prevent adding a new skill if any existing skill is empty or too long
        if (data.skills.some(skill => skill.trim() === '' || skill.length > MAX_SKILL_LENGTH)) {
            return;
        }
        updateSection('skills', [...data.skills, '']);
    };

    const handleSkillChange = (index, value) => {
        if (value.length <= MAX_SKILL_LENGTH) {
            const updatedSkills = [...data.skills];
            updatedSkills[index] = value;
            updateSection('skills', updatedSkills);
        }
    };

    const removeSkill = (index) => {
        updateSection('skills', data.skills.filter((_, i) => i !== index));
    };

    // Check if education entries are valid for adding another one
    const isEducationValid = () => {
        if (!data.education || data.education.length === 0) return true;
        
        return data.education.every(edu => 
            isRequiredFieldFilled(edu.institution) && 
            isRequiredFieldFilled(edu.course) && 
            isRequiredFieldFilled(edu.graduationDate) && 
            isValidDateFormat(edu.graduationDate)
        );
    };

    // Education Section
    const addEducation = () => {
        if (data.education.length < 2 && isEducationValid()) {
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
            {/* Personal Details */}
            <div className="editor-section">
                <h2>Personal Details</h2>
                {['name', 'email', 'phone', 'address'].map((field) => (
                    <div key={field} className="form-group">
                        <label>
                            {field.charAt(0).toUpperCase() + field.slice(1)}
                            <span className="required">*</span>
                        </label>
                        <input
                            type={field === 'email' ? 'email' : 'text'}
                            value={data.personal[field]}
                            onChange={(e) => handleInputChange('personal', field, e.target.value)}
                            {...(field === 'address' ? { maxLength: MAX_ADDRESS_LENGTH } : {})}
                        />
                        {!isRequiredFieldFilled(data.personal[field]) && (
                            <span className="validation-error">{field.charAt(0).toUpperCase() + field.slice(1)} is required</span>
                        )}
                        {field === 'email' && data.personal.email && !isValidEmail(data.personal.email) && (
                            <span className="validation-error">Invalid email address</span>
                        )}
                        {field === 'phone' && data.personal.phone && !isValidPhone(data.personal.phone) && (
                            <span className="validation-error">Invalid phone number</span>
                        )}
                        {field === 'address' && (
                            <div className="char-count">{addressLength} / {MAX_ADDRESS_LENGTH} characters</div>
                        )}
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
                <button 
                    className="add-skill"
                    onClick={addSkill} 
                    disabled={!data.skills.every(skill => skill.trim() !== '' && skill.length <= MAX_SKILL_LENGTH)}
                >
                    Add Skill
                </button>
                <div className="skills-section">
                    {data.skills.map((skill, index) => (
                        <div key={index} className="form-group">
                            <input
                                value={skill}
                                onChange={(e) => handleSkillChange(index, e.target.value)}
                                placeholder={`Skill ${index + 1}`}
                                maxLength={MAX_SKILL_LENGTH}
                            />
                            <button className="remove-skill" onClick={() => removeSkill(index)}>×</button>
                            {skill.trim() === '' && (
                                <span className="validation-error">Skill cannot be empty</span>
                            )}
                            <div className="char-count">{skill.length} / {MAX_SKILL_LENGTH} characters</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Conditionally Show Work Experience (Only if 'experienced') */}
            {selectedTemplate === "experienced" && (
                <div className="editor-section">
                    <h2>Work Experience</h2>
                    <button 
                        className="add-experience"
                        onClick={addWorkExperience}
                        disabled={!isWorkExperienceValid()}
                    >
                        Add Work Experience
                    </button>
                    {data.experience.map((exp, index) => (
                        <div key={index} className="item-group">
                            {['jobTitle', 'company', 'startDate', 'endDate', 'location'].map((field) => (
                                <div key={field} className="form-group">
                                    <label>
                                        {field.replace(/([A-Z])/g, ' $1').trim()}
                                        {(field === 'jobTitle' || field === 'company' || 
                                          field === 'startDate' || field === 'endDate') && 
                                          <span className="required">*</span>}
                                    </label>
                                    <input
                                        value={exp[field]}
                                        onChange={(e) => handleWorkExperienceChange(index, field, e.target.value)}
                                        placeholder={field.includes('Date') ? "MM/YYYY" : field}
                                    />
                                    {(field === 'jobTitle' || field === 'company') && !isRequiredFieldFilled(exp[field]) && (
                                        <span className="validation-error">This field is required</span>
                                    )}
                                    {field === 'startDate' && !isRequiredFieldFilled(exp.startDate) && (
                                        <span className="validation-error">Start date is required</span>
                                    )}
                                    {field === 'endDate' && !isRequiredFieldFilled(exp.endDate) && (
                                        <span className="validation-error">End date is required</span>
                                    )}
                                    {field.includes('Date') && exp[field] && !isValidDateFormat(exp[field]) && (
                                        <span className="validation-error">Invalid format. Use MM/YYYY.</span>
                                    )}
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
                                        {task.trim() === '' && (
                                            <span className="validation-error">Task cannot be empty</span>
                                        )}
                                    </div>
                                ))}
                                <button 
                                    className="add-task" 
                                    onClick={() => addWorkTask(index)}
                                    disabled={exp.tasks.some(task => task.trim() === '')}
                                >
                                    Add Task
                                </button>
                            </div>
                            {/* Changed from div with class to direct button */}
                            <button className="remove-experience" onClick={() => removeWorkExperience(index)}>
                                Remove Work Experience
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Projects Section */}
            <div className="editor-section">
                <h2>Projects</h2>
                <button 
                    className="add-experience"
                    onClick={addProject}
                    disabled={!isProjectValid()}
                >
                    Add Project
                </button>
                {data.projects.map((project, index) => (
                    <div key={index} className="item-group">
                        <div className="form-group">
                            <label>
                                Project Name
                                <span className="required">*</span>
                            </label>
                            <input
                                value={project.name}
                                onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                                placeholder="Project Name"
                            />
                            {!isRequiredFieldFilled(project.name) && (
                                <span className="validation-error">Project name is required</span>
                            )}
                        </div>
                        <div className="tasks-section">
                            <label>Tasks</label>
                            {project.tasks.map((task, taskIndex) => (
                                <div key={taskIndex} className="task-input">
                                    <input
                                        value={task}
                                        onChange={(e) => handleProjectTaskChange(index, taskIndex, e.target.value)}
                                    />
                                    <button className="remove-task" onClick={() => removeProjectTask(index, taskIndex)}>×</button>
                                    {task.trim() === '' && (
                                        <span className="validation-error">Task cannot be empty</span>
                                    )}
                                </div>
                            ))}
                            <button 
                                className="add-task" 
                                onClick={() => addProjectTask(index)}
                                disabled={project.tasks.some(task => task.trim() === '')}
                            >
                                Add Task
                            </button>
                        </div>
                        <button className="remove-experience" onClick={() => removeProject(index)}>
                            Remove Project
                        </button>
                    </div>
                ))}
            </div>

            {/* Education Section */}
            <div className="editor-section">
                <h2>Education</h2>
                <button 
                    className="add-education"
                    onClick={addEducation} 
                    disabled={data.education.length >= 2 || !isEducationValid()}
                >
                    Add Education
                </button>
                {data.education.map((education, index) => (
                    <div key={index} className="item-group">
                        {['institution', 'graduationDate', 'course', 'location'].map((field) => (
                            <div key={field} className="form-group">
                                <label>
                                    {field.replace(/([A-Z])/g, ' $1').trim()}
                                    {(field === 'institution' || field === 'course' || field === 'graduationDate') && 
                                      <span className="required">*</span>}
                                </label>
                                <input
                                    value={education[field]}
                                    onChange={(e) => handleEducationChange(index, field, e.target.value)}
                                    placeholder={field === 'graduationDate' ? "MM/YYYY" : field}
                                />
                                {field === 'institution' && !isRequiredFieldFilled(education.institution) && (
                                    <span className="validation-error">Institution name is required</span>
                                )}
                                {field === 'course' && !isRequiredFieldFilled(education.course) && (
                                    <span className="validation-error">Course name is required</span>
                                )}
                                {field === 'graduationDate' && !isRequiredFieldFilled(education.graduationDate) && (
                                    <span className="validation-error">Graduation date is required</span>
                                )}
                                {field === 'graduationDate' && education.graduationDate && !isValidDateFormat(education.graduationDate) && (
                                    <span className="validation-error">Invalid format. Use MM/YYYY.</span>
                                )}
                            </div>
                        ))}
                        {/* Changed from div with class to direct button */}
                        <button className="remove-education" onClick={() => removeEducation(index)}>
                            Remove Education
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EditorSection;