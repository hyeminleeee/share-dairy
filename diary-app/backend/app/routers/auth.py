import os
import uuid

import aiofiles
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user
from app.core.security import create_access_token, get_password_hash, verify_password
from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    ChangePasswordRequest,
    FindAccountRequest,
    FindAccountResponse,
    ResetPasswordRequest,
    TokenResponse,
    UpdateProfileRequest,
    UserCreate,
    UserLogin,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.phone == body.phone).first():
        raise HTTPException(status_code=400, detail="Phone number already registered")

    user = User(
        name=body.name,
        email=body.email,
        phone=body.phone,
        password_hash=get_password_hash(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(body: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/find-account", response_model=FindAccountResponse)
def find_account(body: FindAccountRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.name == body.name, User.phone == body.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="No matching account found")
    masked = user.email[:2] + "***" + user.email[user.email.index("@"):]
    return FindAccountResponse(email=masked)


@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email, User.phone == body.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="No matching account found")
    user.password_hash = get_password_hash(body.new_password)
    db.commit()


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me/profile", response_model=UserResponse)
def update_profile(
    body: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 다른 사용자가 같은 전화번호를 사용 중인지 확인
    dup = db.query(User).filter(User.phone == body.phone, User.id != current_user.id).first()
    if dup:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    current_user.name = body.name
    current_user.phone = body.phone
    db.commit()
    db.refresh(current_user)
    return current_user


@router.patch("/me/avatar", response_model=UserResponse)
async def update_avatar(
    avatar: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if avatar.content_type not in allowed:
        raise HTTPException(status_code=400, detail="jpg, png, webp, gif 형식만 업로드 가능합니다")

    # 기존 파일 삭제
    if current_user.profile_image_url:
        old_path = os.path.join(
            settings.UPLOAD_DIR,
            os.path.basename(current_user.profile_image_url),
        )
        if os.path.exists(old_path):
            os.remove(old_path)

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(avatar.filename)[1] or ".jpg"
    filename = f"avatar_{uuid.uuid4()}{ext}"
    path = os.path.join(settings.UPLOAD_DIR, filename)
    async with aiofiles.open(path, "wb") as f:
        await f.write(await avatar.read())

    current_user.profile_image_url = f"/uploads/{filename}"
    db.commit()
    db.refresh(current_user)
    return current_user


@router.patch("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    body: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(body.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(body.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    current_user.password_hash = get_password_hash(body.new_password)
    db.commit()
