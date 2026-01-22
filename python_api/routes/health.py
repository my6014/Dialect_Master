"""
健康检查路由
提供服务健康状态检查接口
"""
import time
from fastapi import APIRouter

router = APIRouter(tags=["健康检查"])


@router.get("/hello")
def hello():
    """
    健康检查接口
    
    Returns:
        包含欢迎消息和时间戳的字典
    """
    return {
        "message": "你好，方言宝！",
        "timestamp": int(time.time())
    }
