"""
Pydantic 数据模型定义
用于请求和响应的数据验证
"""
from pydantic import BaseModel, Field


class AuthBody(BaseModel):
    """认证请求体（登录/注册）"""
    username: str = Field(..., min_length=1, description="用户名")
    password: str = Field(..., min_length=1, description="密码")
