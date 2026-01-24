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
        # 创建用户表
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
              id SERIAL PRIMARY KEY,
              username TEXT UNIQUE NOT NULL,
              password_hash TEXT NOT NULL,
              email TEXT UNIQUE,
              email_verified BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMPTZ DEFAULT NOW()
            )
            """
        )
        
        # 尝试添加 email 字段（如果表已存在但没有该字段）
        cur.execute(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'email'
                ) THEN
                    ALTER TABLE users ADD COLUMN email TEXT UNIQUE;
                    ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
                END IF;
            END $$;
            """
        )
        
        conn.commit()


def ensure_verification_codes_table(conn):
    """
    确保验证码表存在，如不存在则创建
    
    Args:
        conn: 数据库连接对象
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS verification_codes (
              id SERIAL PRIMARY KEY,
              email TEXT NOT NULL,
              code TEXT NOT NULL,
              purpose TEXT NOT NULL,
              expires_at TIMESTAMPTZ NOT NULL,
              used BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMPTZ DEFAULT NOW()
            )
            """
        )
        # 创建索引加速查询
        cur.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_verification_codes_email 
            ON verification_codes(email, purpose, used)
            """
        )
        conn.commit()
