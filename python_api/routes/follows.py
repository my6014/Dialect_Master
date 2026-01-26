"""
关注路由模块
处理用户关注/取消关注、粉丝列表等 API 端点
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional

from ..services.follow_service import FollowService
from ..models.follow import FollowResponse, FollowerListResponse, FollowingListResponse
from ..utils.jwt_auth import get_current_user, get_current_user_optional

router = APIRouter(prefix="/api/users", tags=["users"])

@router.post("/{user_id}/follow", response_model=FollowResponse)
async def follow_user(
    user_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    关注用户
    """
    try:
        success = FollowService.follow_user(current_user["id"], user_id)
        if success:
            return FollowResponse(message="关注成功", is_following=True)
        else:
            # Maybe it returned False because you can't follow yourself or already followed.
            # We can check is_following to be precise, but assuming success=False means no action taken.
            is_following = FollowService.is_following(current_user["id"], user_id)
            return FollowResponse(message="已关注或无法关注", is_following=is_following)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{user_id}/follow", response_model=FollowResponse)
async def unfollow_user(
    user_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    取消关注
    """
    try:
        success = FollowService.unfollow_user(current_user["id"], user_id)
        # If success is True, we are no longer following.
        # If success is False, we were not following to begin with.
        return FollowResponse(message="取消关注成功" if success else "未关注", is_following=False)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}/followers", response_model=FollowerListResponse)
async def get_followers(
    user_id: int,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    获取粉丝列表
    """
    viewer_id = current_user["id"] if current_user else None
    return FollowService.get_followers(user_id, page, size, viewer_id)

@router.get("/{user_id}/following", response_model=FollowingListResponse)
async def get_following(
    user_id: int,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    获取关注列表
    """
    viewer_id = current_user["id"] if current_user else None
    return FollowService.get_following(user_id, page, size, viewer_id)
