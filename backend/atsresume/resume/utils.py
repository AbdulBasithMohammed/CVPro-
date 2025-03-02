import json
import google.generativeai as genai

# Configure Gemini AI
genai.configure(api_key="AIzaSyBZE_RvBLkCDnADNKxstac1uv8VawmGMN8")

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
    - Summary (Ensure it's extracted properly. If missing, return null.)
    - Skills (as a list)
    - Experience (Company, Role, Years, Description)
    - Projects (List of JSON objects with title, description, and technologies)

    Structure it in **valid JSON** format:
    {json.dumps({
        "id": None,
        "resume_template_id": None,
        "name": "string",
        "email": "string",
        "phone": "string",
        "summary": "string or null",
        "experience": [{"company": "string", "role": "string", "description": "string", "years": "string"}],
        "skills": ["string"],
        "projects": [{"title": "string", "description": "string", "technologies": ["string"]}]
    }, indent=4)}

    Resume Text:
    {normalized_text}
    """

    response = chat.send_message(prompt)
    response_text = response.text.strip()

    if response_text.startswith("```json") and response_text.endswith("```"):
        response_text = response_text[7:-3].strip()  # Remove ```json and ```

    try:
        response_dict = json.loads(response_text)
        return response_dict
    except json.JSONDecodeError:
        return {"error": "Invalid response from AI"}
