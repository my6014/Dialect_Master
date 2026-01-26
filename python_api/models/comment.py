"""
评论数据模型
包含评论相关的 Pydantic 模型
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CommentCreate(BaseModel):
    """创建评论请求模型"""
    content: str = Field(..., min_length=1, max_length=1000, description="评论内容")
    parent_id: Optional[int] = Field(None, description="父评论ID（回复评论时使用）")
    audio_url: Optional[str] = Field(None, description="语音评论URL")


class CommentAuthor(BaseModel):
    """评论作者信息"""
    id: int
    username: str
    nickname: Optional[str] = None
    avatar_url: Optional[str] = None
    level: int = 1
    level_name: str = "方言新手"


class CommentResponse(BaseModel):
    """评论响应模型"""
    id: int
    post_id: int
    user_id: int
    parent_id: Optional[int] = None
    content: str
    audio_url: Optional[str] = None
    likes_count: int = 0
    is_liked: bool = False  # 当前用户是否点赞
    is_deleted: bool = False
    author: CommentAuthor
    created_at: datetime
    replies: List['CommentResponse'] = []  # 子回复列表
    reply_count: int = 0  # 回复数量

    class Config:
        from_attributes = True


class CommentListResponse(BaseModel):
    """评论列表响应模型"""
    comments: List[CommentResponse]
    total: int
    page: int
    page_size: int
    has_more: bool


class CommentLikeResponse(BaseModel):
    """评论点赞响应模型"""
    success: bool
    is_liked: bool
    likes_count: int
    message: str


# 更新前向引用
CommentResponse.model_rebuild()
