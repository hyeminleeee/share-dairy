from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models.comment import Comment
from app.models.diary_group import DiaryGroupMember
from app.models.post import Post
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentResponse

router = APIRouter(prefix="/comments", tags=["comments"])


@router.post("", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    body: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(Post).filter(Post.id == body.post_id).first()
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

    if body.parent_id:
        parent = db.query(Comment).filter(Comment.id == body.parent_id).first()
        if not parent or parent.post_id != body.post_id:
            raise HTTPException(status_code=400, detail="Invalid parent comment")

    comment = Comment(
        post_id=body.post_id,
        user_id=current_user.id,
        parent_id=body.parent_id,
        content=body.content,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


@router.get("/post/{post_id}", response_model=list[CommentResponse])
def list_comments(
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

    return (
        db.query(Comment)
        .filter(Comment.post_id == post_id, Comment.parent_id == None)
        .order_by(Comment.created_at.asc())
        .all()
    )


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = db.query(Comment).filter(Comment.id == id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not the author")
    db.delete(comment)
    db.commit()
