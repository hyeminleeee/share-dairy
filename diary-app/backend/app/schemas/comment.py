from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from app.schemas.user import UserResponse


class CommentCreate(BaseModel):
    post_id: int
    content: str
    parent_id: Optional[int] = None


class CommentResponse(BaseModel):
    id: int
    post_id: int
    user_id: int
    parent_id: Optional[int] = None
    content: str
    created_at: datetime
    author: UserResponse
    replies: List["CommentResponse"] = []

    model_config = {"from_attributes": True}


CommentResponse.model_rebuild()
