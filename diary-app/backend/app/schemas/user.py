from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    profile_image_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class FindAccountRequest(BaseModel):
    name: str
    phone: str


class FindAccountResponse(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    phone: str
    new_password: str


class UpdateProfileRequest(BaseModel):
    name: str
    phone: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
