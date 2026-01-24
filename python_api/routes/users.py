"""
用户资料路由模块
处理用户资料相关的 API 端点
"""
import os
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import Optional

from ..models.user import UserProfileUpdate, UserPublicProfile, UserProfile
from ..services.user_service import UserService
from ..utils import get_current_user, get_current_user_optional

router = APIRouter(prefix="/api/users", tags=["users"])

# 文件上传配置
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "avatars")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """
    获取当前登录用户的资料
    """
    user = UserService.get_user_by_id(current_user["id"])
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user


@router.put("/me", response_model=UserProfile)
async def update_current_user_profile(
    update_data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    更新当前登录用户的资料
    """
    user = UserService.update_profile(current_user["id"], update_data)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user


@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    上传/更新用户头像
    """
    # 验证文件扩展名
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"不支持的文件格式。允许的格式: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # 读取文件内容
    content = await file.read()
    
    # 验证文件大小
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400, 
            detail=f"文件大小超过限制 ({MAX_FILE_SIZE // 1024 // 1024}MB)"
        )
    
    # 确保上传目录存在
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # 生成唯一文件名
    filename = f"{current_user['id']}_{uuid.uuid4().hex[:8]}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    # 保存文件
    with open(filepath, "wb") as f:
        f.write(content)
    
    # 更新数据库中的头像URL
    avatar_url = f"/uploads/avatars/{filename}"
    success = UserService.update_avatar(current_user["id"], avatar_url)
    
    if not success:
        # 删除已上传的文件
        os.remove(filepath)
        raise HTTPException(status_code=500, detail="更新头像失败")
    
    return {
        "success": True,
        "avatar_url": avatar_url,
        "message": "头像上传成功"
    }


@router.get("/{user_id}", response_model=UserPublicProfile)
async def get_user_profile(
    user_id: int,
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    获取指定用户的公开资料
    """
    viewer_id = current_user["id"] if current_user else None
    user = UserService.get_public_profile(user_id, viewer_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    return user


@router.get("/search/")
async def search_users(
    q: str,
    limit: int = 20,
    offset: int = 0
):
    """
    搜索用户
    
    Args:
        q: 搜索关键词
        limit: 返回数量限制
        offset: 偏移量
    """
    if not q or len(q) < 1:
        raise HTTPException(status_code=400, detail="搜索关键词不能为空")
    
    users = UserService.search_users(q, min(limit, 50), offset)
    
    return {
        "users": users,
        "count": len(users),
        "query": q
    }
