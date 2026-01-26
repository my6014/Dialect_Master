"""
数据库迁移模块
管理数据库表结构的升级和变更
"""
import psycopg
from .connection import get_db_connection


def run_migrations():
    """
    运行所有数据库迁移
    """
    conn = get_db_connection()
    try:
        migrate_users_profile(conn)
        migrate_create_posts_table(conn)
        migrate_create_comments_table(conn)
        migrate_create_likes_table(conn)
        migrate_create_follows_table(conn)
        migrate_create_notifications_table(conn)
        print("[完成] 所有数据库迁移完成")
    finally:
        conn.close()


def migrate_users_profile(conn):
    """
    Phase 1: 用户资料扩展
    添加昵称、头像、简介、家乡、方言、积分、等级等字段
    """
    with conn.cursor() as cur:
        # 添加用户资料扩展字段
        migration_sql = """
        DO $$
        BEGIN
            -- 昵称
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'nickname'
            ) THEN
                ALTER TABLE users ADD COLUMN nickname TEXT;
            END IF;
            
            -- 头像URL
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'avatar_url'
            ) THEN
                ALTER TABLE users ADD COLUMN avatar_url TEXT;
            END IF;
            
            -- 个人简介
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'bio'
            ) THEN
                ALTER TABLE users ADD COLUMN bio TEXT;
            END IF;
            
            -- 家乡
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'hometown'
            ) THEN
                ALTER TABLE users ADD COLUMN hometown TEXT;
            END IF;
            
            -- 母语方言
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'dialect'
            ) THEN
                ALTER TABLE users ADD COLUMN dialect TEXT;
            END IF;
            
            -- 积分
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'points'
            ) THEN
                ALTER TABLE users ADD COLUMN points INT DEFAULT 0;
            END IF;
            
            -- 用户等级
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'level'
            ) THEN
                ALTER TABLE users ADD COLUMN level INT DEFAULT 1;
            END IF;
            
            -- 粉丝数
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'followers_count'
            ) THEN
                ALTER TABLE users ADD COLUMN followers_count INT DEFAULT 0;
            END IF;
            
            -- 关注数
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'following_count'
            ) THEN
                ALTER TABLE users ADD COLUMN following_count INT DEFAULT 0;
            END IF;
            
            -- 更新时间
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'updated_at'
            ) THEN
                ALTER TABLE users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
            END IF;
        END $$;
        """
        cur.execute(migration_sql)
        conn.commit()
        print("[完成] 用户资料表迁移完成")


def migrate_create_posts_table(conn):
    """
    Phase 2: 创建帖子表
    """
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS posts (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                audio_url TEXT,
                dialect_tag TEXT,
                likes_count INT DEFAULT 0,
                comments_count INT DEFAULT 0,
                views_count INT DEFAULT 0,
                is_deleted BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        """)
        
        # 创建索引
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_posts_dialect_tag ON posts(dialect_tag);
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
        """)
        
        conn.commit()
        print("[完成] 帖子表创建完成")


def migrate_create_comments_table(conn):
    """
    Phase 3: 创建评论表
    """
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS comments (
                id SERIAL PRIMARY KEY,
                post_id INT REFERENCES posts(id) ON DELETE CASCADE,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                parent_id INT REFERENCES comments(id),
                content TEXT NOT NULL,
                audio_url TEXT,
                likes_count INT DEFAULT 0,
                is_deleted BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        """)
        
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
        """)
        
        conn.commit()
        print("[完成] 评论表创建完成")


def migrate_create_likes_table(conn):
    """
    Phase 3: 创建点赞表
    """
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS likes (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                post_id INT REFERENCES posts(id) ON DELETE CASCADE,
                comment_id INT REFERENCES comments(id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        """)
        
        # 创建唯一约束（分别处理，避免冲突）
        cur.execute("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_indexes 
                    WHERE indexname = 'unique_user_post_like'
                ) THEN
                    CREATE UNIQUE INDEX unique_user_post_like 
                    ON likes(user_id, post_id) WHERE post_id IS NOT NULL;
                END IF;
            END $$;
        """)
        
        cur.execute("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_indexes 
                    WHERE indexname = 'unique_user_comment_like'
                ) THEN
                    CREATE UNIQUE INDEX unique_user_comment_like 
                    ON likes(user_id, comment_id) WHERE comment_id IS NOT NULL;
                END IF;
            END $$;
        """)
        
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
        """)
        
        conn.commit()
        print("[完成] 点赞表创建完成")


def migrate_create_follows_table(conn):
    """
    Phase 4: 创建关注关系表
    """
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS follows (
                id SERIAL PRIMARY KEY,
                follower_id INT REFERENCES users(id) ON DELETE CASCADE,
                following_id INT REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(follower_id, following_id)
            )
        """)
        
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
        """)
        
        conn.commit()
        print("[完成] 关注表创建完成")


def migrate_create_notifications_table(conn):
    """
    Phase 5: 创建通知表
    """
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                type TEXT NOT NULL,
                actor_id INT REFERENCES users(id),
                post_id INT REFERENCES posts(id),
                comment_id INT REFERENCES comments(id),
                content TEXT,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        """)
        
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_notifications_user 
            ON notifications(user_id, is_read);
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_notifications_created 
            ON notifications(created_at DESC);
        """)
        
        conn.commit()
        print("[完成] 通知表创建完成")


if __name__ == "__main__":
    run_migrations()
