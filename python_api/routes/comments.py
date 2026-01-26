"""
评论路由模块
处理评论相关的 API 端点
"""
import os
import uuid
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from typing import Optional

from ..models.comment import (
    CommentCreate, CommentResponse, CommentListResponse, CommentLikeResponse
)
from ..services.comment_service import CommentService
from ..utils import get_current_user, get_current_user_optional

router = APIRouter(prefix="/api", tags=["comments"])

# 音频文件上传配置
AUDIO_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "audio")
ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".webm", ".m4a", ".ogg"}
MAX_AUDIO_SIZE = 5 * 1024 * 1024  # 5MB


@router.get("/posts/{post_id}/comments", response_model=CommentListResponse)
async def get_post_comments(
    post_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    获取帖子的评论列表
    
    - **post_id**: 帖子ID
    - **page**: 页码，从1开始
    - **page_size**: 每页数量，最大50
    """
    viewer_id = current_user["id"] if current_user else None
    result = CommentService.get_comments(
        post_id=post_id,
        page=page,
        page_size=page_size,
        viewer_id=viewer_id
    )
    return result


@router.post("/posts/{post_id}/comments", response_model=CommentResponse)
async def create_comment(
    post_id: int,
    comment_data: CommentCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    发表评论
    
    - **post_id**: 帖子ID
    - **content**: 评论内容（必填，1-1000字）
    - **parent_id**: 父评论ID（可选，回复评论时使用）
    - **audio_url**: 语音评论URL（可选）
    """
    comment = CommentService.create_comment(
        post_id=post_id,
        user_id=current_user["id"],
        content=comment_data.content,
        parent_id=comment_data.parent_id,
        audio_url=comment_data.audio_url
    )
    
    if not comment:
        raise HTTPException(status_code=404, detail="帖子不存在或父评论无效")
    
    return comment


@router.post("/comments/upload-audio")
async def upload_comment_audio(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    上传评论语音文件
    
    返回语音文件URL，可用于创建评论时的 audio_url 字段
    """
    # 验证文件扩展名
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的音频格式。允许的格式: {', '.join(ALLOWED_AUDIO_EXTENSIONS)}"
        )
    
    # 读取文件内容
    content = await file.read()
    
    # 验证文件大小
    if len(content) > MAX_AUDIO_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"文件大小超过限制 ({MAX_AUDIO_SIZE // 1024 // 1024}MB)"
        )
    
    # 确保上传目录存在
    os.makedirs(AUDIO_UPLOAD_DIR, exist_ok=True)
    
    # 生成唯一文件名
    filename = f"comment_{current_user['id']}_{uuid.uuid4().hex[:12]}{ext}"
    filepath = os.path.join(AUDIO_UPLOAD_DIR, filename)
    
    # 保存文件
    with open(filepath, "wb") as f:
        f.write(content)
    
    audio_url = f"/uploads/audio/{filename}"
    
    return {
        "success": True,
        "audio_url": audio_url,
        "filename": filename,
        "size": len(content),
        "message": "语音上传成功"
    }


@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    删除评论（仅评论作者可删除）
    """
    success = CommentService.delete_comment(comment_id, current_user["id"])
    
    if not success:
        raise HTTPException(status_code=403, detail="无权删除此评论或评论不存在")
    
    return {
        "success": True,
        "message": "评论已删除"
    }


@router.post("/comments/{comment_id}/like", response_model=CommentLikeResponse)
async def toggle_comment_like(
    comment_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    点赞/取消点赞评论
    
    如果已点赞则取消，未点赞则添加点赞
    """
    result = CommentService.toggle_comment_like(comment_id, current_user["id"])
    
    if result is None:
        raise HTTPException(status_code=404, detail="评论不存在")
    
    return {
        "success": True,
        "is_liked": result["is_liked"],
        "likes_count": result["likes_count"],
        "message": "点赞成功" if result["is_liked"] else "已取消点赞"
    }


@router.get("/comments/{comment_id}/replies", response_model=CommentListResponse)
async def get_comment_replies(
    comment_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    获取评论的回复列表
    
    - **comment_id**: 评论ID
    - **page**: 页码，从1开始
    - **page_size**: 每页数量，最大50
    """
    viewer_id = current_user["id"] if current_user else None
    result = CommentService.get_comment_replies(
        comment_id=comment_id,
        page=page,
        page_size=page_size,
        viewer_id=viewer_id
    )
    return result
