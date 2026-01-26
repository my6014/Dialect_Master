
import sys
import os
import psycopg
from pydantic import VERSION as PYDANTIC_VERSION
from dotenv import load_dotenv

# 添加路径以便导入项目模块
sys.path.append(os.getcwd())

# 加载环境变量
load_dotenv("python_api/.env.local")

try:
    from python_api.models.comment import CommentResponse
    print(f"✅ Pydantic 版本: {PYDANTIC_VERSION}")
    print("✅ CommentResponse 模型导入成功")
except Exception as e:
    print(f"❌ 模型导入失败: {e}")

try:
    # 直接连接数据库检查表
    db_name = os.getenv("DB_NAME", "dialect_master")
    db_user = os.getenv("DB_USER", "postgres")
    db_password = os.getenv("DB_PASSWORD", "password")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5432")
    
    conn_str = f"dbname={db_name} user={db_user} password={db_password} host={db_host} port={db_port}"
    print(f"连接数据库: {db_host}:{db_port}/{db_name}")
    
    with psycopg.connect(conn_str) as conn:
        with conn.cursor() as cur:
            # 检查 comments 表
            cur.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comments');")
            exists = cur.fetchone()[0]
            if exists:
                print("✅ comments 表已存在")
            else:
                print("❌ comments 表不存在！请重启后端服务以运行迁移。")
            
            # 检查 likes 表
            cur.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'likes');")
            exists = cur.fetchone()[0]
            if exists:
                print("✅ likes 表已存在")
            else:
                print("❌ likes 表不存在！")

except Exception as e:
    print(f"❌ 数据库连接失败: {e}")
