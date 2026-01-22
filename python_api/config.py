"""
配置管理模块
统一管理所有环境变量和配置项
"""
import os
from typing import Optional


class Config:
    """应用配置类"""
    
    # 数据库配置
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: Optional[str] = None
    DB_USER: Optional[str] = None
    DB_PASSWORD: str = ""
    
    # ASR 服务配置
    PYTHON_ASR_URL: str = "http://127.0.0.1:50000/api/v1/asr"
    
    # CORS 配置
    CORS_ORIGINS: list = ["*"]
    
    @classmethod
    def load_from_env(cls):
        """从环境变量加载配置"""
        cls._load_env_file()
        
        cls.DB_HOST = os.getenv("DB_HOST", cls.DB_HOST)
        cls.DB_PORT = int(os.getenv("DB_PORT", str(cls.DB_PORT)))
        cls.DB_NAME = os.getenv("DB_NAME")
        cls.DB_USER = os.getenv("DB_USER")
        cls.DB_PASSWORD = os.getenv("DB_PASSWORD", cls.DB_PASSWORD)
        cls.PYTHON_ASR_URL = os.getenv("PYTHON_ASR_URL", cls.PYTHON_ASR_URL)
    
    @staticmethod
    def _load_env_file():
        """加载 .env.local 文件"""
        paths = [
            os.path.join(os.path.dirname(__file__), ".env.local"),
            os.path.join(os.path.dirname(__file__), "..", "php-api", ".env.local"),
        ]
        
        for path in paths:
            if os.path.exists(path):
                with open(path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith("#") or "=" not in line:
                            continue
                        key, value = line.split("=", 1)
                        value = value.strip().strip('"').strip("'")
                        os.environ.setdefault(key.strip(), value)
                break
    
    @classmethod
    def validate(cls):
        """验证必需的配置项"""
        if not cls.DB_NAME or not cls.DB_USER:
            raise RuntimeError("数据库配置缺失: DB_NAME 和 DB_USER 是必需的")


# 初始化配置
Config.load_from_env()
