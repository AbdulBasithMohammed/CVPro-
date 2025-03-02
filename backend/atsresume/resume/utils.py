import json
import google.generativeai as genai

# Configure Gemini AI
genai.configure(api_key="AIzaSyBZE_RvBLkCDnADNKxstac1uv8VawmGMN8")  # Replace with your actual API key

def normalize_spaces(text):
    """Normalize spaces in the text to ensure proper formatting."""
    return " ".join(text.split())

def parse_resume_with_gemini(text):
    """Uses Gemini AI to extract structured data from the resume."""
    model = genai.GenerativeModel("gemini-2.0-flash")
    chat = model.start_chat()

    normalized_text = normalize_spaces(text)

    prompt = f"""
    Extract the following details from this resume:
    - Name
    - Email
    - Phone Number
    - Address
    - Summary (Ensure it's extracted properly. If missing, return null.)
    - Skills (as a list)
    - Experience (Job Title, Company, Start Date, End Date, Location, Description as separate tasks)
    - Projects (Title, Description as separate tasks, Technologies used)
    - Education (Institution, Graduation Date, Course, Location)

    Structure it in **valid JSON** format:
    {json.dumps({
        "id": None,
        "resume_template_id": None,
        "name": "string",
        "email": "string",
        "phone": "string",
        "address": "string",
        "summary": "string or null",
        "skills": ["string"],
        "experience": [
            {
                "job_title": "string",
                "company": "string",
                "start_date": "MM/YYYY",
                "end_date": "MM/YYYY or null (if current)",
                "location": "string",
                "tasks": ["string"]  
            }
        ],
        "projects": [
            {
                "title": "string",
                "tasks": ["string"],  
                "technologies": ["string"]
            }
        ],
        "education": [
            {
                "institution": "string",
                "graduation_date": "MM/YYYY",
                "course": "string",
                "location": "string"
            }
        ]
    }, indent=4)}

    Resume Text:
    {normalized_text}
    """

    response = chat.send_message(prompt)
    response_text = response.text.strip()

    if response_text.startswith("```json") and response_text.endswith("```"):
        response_text = response_text[7:-3].strip()  

    try:
        response_dict = json.loads(response_text)
        return response_dict
    except json.JSONDecodeError:
        return {"error": "Invalid response from AI"}
