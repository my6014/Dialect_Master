"""
JWT 认证工具模块
处理 JWT token 的生成和验证
"""
import jwt
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..config import Config
from ..database.connection import get_db_connection

# JWT 配置
SECRET_KEY = Config.JWT_SECRET if hasattr(Config, 'JWT_SECRET') else "dialect-master-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24 * 7  # 7天

security = HTTPBearer(auto_error=False)


def create_access_token(user_id: int, username: str) -> str:
    """
    创建 JWT access token
    
    Args:
        user_id: 用户ID
        username: 用户名
        
    Returns:
        JWT token 字符串
    """
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {
        "sub": str(user_id),
        "username": username,
        "exp": expire,
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> Optional[dict]:
    """
    验证 JWT token
    
    Args:
        token: JWT token 字符串
        
    Returns:
        解码后的 payload 或 None
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    FastAPI 依赖项：获取当前登录用户
    
    Args:
        credentials: 从 Authorization header 获取的凭证
        
    Returns:
        用户信息字典
        
    Raises:
        HTTPException: 认证失败时
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="未提供认证凭证",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token = credentials.credentials
    payload = verify_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效或过期的 token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user_id = int(payload.get("sub"))
    username = payload.get("username")
    
    # 验证用户是否仍然存在
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, username FROM users WHERE id = %s", (user_id,))
            row = cur.fetchone()
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="用户不存在",
                    headers={"WWW-Authenticate": "Bearer"}
                )
    finally:
        conn.close()
    
    return {
        "id": user_id,
        "username": username
    }


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Optional[dict]:
    """
    FastAPI 依赖项：可选的用户认证
    如果提供了 token 则验证，否则返回 None
    
    Args:
        credentials: 从 Authorization header 获取的凭证
        
    Returns:
        用户信息字典或 None
    """
    if not credentials:
        return None
    
    token = credentials.credentials
    payload = verify_token(token)
    
    if not payload:
        return None
    
    return {
        "id": int(payload.get("sub")),
        "username": payload.get("username")
    }
