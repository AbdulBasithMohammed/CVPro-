from bson import ObjectId
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import FormParser,MultiPartParser
from .utils import extract_text_from_pdf, extract_text_from_docx, parse_resume, parse_resume_with_gemini
from bson import ObjectId

from rest_framework.views import APIView
from rest_framework.response import Response
from bson import ObjectId
from db_connection import get_mongo_connection  # Import the function to get MongoDB connection

# Get MongoDB collection
db = get_mongo_connection()
resume_collection = db["resumes"]  # Using "resumes" collection

class ResumeCreateView(APIView):
    """
    API to create a new resume document.
    """
    def post(self, request):
        data = request.data
        data["_id"] = str(ObjectId())  # Assign unique ObjectId as a string
        data["user_id"] = int(data["user_id"])
        resume_collection.insert_one(data)
        return Response(data=data, status=201)


class ResumeRetrieveView(APIView):
    """
    API to retrieve resumes by email or resume ID.
    """
    def get(self, request):
        email = request.query_params.get("email")
        resume_id = request.query_params.get("id")
        user_id = request.query_params.get("user_id")

        if resume_id:
            resume = resume_collection.find_one({"_id": resume_id})
            if resume:
                resume["_id"] = str(resume["_id"])  # Convert ObjectId to string
                return Response(resume, status=200)
            return Response({"error": "Resume not found"}, status=404)
        
        if user_id:
            try:
                user_id = int(user_id)  # Convert input to integer
            except ValueError:
                return Response({"error": "Invalid user_id"}, status=400)

            resumes = list(resume_collection.find({"user_id": user_id}))
            for resume in resumes:
                resume["_id"] = str(resume["_id"])  # Convert ObjectId to string
            return Response(resumes, status=200)

        if email:
            resumes = list(resume_collection.find({"email": email}))
            for resume in resumes:
                resume["_id"] = str(resume["_id"])  # Convert ObjectId to string
            return Response(resumes, status=200)

        return Response({"error": "Please provide email or resume ID"}, status=400)


class ResumeUpdateView(APIView):
    """
    API to update an existing resume by ID.
    """
    def put(self, request, id):
        updated_data = request.data
        result = resume_collection.update_one({"_id": id}, {"$set": updated_data})

        if result.modified_count:
            return Response({"message": "Resume updated successfully"}, status=200)
        return Response({"error": "Resume not found or no changes made"}, status=404)


class ResumeDeleteView(APIView):
    """
    API to delete a resume by ID.
    """
    def delete(self, request, id):
        result = resume_collection.delete_one({"_id": id})

        if result.deleted_count:
            return Response({"message": "Resume deleted successfully"}, status=200)
      


class ResumeUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)  # Handle file uploads

    def post(self, request, *args, **kwargs):
            uploaded_file = request.FILES['file']
            file_extension = uploaded_file.name.split('.')[-1].lower()
            #print(f"Extracted file extension: {file_extension}")  # Debugging

            # Extract text based on file type
            if file_extension == "pdf":
                print("Saving PDF to a temporary file...")

                extracted_text = extract_text_from_pdf(uploaded_file)  # Pass file path
                #print("Extraction completed!", extracted_text)
                extracted_text = parse_resume_with_gemini(extracted_text)
                # Use AI to parse the resume
                return Response(extracted_text,status=200)

            elif file_extension in ["doc", "docx"]:
                extracted_text = extract_text_from_docx(uploaded_file)
                resume_data = parse_resume(extracted_text)  
                return Response(resume_data, status=200)

            else:
                return Response({"error": "Unsupported file format"}, status=400)

        