import axios from 'axios';
import { buildTailorPrompt } from './PromptBuilder';

const GEMINI_API_KEY = "AIzaSyCzqhd4EsBbaMqg9rbqJYZ0fmpKHTUUFNE";

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

export const analyzeJobDescription = async (description) => {
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

export const tailorResumeContent = async (resumeData, keywords, jobDescription) => {
  const prompt = buildTailorPrompt(resumeData, keywords, jobDescription);

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
