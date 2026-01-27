"""
通知数据模型
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .user import UserPublicProfile

class Notification(BaseModel):
    """通知模型"""
    id: int
    user_id: int
    type: str  # like, comment, reply, follow, system
    actor_id: Optional[int] = None
    post_id: Optional[int] = None
    comment_id: Optional[int] = None
    content: Optional[str] = None
    is_read: bool = False
    created_at: datetime
    
    # 扩展字段：触发者的用户信息
    actor: Optional[UserPublicProfile] = None

    class Config:
        from_attributes = True
