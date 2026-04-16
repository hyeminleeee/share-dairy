from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from app.schemas.user import UserResponse


class PostCreate(BaseModel):
    group_id: int
    content: str


class PostUpdate(BaseModel):
    content: str


class PostResponse(BaseModel):
    id: int
    group_id: int
    user_id: int
    content: str
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    author: UserResponse
    like_count: Optional[int] = None
    comment_count: Optional[int] = None
    is_liked: Optional[bool] = None

    model_config = {"from_attributes": True}
