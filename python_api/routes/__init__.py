"""API 路由包"""
from .health import router as health_router
from .auth import router as auth_router
from .asr import router as asr_router
from .users import router as users_router
from .posts import router as posts_router
from .follows import router as follows_router
from .comments import router as comments_router

from .notifications import router as notifications_router
from .points import router as points_router

__all__ = ["health_router", "auth_router", "asr_router", "users_router", "posts_router", "comments_router", "follows_router", "notifications_router", "points_router"]
