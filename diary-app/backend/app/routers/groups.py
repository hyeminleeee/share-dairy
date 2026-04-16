from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models.diary_group import DiaryGroup, DiaryGroupMember
from app.models.user import User
from app.schemas.group import DiaryGroupCreate, DiaryGroupDetailResponse, DiaryGroupResponse

router = APIRouter(prefix="/groups", tags=["groups"])


@router.post("", response_model=DiaryGroupResponse, status_code=status.HTTP_201_CREATED)
def create_group(
    body: DiaryGroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    group = DiaryGroup(name=body.name, owner_id=current_user.id)
    db.add(group)
    db.flush()

    member = DiaryGroupMember(group_id=group.id, user_id=current_user.id)
    db.add(member)
    db.commit()
    db.refresh(group)

    result = DiaryGroupResponse.model_validate(group)
    result.member_count = 1
    return result


@router.get("", response_model=list[DiaryGroupResponse])
def list_groups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    memberships = (
        db.query(DiaryGroupMember).filter(DiaryGroupMember.user_id == current_user.id).all()
    )
    seen = set()
    groups = []
    for m in memberships:
        if m.group_id in seen:
            continue
        seen.add(m.group_id)
        group = m.group
        r = DiaryGroupResponse.model_validate(group)
        r.member_count = len(group.members)
        groups.append(r)
    return groups


@router.get("/{id}", response_model=DiaryGroupDetailResponse)
def get_group(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    group = db.query(DiaryGroup).filter(DiaryGroup.id == id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    is_member = any(m.user_id == current_user.id for m in group.members)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this group")

    return group


@router.post("/invite/{token}", response_model=DiaryGroupResponse)
def join_by_invite(
    token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    group = db.query(DiaryGroup).filter(DiaryGroup.invite_token == token).first()
    if not group:
        raise HTTPException(status_code=404, detail="Invalid invite link")

    already = (
        db.query(DiaryGroupMember)
        .filter(DiaryGroupMember.group_id == group.id, DiaryGroupMember.user_id == current_user.id)
        .first()
    )
    if not already:
        member = DiaryGroupMember(group_id=group.id, user_id=current_user.id)
        db.add(member)
        db.commit()
        db.refresh(group)

    result = DiaryGroupResponse.model_validate(group)
    result.member_count = len(group.members)
    return result


@router.delete("/{id}/leave", status_code=status.HTTP_204_NO_CONTENT)
def leave_group(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    group = db.query(DiaryGroup).filter(DiaryGroup.id == id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if group.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="Owner cannot leave the group. Delete it instead.")

    member = (
        db.query(DiaryGroupMember)
        .filter(DiaryGroupMember.group_id == id, DiaryGroupMember.user_id == current_user.id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=404, detail="Not a member")
    db.delete(member)
    db.commit()


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_group(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    group = db.query(DiaryGroup).filter(DiaryGroup.id == id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if group.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the owner can delete the group")
    db.delete(group)
    db.commit()
