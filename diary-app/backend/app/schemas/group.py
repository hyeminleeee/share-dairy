from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from app.schemas.user import UserResponse


class DiaryGroupCreate(BaseModel):
    name: str


class DiaryGroupMemberResponse(BaseModel):
    id: int
    user: UserResponse
    joined_at: datetime

    model_config = {"from_attributes": True}


class DiaryGroupResponse(BaseModel):
    id: int
    name: str
    owner_id: int
    invite_token: str
    created_at: datetime
    member_count: Optional[int] = None

    model_config = {"from_attributes": True}


class DiaryGroupDetailResponse(DiaryGroupResponse):
    members: List[DiaryGroupMemberResponse] = []
