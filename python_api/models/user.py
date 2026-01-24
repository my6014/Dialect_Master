"""
用户数据模型
包含用户资料相关的 Pydantic 模型
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class UserProfile(BaseModel):
    """用户资料模型"""
    id: int
    username: str
    email: Optional[str] = None
    nickname: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    hometown: Optional[str] = None
    dialect: Optional[str] = None
    points: int = 0
    level: int = 1
    followers_count: int = 0
    following_count: int = 0
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    """
    用户资料更新模型
    所有字段都是可选的，只更新提供的字段
    """
    nickname: Optional[str] = Field(None, max_length=50)
    bio: Optional[str] = Field(None, max_length=500)
    hometown: Optional[str] = Field(None, max_length=100)
    dialect: Optional[str] = Field(None, max_length=50)
    avatar_url: Optional[str] = None


class UserPublicProfile(BaseModel):
    """
    公开的用户资料（他人可见）
    不包含敏感信息如 email
    """
    id: int
    username: str
    nickname: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    hometown: Optional[str] = None
    dialect: Optional[str] = None
    points: int = 0
    level: int = 1
    level_name: str = "方言新手"
    followers_count: int = 0
    following_count: int = 0
    is_following: bool = False  # 当前用户是否关注了此用户
    created_at: Optional[datetime] = None


# 等级名称映射
LEVEL_NAMES = {
    1: "方言新手",
    2: "方言学徒",
    3: "方言爱好者",
    4: "方言达人",
    5: "方言大师",
    6: "方言宗师"
}

# 等级所需积分
LEVEL_POINTS = {
    1: 0,
    2: 100,
    3: 500,
    4: 2000,
    5: 5000,
    6: 10000
}


def get_level_name(level: int) -> str:
    """根据等级获取等级名称"""
    return LEVEL_NAMES.get(level, "方言新手")


def calculate_level(points: int) -> int:
    """根据积分计算等级"""
    if points >= 10000:
        return 6
    elif points >= 5000:
        return 5
    elif points >= 2000:
        return 4
    elif points >= 500:
        return 3
    elif points >= 100:
        return 2
    else:
        return 1
