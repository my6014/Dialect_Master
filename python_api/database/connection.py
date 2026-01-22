"""
数据库连接模块
管理数据库连接和表结构
"""
import psycopg
from ..config import Config


def get_db_connection():
    """
    创建并返回数据库连接
    
    Returns:
        psycopg.Connection: 数据库连接对象
        
    Raises:
        RuntimeError: 当数据库配置缺失时
    """
    Config.validate()
    
    conn = psycopg.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        dbname=Config.DB_NAME,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD
    )
    return conn


def ensure_users_table(conn):
    """
    确保 users 表存在，如不存在则创建
    
    Args:
        conn: 数据库连接对象
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
              id SERIAL PRIMARY KEY,
              username TEXT UNIQUE NOT NULL,
              password_hash TEXT NOT NULL,
              created_at TIMESTAMPTZ DEFAULT NOW()
            )
            """
        )
        conn.commit()
