from django.db import models
from db_connection import get_mongo_connection
# Create your models here.

db=get_mongo_connection()
user_collection=db['users']
contact_collection = db["contact_messages"]