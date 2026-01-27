"""
通知路由模块
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Dict, Any, Optional
from ..services.notification_service import NotificationService
from ..utils.jwt_auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

@router.get("", response_model=Dict[str, Any])
async def get_notifications(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """
    获取通知列表
    """
    return NotificationService.get_notifications(current_user["id"], page, size)

@router.get("/unread-count", response_model=Dict[str, int])
async def get_unread_count(
    current_user: dict = Depends(get_current_user)
):
    """
    获取未读数量
    """
    count = NotificationService.get_unread_count(current_user["id"])
    return {"count": count}

@router.post("/{notification_id}/read")
async def mark_as_read(
    notification_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    标记单条已读
    """
    success = NotificationService.mark_as_read(notification_id, current_user["id"])
    return {"success": success}

@router.post("/read-all")
async def mark_all_as_read(
    current_user: dict = Depends(get_current_user)
):
    """
    全部标记已读
    """
    count = NotificationService.mark_all_as_read(current_user["id"])
    return {"success": True, "count": count}
