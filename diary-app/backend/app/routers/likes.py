from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models.diary_group import DiaryGroupMember
from app.models.like import Like
from app.models.post import Post
from app.models.user import User
from app.schemas.like import LikeResponse

router = APIRouter(prefix="/likes", tags=["likes"])


@router.post("/{post_id}", response_model=LikeResponse)
def toggle_like(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    member = (
        db.query(DiaryGroupMember)
        .filter(
            DiaryGroupMember.group_id == post.group_id,
            DiaryGroupMember.user_id == current_user.id,
        )
        .first()
    )
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this group")

    existing = (
        db.query(Like)
        .filter(Like.post_id == post_id, Like.user_id == current_user.id)
        .first()
    )

    if existing:
        db.delete(existing)
        db.commit()
        liked = False
    else:
        like = Like(post_id=post_id, user_id=current_user.id)
        db.add(like)
        db.commit()
        liked = True

    like_count = db.query(Like).filter(Like.post_id == post_id).count()
    return LikeResponse(liked=liked, like_count=like_count)
