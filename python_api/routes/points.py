from fastapi import APIRouter, Depends, HTTPException, Query
from ..services.points_service import PointsService
from ..utils import get_current_user

router = APIRouter(prefix="/api/points", tags=["points"])

@router.post("/checkin")
async def daily_checkin(user: dict = Depends(get_current_user)):
    """
    用户每日签到
    """
    return PointsService.daily_checkin(user["id"])

@router.get("/status")
async def get_points_status(user: dict = Depends(get_current_user)):
    """
    获取当前用户积分状态（积分、等级、签到、连签天数）
    """
    return PointsService.get_user_status(user["id"])

@router.get("/leaderboard")
async def get_leaderboard(
    type: str = Query("total", regex="^(total|weekly|monthly)$", description="total:总榜, weekly:周榜, monthly:月榜"),
    limit: int = Query(50, le=100)
):
    """
    获取排行榜
    """
    return PointsService.get_leaderboard(type, limit)
