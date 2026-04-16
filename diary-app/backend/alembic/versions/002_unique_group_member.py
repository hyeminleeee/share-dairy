"""unique constraint on diary_group_members(group_id, user_id)

Revision ID: 002
Revises: 001
Create Date: 2026-04-16 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # 중복 멤버십 제거: 같은 (group_id, user_id) 중 id가 가장 작은 것만 남김
    conn.execute(sa.text("""
        DELETE m1 FROM diary_group_members m1
        INNER JOIN diary_group_members m2
            ON m1.group_id = m2.group_id
           AND m1.user_id  = m2.user_id
           AND m1.id       > m2.id
    """))

    # 유니크 제약 추가
    op.create_unique_constraint(
        "uq_group_member",
        "diary_group_members",
        ["group_id", "user_id"],
    )


def downgrade() -> None:
    op.drop_constraint("uq_group_member", "diary_group_members", type_="unique")
