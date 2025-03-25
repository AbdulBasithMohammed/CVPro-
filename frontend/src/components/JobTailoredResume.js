import React, { useState } from 'react';
import axios from 'axios';
import { FaPlus } from 'react-icons/fa';
import { TbReload } from 'react-icons/tb';

const GEMINI_API_KEY = "AIzaSyCzqhd4EsBbaMqg9rbqJYZ0fmpKHTUUFNE";

const JobTailoredResume = ({ resumeData, setResumeData }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [jobDescription, setJobDescription] = useState('');
    const [savedJobDescription, setSavedJobDescription] = useState('');
    const [originalResume, setOriginalResume] = useState(null);
    const [resumeHistory, setResumeHistory] = useState([]); // Stack for undo
    const [loading, setLoading] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    const parseGeminiJSON = (responseText) => {
        try {
            const jsonStart = responseText.indexOf('{');
            const jsonEnd = responseText.lastIndexOf('}') + 1;
            const jsonString = responseText.substring(jsonStart, jsonEnd);
            return JSON.parse(jsonString);
        } catch (error) {
            console.error("Error parsing Gemini JSON:", error, responseText);
            throw new Error("Failed to parse Gemini response.");
        }
    };

    const analyzeJobDescription = async (description) => {
        const prompt = `Extract top 6 core skills with no descriptors from job description: ${description}. Return JSON {"keywords":[]}`;

        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.5, maxOutputTokens: 2048 }
                }
            );

            const responseText = response.data.candidates[0].content.parts[0].text;
            return parseGeminiJSON(responseText).keywords;
        } catch (error) {
            console.error("Gemini API Error (Analyze Job Description):", error);
            throw new Error("Failed analyzing job description.");
        }
    };

    const tailorResumeContent = async (data, keywords, jobDescForPrompt) => {
        const selectedTemplate = localStorage.getItem("selectedTemplate") || "freshie";
        const hasUserSummary = data?.personal?.summary?.trim();
        const hasExperience = Array.isArray(data.experience) && data.experience.length > 0;
    
        const prompt = `
    You are a professional resume assistant.
    
    A user is tailoring their resume based on the following job description:
    """
    ${jobDescForPrompt}
    """
    
    The following keywords were extracted from the job description and are relevant for tailoring:
    ${keywords.join(', ')}
    
    Use these keywords when rephrasing tasks wherever appropriate.
    
    Their current resume data is:
    ${JSON.stringify(data)}
    
    The selected template is: "${selectedTemplate}". ${
        selectedTemplate === "freshie" || !hasExperience
            ? `This means the user is a fresher or recent graduate with no prior professional work experience. Write or revise the summary accordingly, focusing on academic achievements, technical projects, and relevant skills — avoid mentioning formal work experience or professional leadership unless explicitly listed.`
            : `This indicates the user has professional experience. Write or revise the summary accordingly, emphasizing past accomplishments, relevant experience, and alignment with the job description.`
    }

    Important rules:
        - Do not assume the user's field of study or major. Only use what is explicitly mentioned in the resume's education section.
        - Never refer to the user as a Computer Science student unless the term "Computer Science" explicitly appears in their education field.
        - Avoid making assumptions about background or coursework. Only reference what is present in the resume data.
        - ❗ Do not mention the user's field of study, degree name, or that they are a student in the summary. Focus solely on technical skills, experience, and project contributions.
        - For example, if the user's degree is "Associate of Science in Mathematics", describe them as a Mathematics student.
        - Never refer to the user as a Computer Science student unless the term "Computer Science" explicitly appears in their education field.
        - Avoid making assumptions about background or coursework. Only reference what is present in the resume data.
        - Do not mention the user's field of study, degree name, or that they are a student in the summary. Focus solely on technical skills, experience, and project contributions.
            
    ${
        hasUserSummary
            ? `The user has provided a personal summary. Rephrase it into a concise, ATS-optimized 2–3 sentence version aligned with the job description and resume content. Use technical language, measurable outcomes, and avoid vague or filler phrases like “aspiring,” “eager to contribute,” or “motivated individual.” The revised version should highlight skills, experience, and alignment with industry terms from the job description.`
            : `Write a concise, ATS-optimized 2–3 sentence summary tailored to the job description. 
                Use industry-relevant keywords from the job description and the resume, focusing on technical skills, programming languages, and development experience. 
                Avoid vague or generic phrases like “eager to contribute” or “aspiring.”  
                Do not reference the user's degree or field of study. 
                Describe experience using measurable, action-oriented terms (e.g., full-stack development, REST APIs, Git, scalable solutions, agile practices). 
                Make the summary confident, concise, and aligned with the target job.`
                }
    
    Your task includes the following:
    - Rephrase the user's summary (if it exists) in a professional tone that aligns with the job description while preserving original intent.
    - Go through each project and its tasks. For every task description, enhance the language by integrating 1–2 relevant keywords from the job description, while keeping the original task intent and meaning unchanged.
    - You must update every task description unless it already contains job-related terminology. Do not skip or repeat tasks. Ensure that the final descriptions sound more aligned with professional job descriptions.
    - Use professional, clear, and concise language that mirrors how similar tasks are described in job postings.
    - Do not remove or invent any tasks — only enhance the language using relevant job-related terms and action verbs.
    - Make sure to use industry-relevant keywords and phrasing that improves alignment with the job description.
    - Do the same for the experience section — revise task bullets to incorporate job-related keywords without changing the original purpose.
    - Do NOT repeat the exact same wording from the job description.
    - Do NOT add new projects or experience entries — only enhance what's already there.
    
    Avoid generic phrases like “eager to contribute,” “seeking a role,” or “motivated individual.” Focus instead on value and relevance to the job description.
    
    Failure to update the task descriptions with job-aligned language will be considered an incomplete response.

    Respond in strictly this JSON format:
    {
      "tailoredSummary": "your_updated_summary_here",
      "tailoredSkills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5", "Skill6"],
      "tailoredProjects": ${JSON.stringify(data.projects)},
      "tailoredExperience": ${JSON.stringify(data.experience)}
    }
    
    Return 6 job-relevant skill names (just the skill name, no descriptors) based on alignment between the user's resume content and the job description.  
    Always evaluate based on the user's technical capabilities and adapt the skill list to emphasize what's most relevant to the job description — even if alignment is partial.
    Do not reuse the same skills unless they are clearly relevant to this specific job.

    You must compare the user's existing project descriptions and experience against the job responsibilities.  
    If there's clear alignment, generate tailored skills. Otherwise, return an empty list to indicate no change needed.
    `;
    
        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.8, maxOutputTokens: 2048 }
                }
            );
    
            const responseText = response.data.candidates[0].content.parts[0].text;
            return parseGeminiJSON(responseText);
        } catch (error) {
            console.error("Gemini API Error (Tailor Resume Content):", error);
            throw new Error("Failed tailoring resume content.");
        }
    };    

    const handleSubmit = async () => {
        setLoading(true);
        setShowPopup(false);
        try {
            const keywords = await analyzeJobDescription(jobDescription);
            const tailoredData = await tailorResumeContent(resumeData, keywords, jobDescription);

            setResumeHistory(prev => [...prev, JSON.parse(JSON.stringify(resumeData))]);
            if (!originalResume) setOriginalResume(resumeData);
            setSavedJobDescription(jobDescription);

            setResumeData(prev => ({
                ...prev,
                personal: { ...prev.personal, summary: tailoredData.tailoredSummary },
                skills: tailoredData.tailoredSkills?.length ? tailoredData.tailoredSkills : prev.skills,
                projects: tailoredData.tailoredProjects.length ? tailoredData.tailoredProjects : prev.projects,
                experience: tailoredData.tailoredExperience.length ? tailoredData.tailoredExperience : prev.experience,
            }));
        } catch (error) {
            alert("Error tailoring resume. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ FIXED: Use resumeData instead of originalResume
    const handleRegenerate = async () => {
        if (!savedJobDescription) return;

        setRegenerating(true);
        try {
            const keywords = await analyzeJobDescription(savedJobDescription);
            const tailoredData = await tailorResumeContent(resumeData, keywords, savedJobDescription);

            setResumeHistory(prev => [...prev, JSON.parse(JSON.stringify(resumeData))]);

            setResumeData(prev => ({
                ...prev,
                personal: {
                    ...prev.personal,
                    summary: tailoredData.tailoredSummary || prev.personal.summary,
                },
                skills: tailoredData.tailoredSkills?.length ? tailoredData.tailoredSkills : prev.skills,
                projects: tailoredData.tailoredProjects?.length ? tailoredData.tailoredProjects : prev.projects,
                experience: tailoredData.tailoredExperience?.length ? tailoredData.tailoredExperience : prev.experience,
            }));
        } catch (error) {
            alert("Error regenerating resume. Please try again.");
        } finally {
            setRegenerating(false);
        }
    };

    const handleReset = () => {
        if (resumeHistory.length > 0) {
            const previous = resumeHistory[resumeHistory.length - 1];
            setResumeData(previous);
            setResumeHistory(prev => prev.slice(0, -1));
    
            if (resumeHistory.length === 1) {
                // We're about to reach original resume → clear job description
                setSavedJobDescription('');
            }
        } else {
            alert("Already at the original resume. No further undo possible.");
        }
    };    
    
    return (
        <>
            {/* Tailor and Reset Buttons */}
            <div className="fixed bottom-6 right-6 flex items-center gap-3">
                

                {/* Reset Button */}
                <button
                onClick={handleReset}
                disabled={resumeHistory.length === 0}
                className={`p-4 rounded-full shadow-lg text-white ${
                    resumeHistory.length === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                }`}
                title="Undo Last Tailoring"
            >
                Reset
            </button>

                {/* Tailor Resume Button */}
                <button
                    onClick={() => setShowPopup(true)}
                    className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
                    title="Tailor Resume"
                >
                    <FaPlus size={24} />
                </button>
            </div>

            {/* Regenerate Button */}
            <button
                onClick={handleRegenerate}
                disabled={!savedJobDescription}
                className={`fixed bottom-24 right-6 p-4 rounded-full shadow-lg ${
                    savedJobDescription ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
                } text-white`}
                title="Regenerate Resume"
            >
                <TbReload size={24} />
            </button>

            {/* Job Description Input Modal */}
            {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-[600px]">
                        <h3 className="text-xl font-semibold mb-4">Paste Job Description To Tailor the Resume</h3>
                        <textarea
                            className="w-full h-60 p-2 border rounded-lg resize-none"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <button className="px-4 py-2 bg-gray-500 text-white rounded" onClick={() => setShowPopup(false)}>
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSubmit}>
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading Indicators */}
            {(loading || regenerating) && (
                <p className="fixed bottom-36 right-6 bg-white shadow-lg px-4 py-2 rounded">
                    {loading ? "Tailoring resume..." : "Regenerating resume..."}
                </p>
            )}
        </>
    );
}

export default JobTailoredResume;
