"""
帖子数据模型
包含帖子相关的 Pydantic 模型
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class PostCreate(BaseModel):
    """创建帖子请求模型"""
    content: str = Field(..., min_length=1, max_length=2000)
    dialect_tag: Optional[str] = Field(None, max_length=20)
    audio_url: Optional[str] = None


class PostUpdate(BaseModel):
    """更新帖子请求模型"""
    content: Optional[str] = Field(None, min_length=1, max_length=2000)
    dialect_tag: Optional[str] = Field(None, max_length=20)


class PostAuthor(BaseModel):
    """帖子作者信息"""
    id: int
    username: str
    nickname: Optional[str] = None
    avatar_url: Optional[str] = None
    level: int = 1
    level_name: str = "方言新手"


class PostResponse(BaseModel):
    """帖子响应模型"""
    id: int
    content: str
    audio_url: Optional[str] = None
    dialect_tag: Optional[str] = None
    likes_count: int = 0
    comments_count: int = 0
    views_count: int = 0
    is_liked: bool = False  # 当前用户是否点赞
    author: PostAuthor
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    """帖子列表响应模型"""
    posts: List[PostResponse]
    total: int
    page: int
    page_size: int
    has_more: bool


class PostDetailResponse(PostResponse):
    """帖子详情响应模型（包含更多信息）"""
    pass


# 常用方言标签列表
DIALECT_TAGS = [
    "粤语", "四川话", "东北话", "上海话", "闽南语",
    "客家话", "湖南话", "河南话", "山东话", "陕西话",
    "温州话", "武汉话", "南京话", "苏州话", "杭州话",
    "天津话", "山西话", "江西话", "福州话", "潮汕话",
    "其他"
]


def get_dialect_tags() -> List[str]:
    """获取所有方言标签"""
    return DIALECT_TAGS
