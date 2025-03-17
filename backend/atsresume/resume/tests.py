from django.test import TestCase

import unittest
from unittest.mock import patch, MagicMock
import json
from resume.utils import parse_resume_with_gemini  # Replace with actual module name

class TestParseResumeWithGemini(unittest.TestCase):
    def setUp(self):
        self.sample_resume = """
        John Doe
        Email: johndoe@example.com
        Phone: +1 123 456 7890
        Address: 123 Main St, City, Country
        Summary: Experienced software engineer with expertise in Python and AI.
        Skills: Python, Machine Learning, Data Science, JavaScript
        Experience:
        - Software Engineer at XYZ Corp (01/2020 - 12/2023) in New York
          - Developed AI models for automation.
          - Optimized backend services.
        Education:
        - ABC University, BSc Computer Science, Graduated 06/2018, Location: Some City
        """

        self.mock_response_json = {
            "id": None,
            "resume_template_id": None,
            "name": "John Doe",
            "email": "johndoe@example.com",
            "phone": "+1 123 456 7890",
            "address": "123 Main St, City, Country",
            "summary": "Experienced software engineer with expertise in Python and AI.",
            "skills": ["Python", "Machine Learning", "Data Science", "JavaScript"],
            "experience": [
                {
                    "job_title": "Software Engineer",
                    "company": "XYZ Corp",
                    "start_date": "01/2020",
                    "end_date": "12/2023",
                    "location": "New York",
                    "tasks": ["Developed AI models for automation.", "Optimized backend services."]
                }
            ],
            "projects": [],
            "education": [
                {
                    "institution": "ABC University",
                    "graduation_date": "06/2018",
                    "course": "BSc Computer Science",
                    "location": "Some City"
                }
            ]
        }

    @patch("google.generativeai.GenerativeModel")
    def test_parse_resume_success(self, mock_gen_model):
        # Mock the Gemini AI model behavior
        mock_model_instance = MagicMock()
        mock_chat_instance = MagicMock()
        mock_model_instance.start_chat.return_value = mock_chat_instance
        
        mock_response = MagicMock()
        mock_response.text = "```json\n" + json.dumps(self.mock_response_json) + "\n```"
        mock_chat_instance.send_message.return_value = mock_response
        
        mock_gen_model.return_value = mock_model_instance
        
        result = parse_resume_with_gemini(self.sample_resume)
        self.assertEqual(result, self.mock_response_json)
    
    @patch("google.generativeai.GenerativeModel")
    def test_parse_resume_invalid_json(self, mock_gen_model):
        mock_model_instance = MagicMock()
        mock_chat_instance = MagicMock()
        mock_model_instance.start_chat.return_value = mock_chat_instance
        
        mock_response = MagicMock()
        mock_response.text = "Invalid JSON Response"
        mock_chat_instance.send_message.return_value = mock_response
        
        mock_gen_model.return_value = mock_model_instance
        
        result = parse_resume_with_gemini(self.sample_resume)
        self.assertEqual(result, {"error": "Invalid response from AI"})

if __name__ == "__main__":
    unittest.main()
