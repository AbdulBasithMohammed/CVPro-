from django.urls import path
from .views import ResumeCreateView, ResumeRetrieveView, ResumeUpdateView, ResumeDeleteView, ResumeImageView

urlpatterns = [
    path("create/", ResumeCreateView.as_view(), name="resume-create"),
    path("retrieve/", ResumeRetrieveView.as_view(), name="resume-retrieve"),
    path("update/<str:id>/", ResumeUpdateView.as_view(), name="resume-update"),
    path("delete/<str:id>/", ResumeDeleteView.as_view(), name="resume-delete"),
    path('image/<str:image_id>/', ResumeImageView.as_view(), name='resume-image'),
]