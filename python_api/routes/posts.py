"""
帖子路由模块
处理帖子相关的 API 端点
"""
import os
import uuid
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from typing import Optional

from ..models.post import (
    PostCreate, PostResponse, PostListResponse, 
    PostDetailResponse, get_dialect_tags
)
from ..services.post_service import PostService
from ..utils import get_current_user, get_current_user_optional

router = APIRouter(prefix="/api/posts", tags=["posts"])

# 音频文件上传配置
AUDIO_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "audio")
ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".webm", ".m4a", ".ogg"}
MAX_AUDIO_SIZE = 10 * 1024 * 1024  # 10MB


@router.get("", response_model=PostListResponse)
async def get_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    dialect: Optional[str] = Query(None, description="方言标签筛选"),
    user_id: Optional[int] = Query(None, description="用户ID筛选"),
    following: bool = Query(False, description="仅显示关注的人"),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    获取帖子列表
    
    - **page**: 页码，从1开始
    - **page_size**: 每页数量，最大50
    - **dialect**: 可选，按方言标签筛选
    - **user_id**: 可选，获取指定用户的帖子
    - **following**: 可选，仅显示关注的人
    """
    viewer_id = current_user["id"] if current_user else None
    result = PostService.get_posts(
        page=page,
        page_size=page_size,
        dialect_tag=dialect,
        user_id=user_id,
        viewer_id=viewer_id,
        following_only=following
    )
    return result


@router.post("", response_model=PostResponse)
async def create_post(
    post_data: PostCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    创建新帖子
    
    - **content**: 帖子内容（必填，1-2000字）
    - **dialect_tag**: 方言标签（可选）
    - **audio_url**: 音频URL（可选，需先通过上传接口获取）
    """
    post = PostService.create_post(
        user_id=current_user["id"],
        content=post_data.content,
        dialect_tag=post_data.dialect_tag,
        audio_url=post_data.audio_url
    )
    
    if not post:
        raise HTTPException(status_code=500, detail="创建帖子失败")
    
    return post


@router.post("/upload-audio")
async def upload_audio(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    上传帖子音频文件
    
    返回音频文件URL，可用于创建帖子时的 audio_url 字段
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
    filename = f"{current_user['id']}_{uuid.uuid4().hex[:12]}{ext}"
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
        "message": "音频上传成功"
    }


@router.get("/dialects")
async def get_dialects():
    """
    获取支持的方言标签列表
    """
    return {
        "dialects": get_dialect_tags()
    }


@router.get("/dialects/stats")
async def get_dialect_statistics():
    """
    获取方言标签统计（热门方言）
    """
    stats = PostService.get_dialect_stats()
    return {
        "stats": stats
    }


@router.get("/{post_id}", response_model=PostDetailResponse)
async def get_post_detail(
    post_id: int,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    获取帖子详情
    """
    viewer_id = current_user["id"] if current_user else None
    post = PostService.get_post_by_id(post_id, viewer_id)
    
    if not post:
        raise HTTPException(status_code=404, detail="帖子不存在")
    
    return post


@router.delete("/{post_id}")
async def delete_post(
    post_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    删除帖子（仅作者可删除）
    """
    success = PostService.delete_post(post_id, current_user["id"])
    
    if not success:
        raise HTTPException(status_code=403, detail="无权删除此帖子或帖子不存在")
    
    return {
        "success": True,
        "message": "帖子已删除"
    }


@router.get("/user/{user_id}", response_model=PostListResponse)
async def get_user_posts(
    user_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    获取指定用户的帖子列表
    """
    viewer_id = current_user["id"] if current_user else None
    result = PostService.get_posts(
        page=page,
        page_size=page_size,
        user_id=user_id,
        viewer_id=viewer_id
    )
    return result


@router.get("/dialect/{dialect_tag}", response_model=PostListResponse)
async def get_posts_by_dialect(
    dialect_tag: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    按方言标签获取帖子列表
    """
    viewer_id = current_user["id"] if current_user else None
    result = PostService.get_posts(
        page=page,
        page_size=page_size,
        dialect_tag=dialect_tag,
        viewer_id=viewer_id
    )
    return result


@router.post("/{post_id}/like")
async def toggle_like_post(
    post_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    点赞/取消点赞帖子
    
    如果已点赞则取消，未点赞则添加点赞
    """
    result = PostService.toggle_like(post_id, current_user["id"])
    
    if result is None:
        raise HTTPException(status_code=404, detail="帖子不存在")
    
    return {
        "success": True,
        "is_liked": result["is_liked"],
        "likes_count": result["likes_count"],
        "message": "点赞成功" if result["is_liked"] else "已取消点赞"
    }

