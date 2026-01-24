"""
认证路由
处理用户注册和登录请求
"""
from fastapi import APIRouter
from ..models import AuthBody, RegisterBody, SendCodeBody, ResetPasswordBody
from ..services import AuthService, EmailService
from ..utils import create_access_token

router = APIRouter(tags=["认证"])


@router.post("/register")
def register(body: RegisterBody):
    """
    用户注册接口（带邮箱验证）
    
    Args:
        body: 包含用户名、密码、邮箱和验证码的请求体
        
    Returns:
        注册结果
    """
    return AuthService.register(body.username, body.password, body.email, body.code)


@router.post("/login")
def login(body: AuthBody):
    """
    用户登录接口
    
    Args:
        body: 包含用户名和密码的请求体
        
    Returns:
        登录结果，成功时包含用户ID和 JWT token
    """
    result = AuthService.login(body.username, body.password)
    
    # 如果登录成功，生成 JWT token
    if result.get("ok") and result.get("userId"):
        token = create_access_token(result["userId"], body.username)
        result["token"] = token
    
    return result


@router.post("/send-code")
def send_verification_code(body: SendCodeBody):
    """
    发送邮箱验证码接口
    
    Args:
        body: 包含邮箱地址和用途的请求体
        
    Returns:
        发送结果
    """
    return EmailService.send_verification_code(body.email, body.purpose)


@router.post("/reset-password")
def reset_password(body: ResetPasswordBody):
    """
    重置密码接口
    
    Args:
        body: 包含邮箱、验证码和新密码的请求体
        
    Returns:
        重置结果
    """
    return AuthService.reset_password(body.email, body.code, body.new_password)

