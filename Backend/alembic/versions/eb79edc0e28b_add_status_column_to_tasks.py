"""add status column to tasks

Revision ID: eb79edc0e28b
Revises: c10a22078407
Create Date: 2026-08-27 16:14:37.057764

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'eb79edc0e28b'
down_revision: Union[str, Sequence[str], None] = 'c10a22078407'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('tasks', sa.Column('status', sa.String(), nullable=False, server_default='TODO'))
    op.execute("UPDATE tasks SET status = 'COMPLETED' WHERE is_completed = true")
    op.create_index(op.f('ix_tasks_status'), 'tasks', ['status'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_tasks_status'), table_name='tasks')
    op.drop_column('tasks', 'status')
