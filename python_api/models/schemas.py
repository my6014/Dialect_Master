"""
Pydantic 数据模型定义
用于请求和响应的数据验证
"""
from pydantic import BaseModel, Field, EmailStr


class AuthBody(BaseModel):
    """认证请求体（登录）"""
    username: str = Field(..., min_length=1, description="用户名")
    password: str = Field(..., min_length=1, description="密码")


class RegisterBody(BaseModel):
    """注册请求体（带邮箱验证）"""
    username: str = Field(..., min_length=1, description="用户名")
    password: str = Field(..., min_length=6, description="密码（至少6位）")
    email: EmailStr = Field(..., description="邮箱地址")
    code: str = Field(..., min_length=6, max_length=6, description="邮箱验证码")


class SendCodeBody(BaseModel):
    """发送验证码请求体"""
    email: EmailStr = Field(..., description="邮箱地址")
    purpose: str = Field(default="register", description="验证码用途: register/reset_password")


class ResetPasswordBody(BaseModel):
    """重置密码请求体"""
    email: EmailStr = Field(..., description="邮箱地址")
    code: str = Field(..., min_length=6, max_length=6, description="邮箱验证码")
    new_password: str = Field(..., min_length=6, description="新密码（至少6位）")

