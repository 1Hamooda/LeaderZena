from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user  = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff",     True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role",         "admin")
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ("member",    "Member"),
        ("volunteer", "Volunteer"),
        ("admin",     "Admin"),
    ]

    email       = models.EmailField(unique=True)
    first_name  = models.CharField(max_length=100)
    last_name   = models.CharField(max_length=100)
    role        = models.CharField(max_length=20, choices=ROLE_CHOICES, default="member")
    phone       = models.CharField(max_length=20,  blank=True)
    city        = models.CharField(max_length=100, blank=True)
    country     = models.CharField(max_length=100, blank=True)
    bio         = models.TextField(blank=True)
    education   = models.CharField(max_length=255, blank=True)
    experience  = models.TextField(blank=True)
    skills      = models.JSONField(default=list, blank=True)
    avatar      = models.ImageField(upload_to="avatars/", null=True, blank=True)
    is_active   = models.BooleanField(default=True)
    is_staff    = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = UserManager()

    class Meta:
        app_label = "users"
        db_table  = "users"

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"