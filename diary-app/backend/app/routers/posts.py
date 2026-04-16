import os
import uuid

import aiofiles
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user
from app.database import get_db
from app.models.diary_group import DiaryGroupMember
from app.models.like import Like
from app.models.post import Post
from app.models.user import User
from app.schemas.post import PostResponse

router = APIRouter(prefix="/posts", tags=["posts"])


def _check_member(db: Session, group_id: int, user_id: int):
    member = (
        db.query(DiaryGroupMember)
        .filter(DiaryGroupMember.group_id == group_id, DiaryGroupMember.user_id == user_id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this group")


def _build_response(post: Post, current_user_id: int) -> PostResponse:
    like_count = len(post.likes)
    comment_count = len(post.comments)
    is_liked = any(l.user_id == current_user_id for l in post.likes)
    r = PostResponse.model_validate(post)
    r.like_count = like_count
    r.comment_count = comment_count
    r.is_liked = is_liked
    return r


@router.get("/feed")
def get_feed(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = 1,
    size: int = 20,
):
    memberships = (
        db.query(DiaryGroupMember).filter(DiaryGroupMember.user_id == current_user.id).all()
    )
    group_ids = [m.group_id for m in memberships]

    posts = (
        db.query(Post)
        .filter(Post.group_id.in_(group_ids))
        .order_by(Post.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )
    return [_build_response(p, current_user.id) for p in posts]


@router.get("/group/{group_id}")
def get_group_posts(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = 1,
    size: int = 20,
):
    _check_member(db, group_id, current_user.id)
    posts = (
        db.query(Post)
        .filter(Post.group_id == group_id)
        .order_by(Post.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )
    return [_build_response(p, current_user.id) for p in posts]


@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    group_id: int = Form(...),
    content: str = Form(...),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _check_member(db, group_id, current_user.id)

    image_url = None
    if image:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        ext = os.path.splitext(image.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        path = os.path.join(settings.UPLOAD_DIR, filename)
        async with aiofiles.open(path, "wb") as f:
            await f.write(await image.read())
        image_url = f"/uploads/{filename}"

    post = Post(
        group_id=group_id,
        user_id=current_user.id,
        content=content,
        image_url=image_url,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return _build_response(post, current_user.id)


@router.get("/{id}", response_model=PostResponse)
def get_post(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(Post).filter(Post.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    _check_member(db, post.group_id, current_user.id)
    return _build_response(post, current_user.id)


@router.put("/{id}", response_model=PostResponse)
async def update_post(
    id: int,
    content: str = Form(...),
    image: UploadFile | None = File(None),
    remove_image: bool = Form(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(Post).filter(Post.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not the author")

    post.content = content

    if image:
        # 기존 파일 삭제
        if post.image_url:
            old_path = os.path.join(settings.UPLOAD_DIR, os.path.basename(post.image_url))
            if os.path.exists(old_path):
                os.remove(old_path)
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        ext = os.path.splitext(image.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        path = os.path.join(settings.UPLOAD_DIR, filename)
        async with aiofiles.open(path, "wb") as f:
            await f.write(await image.read())
        post.image_url = f"/uploads/{filename}"
    elif remove_image and post.image_url:
        # 이미지 제거 요청: 파일 삭제 후 null 처리
        old_path = os.path.join(settings.UPLOAD_DIR, os.path.basename(post.image_url))
        if os.path.exists(old_path):
            os.remove(old_path)
        post.image_url = None

    db.commit()
    db.refresh(post)
    return _build_response(post, current_user.id)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(Post).filter(Post.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not the author")
    db.delete(post)
    db.commit()
