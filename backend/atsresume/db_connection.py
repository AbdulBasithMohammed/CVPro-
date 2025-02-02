# import pymongo
# from urllib.parse import quote_plus
# escaped_username = quote_plus("group6asdc")
# escaped_password = quote_plus("G06asdc@@")
# url=f'mongodb+srv://{escaped_username}:{escaped_password}@g6user-db.7hzwm.mongodb.net/?retryWrites=true&w=majority&appName=g6user-db'
# client=pymongo.MongoClient(url)
# db=client['ats_resume']

# mongo_utils.py
import pymongo
from django.conf import settings

def get_mongo_connection():
    client = pymongo.MongoClient(settings.MONGO_URI)
    db = client.get_database("ats_resume")  # Use the database specified in the connection URI
    return db


# from pymongo import MongoClient
# from urllib.parse import quote_plus
# import os
# from dotenv import load_dotenv

# load_dotenv("cred.env") # File path must be removed after Gitlab CI/CD Pipeline has environment variables set.

# def get_db_connection():
#     # Retrieve credentials from environment variables
#     username = os.getenv("MONGO_USERNAME")
#     password = os.getenv("MONGO_PASSWORD")
#     cluster_name = os.getenv("MONGO_CLUSTER_NAME")
#     db_name = os.getenv("MONGO_DB_NAME")

#     # Check if any required variable is missing
#     if not username or not password or not cluster_name or not db_name:
#         raise ValueError("One or more required environment variables are missing!")

#     # Escape special characters in the username and password
#     escaped_username = quote_plus(username)
#     escaped_password = quote_plus(password)

#     # Construct the connection string
#     uri = f"mongodb+srv://{escaped_username}:{escaped_password}@{cluster_name}/?retryWrites=true&w=majority&appName={cluster_name}"

#     # Connect to MongoDB Atlas
#     client = MongoClient(uri)
#     db = client[db_name]
#     print("Connected to MongoDB Atlas successfully!")
#     return db