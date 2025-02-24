from bson import ObjectId
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import FormParser,MultiPartParser
from .utils import extract_text_from_pdf, extract_text_from_docx, parse_resume, parse_resume_with_gemini
from bson import ObjectId
from rest_framework.permissions import IsAuthenticated
from django.views import View   
from rest_framework.views import APIView
from rest_framework.response import Response
from bson import ObjectId
from django.http import HttpResponse

from db_connection import get_mongo_connection
import gridfs
# Get MongoDB collection

db = get_mongo_connection()
fs = gridfs.GridFS(db)

resume_collection = db["resumes"]  # Using "resumes" collection

class ResumeCreateView(APIView):
    parser_classes = (MultiPartParser, FormParser)  # Allow file uploads

    """
    API to create a new resume document with an image template.
    """
    def post(self, request):
        data = request.data
        resume_id = str(ObjectId())  # Assign unique ObjectId as a string
        user_id = data.get("user_id")

        # Handle image upload
        image_id = None
        if "image" in request.FILES:
            uploaded_image = request.FILES["image"]
            print(uploaded_image)
            image_id = fs.put(uploaded_image, filename=uploaded_image.name)

        # Prepare resume data
        resume_data = {
            "_id": resume_id,
            "user_id": user_id,
            "resume_details": data.get("resume_details", {}),
            "email": data.get("email", ""),
            "image_id": str(image_id) if image_id else None
        }

        # Save to database
        resume_collection.insert_one(resume_data)
        return Response({"message": "Resume saved successfully", "resume_id": resume_id}, status=201)


class ResumeRetrieveView(APIView):
    """
    API to retrieve resumes, including the associated image.
    """
    def get(self, request):
        email = request.query_params.get("email")
        resume_id = request.query_params.get("id")
        user_id = request.query_params.get("user_id")

        if resume_id:
            resume = resume_collection.find_one({"_id": resume_id})
            if resume:
                resume["_id"] = str(resume["_id"])
                if "image_id" in resume and resume["image_id"]:
                    resume["image_url"] = f"{resume['image_id']}"
                return Response(resume, status=200)
            return Response({"error": "Resume not found"}, status=404)

        if user_id:
            resumes = list(resume_collection.find({"user_id": user_id}))
            for resume in resumes:
                resume["_id"] = str(resume["_id"])
                if "image_id" in resume and resume["image_id"]:
                    resume["image_url"] = f"{resume['image_id']}"
            return Response(resumes, status=200)

        if email:
            resumes = list(resume_collection.find({"email": email}))
            for resume in resumes:
                resume["_id"] = str(resume["_id"])
                if "image_id" in resume and resume["image_id"]:
                    resume["image_url"] = f"{resume['image_id']}"
            return Response(resumes, status=200)

        return Response({"error": "Please provide email, user ID, or resume ID"}, status=400)


class ResumeUpdateView(APIView):
    """
    API to update an existing resume by ID, including updating the image.
    """
    parser_classes = (MultiPartParser, FormParser)  # Allow file uploads

    def put(self, request, id):
        updated_data = request.data
        resume = resume_collection.find_one({"_id": id})

        if not resume:
            return Response({"error": "Resume not found"}, status=404)

        # Handle image update
        if "image" in request.FILES:
            uploaded_image = request.FILES["image"]
            image_id = fs.put(uploaded_image, filename=uploaded_image.name)
            updated_data["image_id"] = str(image_id)

            # Remove old image if exists
            if "image_id" in resume and resume["image_id"]:
                try:
                    fs.delete(ObjectId(resume["image_id"]))
                except gridfs.errors.NoFile:
                    pass

        result = resume_collection.update_one({"_id": id}, {"$set": updated_data})

        if result.modified_count:
            return Response({"message": "Resume updated successfully"}, status=200)
        return Response({"error": "No changes made"}, status=400)


class ResumeDeleteView(APIView):
    """
    API to delete a resume by ID, including deleting the associated image.
    """
    def delete(self, request, id):
        resume = resume_collection.find_one({"_id": id})

        if not resume:
            return Response({"error": "Resume not found"}, status=404)

        # Delete image from GridFS
        if "image_id" in resume and resume["image_id"]:
            try:
                fs.delete(ObjectId(resume["image_id"]))
            except gridfs.errors.NoFile:
                pass

        result = resume_collection.delete_one({"_id": id})

        if result.deleted_count:
            return Response({"message": "Resume deleted successfully"}, status=200)
        return Response({"error": "Failed to delete resume"}, status=400)


class ResumeImageView(APIView):
    """
    API to serve images stored in GridFS.
    """
    def get(self, request, image_id):
        try:
            file_data = fs.get(ObjectId(image_id))
            response = Response(file_data.read(), content_type="image/jpeg")  # Change content type as needed
            response["Content-Disposition"] = f'inline; filename="{file_data.filename}"'
            return response
        except gridfs.errors.NoFile:
            return Response({"error": "Image not found"}, status=404)      


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

    # class ResumeImageView(View):
    #     """
    #     API to serve images stored in GridFS.
    #     """
    #     def get(self, request,image_id):
    #         try:
    #             file_data = fs.get(ObjectId(image_id))  # Ensure image_id is valid
    #             response = HttpResponse(file_data.read(), content_type="image/jpeg")  # Set correct content type
    #             response["Content-Disposition"] = f'inline; filename="{file_data.filename}"'
    #             return response
    #         except gridfs.errors.NoFile:
    #             return HttpResponse("Image not found", status=404)

   

class ResumeImageView(View):
    """
    API to serve images stored in GridFS.
    """
    def get(self, request, image_id):
        try:
            file_data = fs.get(ObjectId(image_id))  # Get file from GridFS
            response = HttpResponse(file_data, content_type="image/png")  # ✅ Ensure binary response
            response["Content-Disposition"] = f'inline; filename="{file_data.filename}"'
            return response
        except gridfs.errors.NoFile:
            return HttpResponse("Image not found", status=404)
        except Exception as e:
            return HttpResponse(f"Error loading image: {str(e)}", status=500)
