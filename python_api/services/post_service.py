"""
帖子服务模块
处理帖子相关的业务逻辑
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..database.connection import get_db_connection
from ..models.user import get_level_name


class PostService:
    """帖子服务类"""
    
    @staticmethod
    def create_post(user_id: int, content: str, dialect_tag: Optional[str] = None, 
                    audio_url: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        创建新帖子
        
        Args:
            user_id: 用户ID
            content: 帖子内容
            dialect_tag: 方言标签
            audio_url: 音频文件URL
            
        Returns:
            创建的帖子信息
        """
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO posts (user_id, content, dialect_tag, audio_url)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id, content, audio_url, dialect_tag, likes_count, 
                              comments_count, views_count, created_at, updated_at
                """, (user_id, content, dialect_tag, audio_url))
                
                result = cur.fetchone()
                conn.commit()
                
                if result:
                    # 获取作者信息
                    author = PostService._get_author_info(cur, user_id)
                    
                    # 增加用户积分（发帖 +10 积分）
                    PostService._add_user_points(cur, user_id, 10, "发布帖子")
                    conn.commit()
                    
                    return {
                        "id": result[0],
                        "content": result[1],
                        "audio_url": result[2],
                        "dialect_tag": result[3],
                        "likes_count": result[4],
                        "comments_count": result[5],
                        "views_count": result[6],
                        "created_at": result[7],
                        "updated_at": result[8],
                        "is_liked": False,
                        "author": author
                    }
                return None
        except Exception as e:
            conn.rollback()
            print(f"创建帖子失败: {e}")
            return None
        finally:
            conn.close()
    
    @staticmethod
    def get_post_by_id(post_id: int, viewer_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
        """
        获取帖子详情
        
        Args:
            post_id: 帖子ID
            viewer_id: 查看者ID（用于判断是否点赞）
            
        Returns:
            帖子详情
        """
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT p.id, p.content, p.audio_url, p.dialect_tag, 
                           p.likes_count, p.comments_count, p.views_count,
                           p.user_id, p.created_at, p.updated_at, p.is_deleted
                    FROM posts p
                    WHERE p.id = %s AND p.is_deleted = FALSE
                """, (post_id,))
                
                result = cur.fetchone()
                if not result:
                    return None
                
                # 增加浏览量
                cur.execute("""
                    UPDATE posts SET views_count = views_count + 1 WHERE id = %s
                """, (post_id,))
                conn.commit()
                
                # 获取作者信息
                author = PostService._get_author_info(cur, result[7])
                
                # 检查是否点赞
                is_liked = False
                if viewer_id:
                    cur.execute("""
                        SELECT 1 FROM likes WHERE user_id = %s AND post_id = %s
                    """, (viewer_id, post_id))
                    is_liked = cur.fetchone() is not None
                
                return {
                    "id": result[0],
                    "content": result[1],
                    "audio_url": result[2],
                    "dialect_tag": result[3],
                    "likes_count": result[4],
                    "comments_count": result[5],
                    "views_count": result[6] + 1,  # 返回更新后的浏览量
                    "created_at": result[8],
                    "updated_at": result[9],
                    "is_liked": is_liked,
                    "author": author
                }
        except Exception as e:
            print(f"获取帖子失败: {e}")
            return None
        finally:
            conn.close()
    
    @staticmethod
    def get_posts(page: int = 1, page_size: int = 20, dialect_tag: Optional[str] = None,
                  user_id: Optional[int] = None, viewer_id: Optional[int] = None,
                  following_only: bool = False) -> Dict[str, Any]:
        """
        获取帖子列表
        
        Args:
            page: 页码
            page_size: 每页数量
            dialect_tag: 方言标签筛选
            user_id: 用户ID筛选（获取某用户的帖子）
            viewer_id: 查看者ID（用于判断是否点赞）
            following_only: 是否仅显示关注的人的帖子
            
        Returns:
            帖子列表和分页信息
        """
        conn = get_db_connection()
        offset = (page - 1) * page_size
        
        try:
            with conn.cursor() as cur:
                # 构建查询条件
                conditions = ["p.is_deleted = FALSE"]
                params = []
                
                if dialect_tag:
                    conditions.append("p.dialect_tag = %s")
                    params.append(dialect_tag)
                
                if user_id:
                    conditions.append("p.user_id = %s")
                    params.append(user_id)
                
                if following_only and viewer_id:
                    conditions.append("p.user_id IN (SELECT following_id FROM follows WHERE follower_id = %s)")
                    params.append(viewer_id)
                
                where_clause = " AND ".join(conditions)
                
                # 获取总数
                cur.execute(f"""
                    SELECT COUNT(*) FROM posts p WHERE {where_clause}
                """, params)
                total = cur.fetchone()[0]
                
                # 获取帖子列表
                cur.execute(f"""
                    SELECT p.id, p.content, p.audio_url, p.dialect_tag,
                           p.likes_count, p.comments_count, p.views_count,
                           p.user_id, p.created_at, p.updated_at
                    FROM posts p
                    WHERE {where_clause}
                    ORDER BY p.created_at DESC
                    LIMIT %s OFFSET %s
                """, params + [page_size, offset])
                
                rows = cur.fetchall()
                posts = []
                
                for row in rows:
                    author = PostService._get_author_info(cur, row[7])
                    
                    # 检查是否点赞
                    is_liked = False
                    if viewer_id:
                        cur.execute("""
                            SELECT 1 FROM likes WHERE user_id = %s AND post_id = %s
                        """, (viewer_id, row[0]))
                        is_liked = cur.fetchone() is not None
                    
                    posts.append({
                        "id": row[0],
                        "content": row[1],
                        "audio_url": row[2],
                        "dialect_tag": row[3],
                        "likes_count": row[4],
                        "comments_count": row[5],
                        "views_count": row[6],
                        "created_at": row[8],
                        "updated_at": row[9],
                        "is_liked": is_liked,
                        "author": author
                    })
                
                return {
                    "posts": posts,
                    "total": total,
                    "page": page,
                    "page_size": page_size,
                    "has_more": offset + len(posts) < total
                }
        except Exception as e:
            print(f"获取帖子列表失败: {e}")
            return {
                "posts": [],
                "total": 0,
                "page": page,
                "page_size": page_size,
                "has_more": False
            }
        finally:
            conn.close()
    
    @staticmethod
    def delete_post(post_id: int, user_id: int) -> bool:
        """
        删除帖子（软删除）
        
        Args:
            post_id: 帖子ID
            user_id: 用户ID（验证权限）
            
        Returns:
            是否成功
        """
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                # 验证帖子所有者
                cur.execute("""
                    SELECT user_id FROM posts WHERE id = %s AND is_deleted = FALSE
                """, (post_id,))
                result = cur.fetchone()
                
                if not result or result[0] != user_id:
                    return False
                
                # 软删除
                cur.execute("""
                    UPDATE posts SET is_deleted = TRUE, updated_at = NOW()
                    WHERE id = %s
                """, (post_id,))
                conn.commit()
                return True
        except Exception as e:
            conn.rollback()
            print(f"删除帖子失败: {e}")
            return False
        finally:
            conn.close()
    
    @staticmethod
    def get_dialect_stats() -> List[Dict[str, Any]]:
        """
        获取方言标签统计
        
        Returns:
            方言标签和对应帖子数量
        """
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT dialect_tag, COUNT(*) as count
                    FROM posts
                    WHERE is_deleted = FALSE AND dialect_tag IS NOT NULL
                    GROUP BY dialect_tag
                    ORDER BY count DESC
                    LIMIT 20
                """)
                
                return [{"tag": row[0], "count": row[1]} for row in cur.fetchall()]
        except Exception as e:
            print(f"获取方言统计失败: {e}")
            return []
        finally:
            conn.close()
    
    @staticmethod
    def _get_author_info(cursor, user_id: int) -> Dict[str, Any]:
        """获取作者信息"""
        cursor.execute("""
            SELECT id, username, nickname, avatar_url, level
            FROM users WHERE id = %s
        """, (user_id,))
        user = cursor.fetchone()
        
        if user:
            return {
                "id": user[0],
                "username": user[1],
                "nickname": user[2],
                "avatar_url": user[3],
                "level": user[4] or 1,
                "level_name": get_level_name(user[4] or 1)
            }
        return {
            "id": user_id,
            "username": "未知用户",
            "nickname": None,
            "avatar_url": None,
            "level": 1,
            "level_name": "方言新手"
        }
    
    @staticmethod
    def _add_user_points(cursor, user_id: int, points: int, reason: str):
        """增加用户积分"""
        try:
            cursor.execute("""
                UPDATE users SET points = COALESCE(points, 0) + %s
                WHERE id = %s
            """, (points, user_id))
            
            # 更新用户等级
            cursor.execute("""
                UPDATE users SET level = 
                    CASE 
                        WHEN points >= 10000 THEN 6
                        WHEN points >= 5000 THEN 5
                        WHEN points >= 2000 THEN 4
                        WHEN points >= 500 THEN 3
                        WHEN points >= 100 THEN 2
                        ELSE 1
                    END
                WHERE id = %s
            """, (user_id,))
        except Exception as e:
            print(f"增加积分失败: {e}")
    
    @staticmethod
    def toggle_like(post_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """
        切换帖子点赞状态
        
        Args:
            post_id: 帖子ID
            user_id: 用户ID
            
        Returns:
            点赞状态和点赞数，如果帖子不存在返回 None
        """
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                # 检查帖子是否存在
                cur.execute("""
                    SELECT id, user_id, likes_count FROM posts 
                    WHERE id = %s AND is_deleted = FALSE
                """, (post_id,))
                post = cur.fetchone()
                
                if not post:
                    return None
                
                post_author_id = post[1]
                current_likes = post[2]
                
                # 检查是否已点赞
                cur.execute("""
                    SELECT id FROM likes 
                    WHERE user_id = %s AND post_id = %s
                """, (user_id, post_id))
                existing_like = cur.fetchone()
                
                if existing_like:
                    # 已点赞，取消点赞
                    cur.execute("""
                        DELETE FROM likes WHERE user_id = %s AND post_id = %s
                    """, (user_id, post_id))
                    
                    # 减少帖子点赞数
                    cur.execute("""
                        UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0)
                        WHERE id = %s
                        RETURNING likes_count
                    """, (post_id,))
                    new_likes = cur.fetchone()[0]
                    
                    conn.commit()
                    return {
                        "is_liked": False,
                        "likes_count": new_likes
                    }
                else:
                    # 未点赞，添加点赞
                    cur.execute("""
                        INSERT INTO likes (user_id, post_id)
                        VALUES (%s, %s)
                    """, (user_id, post_id))
                    
                    # 增加帖子点赞数
                    cur.execute("""
                        UPDATE posts SET likes_count = likes_count + 1
                        WHERE id = %s
                        RETURNING likes_count
                    """, (post_id,))
                    new_likes = cur.fetchone()[0]
                    
                    # 给帖子作者增加积分（获得点赞 +2 积分）
                    if post_author_id != user_id:
                        PostService._add_user_points(cur, post_author_id, 2, "获得点赞")
                    
                    conn.commit()
                    return {
                        "is_liked": True,
                        "likes_count": new_likes
                    }
        except Exception as e:
            conn.rollback()
            print(f"切换点赞状态失败: {e}")
            return None
        finally:
            conn.close()

