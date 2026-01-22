"""
认证路由
处理用户注册和登录请求
"""
from fastapi import APIRouter
from ..models import AuthBody
from ..services import AuthService

router = APIRouter(tags=["认证"])


@router.post("/register")
def register(body: AuthBody):
    """
    用户注册接口
    
    Args:
        body: 包含用户名和密码的请求体
        
    Returns:
        注册结果
    """
    return AuthService.register(body.username, body.password)


@router.post("/login")
def login(body: AuthBody):
    """
    用户登录接口
    
    Args:
        body: 包含用户名和密码的请求体
        
    Returns:
        登录结果，成功时包含用户ID
    """
    return AuthService.login(body.username, body.password)
