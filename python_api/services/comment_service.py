"""
评论服务模块
处理评论相关的业务逻辑
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..database.connection import get_db_connection
from ..models.user import get_level_name


class CommentService:
    """评论服务类"""

    @staticmethod
    def create_comment(post_id: int, user_id: int, content: str, 
                       parent_id: Optional[int] = None,
                       audio_url: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        创建新评论
        
        Args:
            post_id: 帖子ID
            user_id: 用户ID
            content: 评论内容
            parent_id: 父评论ID（回复评论时使用）
            audio_url: 语音评论URL
            
        Returns:
            创建的评论信息
        """
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                # 验证帖子存在
                cur.execute("""
                    SELECT id, user_id FROM posts 
                    WHERE id = %s AND is_deleted = FALSE
                """, (post_id,))
                post = cur.fetchone()
                if not post:
                    return None
                
                post_author_id = post[1]
                
                # 如果是回复评论，验证父评论存在
                if parent_id:
                    cur.execute("""
                        SELECT id, user_id FROM comments 
                        WHERE id = %s AND post_id = %s AND is_deleted = FALSE
                    """, (parent_id, post_id))
                    parent_comment = cur.fetchone()
                    if not parent_comment:
                        return None
                    parent_author_id = parent_comment[1]
                
                # 插入评论
                cur.execute("""
                    INSERT INTO comments (post_id, user_id, parent_id, content, audio_url, created_at)
                    VALUES (%s, %s, %s, %s, %s, NOW())
                    RETURNING id, created_at
                """, (post_id, user_id, parent_id, content, audio_url))
                
                result = cur.fetchone()
                comment_id = result[0]
                created_at = result[1]
                
                # 更新帖子评论数
                cur.execute("""
                    UPDATE posts 
                    SET comments_count = comments_count + 1,
                        updated_at = NOW()
                    WHERE id = %s
                """, (post_id,))
                
                # 增加用户积分（发表评论 +5）
                CommentService._add_user_points(cur, user_id, 5, "发表评论")
                
                # 获取作者信息
                author_info = CommentService._get_author_info(cur, user_id)
                
                conn.commit()
                
                # 发送通知
                try:
                    from .notification_service import NotificationService
                    if parent_id:
                        # 回复通知
                        # parent_author_id captured above
                        if parent_author_id != user_id:
                            NotificationService.create_notification(
                                user_id=parent_author_id,
                                type="reply",
                                actor_id=user_id,
                                post_id=post_id,
                                comment_id=comment_id,
                                content="回复了你的评论"
                            )
                    else:
                        # 评论帖子通知
                        if post_author_id != user_id:
                            NotificationService.create_notification(
                                user_id=post_author_id,
                                type="comment",
                                actor_id=user_id,
                                post_id=post_id,
                                comment_id=comment_id,
                                content="评论了你的帖子"
                            )
                except Exception as e:
                    print(f"Notification error: {e}")
                
                return {
                    "id": comment_id,
                    "post_id": post_id,
                    "user_id": user_id,
                    "parent_id": parent_id,
                    "content": content,
                    "audio_url": audio_url,
                    "likes_count": 0,
                    "is_liked": False,
                    "is_deleted": False,
                    "author": author_info,
                    "created_at": created_at,
                    "replies": [],
                    "reply_count": 0
                }
                
        except Exception as e:
            conn.rollback()
            print(f"创建评论失败: {e}")
            return None
        finally:
            conn.close()

    @staticmethod
    def get_comments(post_id: int, page: int = 1, page_size: int = 20,
                     viewer_id: Optional[int] = None) -> Dict[str, Any]:
        """
        获取帖子的评论列表
        
        Args:
            post_id: 帖子ID
            page: 页码
            page_size: 每页数量
            viewer_id: 查看者ID（用于判断是否点赞）
            
        Returns:
            评论列表和分页信息
        """
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                offset = (page - 1) * page_size
                
                # 获取顶级评论（parent_id IS NULL）
                cur.execute("""
                    SELECT c.id, c.post_id, c.user_id, c.parent_id, c.content, 
                           c.audio_url, c.likes_count, c.is_deleted, c.created_at,
                           u.username, u.nickname, u.avatar_url, u.level,
                           (SELECT COUNT(*) FROM comments WHERE parent_id = c.id AND is_deleted = FALSE) as reply_count
                    FROM comments c
                    JOIN users u ON c.user_id = u.id
                    WHERE c.post_id = %s AND c.parent_id IS NULL AND c.is_deleted = FALSE
                    ORDER BY c.created_at DESC
                    LIMIT %s OFFSET %s
                """, (post_id, page_size, offset))
                
                rows = cur.fetchall()
                
                # 获取总评论数（包括回复）
                cur.execute("""
                    SELECT COUNT(*) FROM comments 
                    WHERE post_id = %s AND is_deleted = FALSE
                """, (post_id,))
                total = cur.fetchone()[0]
                
                # 获取顶级评论总数
                cur.execute("""
                    SELECT COUNT(*) FROM comments 
                    WHERE post_id = %s AND parent_id IS NULL AND is_deleted = FALSE
                """, (post_id,))
                top_level_total = cur.fetchone()[0]
                
                comments = []
                for row in rows:
                    comment_id = row[0]
                    
                    # 检查是否点赞
                    is_liked = False
                    if viewer_id:
                        cur.execute("""
                            SELECT 1 FROM likes 
                            WHERE user_id = %s AND comment_id = %s
                        """, (viewer_id, comment_id))
                        is_liked = cur.fetchone() is not None
                    
                    # 获取最近的回复（最多3条）
                    cur.execute("""
                        SELECT c.id, c.post_id, c.user_id, c.parent_id, c.content, 
                               c.audio_url, c.likes_count, c.is_deleted, c.created_at,
                               u.username, u.nickname, u.avatar_url, u.level
                        FROM comments c
                        JOIN users u ON c.user_id = u.id
                        WHERE c.parent_id = %s AND c.is_deleted = FALSE
                        ORDER BY c.created_at ASC
                        LIMIT 3
                    """, (comment_id,))
                    reply_rows = cur.fetchall()
                    
                    replies = []
                    for reply_row in reply_rows:
                        reply_is_liked = False
                        if viewer_id:
                            cur.execute("""
                                SELECT 1 FROM likes 
                                WHERE user_id = %s AND comment_id = %s
                            """, (viewer_id, reply_row[0]))
                            reply_is_liked = cur.fetchone() is not None
                        
                        replies.append({
                            "id": reply_row[0],
                            "post_id": reply_row[1],
                            "user_id": reply_row[2],
                            "parent_id": reply_row[3],
                            "content": reply_row[4],
                            "audio_url": reply_row[5],
                            "likes_count": reply_row[6],
                            "is_liked": reply_is_liked,
                            "is_deleted": reply_row[7],
                            "author": {
                                "id": reply_row[2],
                                "username": reply_row[9],
                                "nickname": reply_row[10],
                                "avatar_url": reply_row[11],
                                "level": reply_row[12],
                                "level_name": get_level_name(reply_row[12])
                            },
                            "created_at": reply_row[8],
                            "replies": [],
                            "reply_count": 0
                        })
                    
                    comments.append({
                        "id": comment_id,
                        "post_id": row[1],
                        "user_id": row[2],
                        "parent_id": row[3],
                        "content": row[4],
                        "audio_url": row[5],
                        "likes_count": row[6],
                        "is_liked": is_liked,
                        "is_deleted": row[7],
                        "author": {
                            "id": row[2],
                            "username": row[9],
                            "nickname": row[10],
                            "avatar_url": row[11],
                            "level": row[12],
                            "level_name": get_level_name(row[12])
                        },
                        "created_at": row[8],
                        "replies": replies,
                        "reply_count": row[13]
                    })
                
                has_more = (page * page_size) < top_level_total
                
                return {
                    "comments": comments,
                    "total": total,
                    "page": page,
                    "page_size": page_size,
                    "has_more": has_more
                }
                
        finally:
            conn.close()

    @staticmethod
    def get_comment_replies(comment_id: int, page: int = 1, page_size: int = 20,
                           viewer_id: Optional[int] = None) -> Dict[str, Any]:
        """
        获取评论的回复列表
        
        Args:
            comment_id: 评论ID
            page: 页码
            page_size: 每页数量
            viewer_id: 查看者ID
            
        Returns:
            回复列表和分页信息
        """
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                offset = (page - 1) * page_size
                
                # 获取回复
                cur.execute("""
                    SELECT c.id, c.post_id, c.user_id, c.parent_id, c.content, 
                           c.audio_url, c.likes_count, c.is_deleted, c.created_at,
                           u.username, u.nickname, u.avatar_url, u.level
                    FROM comments c
                    JOIN users u ON c.user_id = u.id
                    WHERE c.parent_id = %s AND c.is_deleted = FALSE
                    ORDER BY c.created_at ASC
                    LIMIT %s OFFSET %s
                """, (comment_id, page_size, offset))
                
                rows = cur.fetchall()
                
                # 获取总回复数
                cur.execute("""
                    SELECT COUNT(*) FROM comments 
                    WHERE parent_id = %s AND is_deleted = FALSE
                """, (comment_id,))
                total = cur.fetchone()[0]
                
                replies = []
                for row in rows:
                    is_liked = False
                    if viewer_id:
                        cur.execute("""
                            SELECT 1 FROM likes 
                            WHERE user_id = %s AND comment_id = %s
                        """, (viewer_id, row[0]))
                        is_liked = cur.fetchone() is not None
                    
                    replies.append({
                        "id": row[0],
                        "post_id": row[1],
                        "user_id": row[2],
                        "parent_id": row[3],
                        "content": row[4],
                        "audio_url": row[5],
                        "likes_count": row[6],
                        "is_liked": is_liked,
                        "is_deleted": row[7],
                        "author": {
                            "id": row[2],
                            "username": row[9],
                            "nickname": row[10],
                            "avatar_url": row[11],
                            "level": row[12],
                            "level_name": get_level_name(row[12])
                        },
                        "created_at": row[8],
                        "replies": [],
                        "reply_count": 0
                    })
                
                has_more = (page * page_size) < total
                
                return {
                    "comments": replies,
                    "total": total,
                    "page": page,
                    "page_size": page_size,
                    "has_more": has_more
                }
                
        finally:
            conn.close()

    @staticmethod
    def delete_comment(comment_id: int, user_id: int) -> bool:
        """
        删除评论（软删除）
        
        Args:
            comment_id: 评论ID
            user_id: 用户ID（验证权限）
            
        Returns:
            是否成功
        """
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                # 验证评论存在且属于该用户
                cur.execute("""
                    SELECT post_id FROM comments 
                    WHERE id = %s AND user_id = %s AND is_deleted = FALSE
                """, (comment_id, user_id))
                result = cur.fetchone()
                
                if not result:
                    return False
                
                post_id = result[0]
                
                # 软删除评论
                cur.execute("""
                    UPDATE comments 
                    SET is_deleted = TRUE, content = '[已删除]'
                    WHERE id = %s
                """, (comment_id,))
                
                # 更新帖子评论数
                cur.execute("""
                    UPDATE posts 
                    SET comments_count = GREATEST(0, comments_count - 1),
                        updated_at = NOW()
                    WHERE id = %s
                """, (post_id,))
                
                conn.commit()
                return True
                
        except Exception as e:
            conn.rollback()
            print(f"删除评论失败: {e}")
            return False
        finally:
            conn.close()

    @staticmethod
    def toggle_comment_like(comment_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """
        切换评论点赞状态
        
        Args:
            comment_id: 评论ID
            user_id: 用户ID
            
        Returns:
            点赞状态和点赞数，如果评论不存在返回 None
        """
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                # 验证评论存在
                cur.execute("""
                    SELECT id, likes_count, user_id, post_id FROM comments 
                    WHERE id = %s AND is_deleted = FALSE
                """, (comment_id,))
                result = cur.fetchone()
                
                if not result:
                    return None
                
                comment_author_id = result[2]
                post_id = result[3]
                
                # 检查是否已点赞
                cur.execute("""
                    SELECT id FROM likes 
                    WHERE user_id = %s AND comment_id = %s
                """, (user_id, comment_id))
                existing_like = cur.fetchone()
                
                if existing_like:
                    # 取消点赞
                    cur.execute("""
                        DELETE FROM likes 
                        WHERE user_id = %s AND comment_id = %s
                    """, (user_id, comment_id))
                    
                    cur.execute("""
                        UPDATE comments 
                        SET likes_count = GREATEST(0, likes_count - 1)
                        WHERE id = %s
                        RETURNING likes_count
                    """, (comment_id,))
                    
                    new_count = cur.fetchone()[0]
                    is_liked = False
                else:
                    # 添加点赞
                    cur.execute("""
                        INSERT INTO likes (user_id, comment_id, created_at)
                        VALUES (%s, %s, NOW())
                    """, (user_id, comment_id))
                    
                    cur.execute("""
                        UPDATE comments 
                        SET likes_count = likes_count + 1
                        WHERE id = %s
                        RETURNING likes_count
                    """, (comment_id,))
                    
                    new_count = cur.fetchone()[0]
                    is_liked = True
                    
                    # 给评论作者加积分（获得点赞 +2）
                    if comment_author_id != user_id:
                        CommentService._add_user_points(cur, comment_author_id, 2, "评论获得点赞")
                
                conn.commit()
                
                # 发送通知
                if is_liked and comment_author_id != user_id:
                     try:
                        from .notification_service import NotificationService
                        NotificationService.create_notification(
                            user_id=comment_author_id,
                            type="like",
                            actor_id=user_id,
                            post_id=post_id,
                            comment_id=comment_id,
                            content="点赞了你的评论"
                        )
                     except Exception as e:
                        print(f"Notification error: {e}")

                return {
                    "is_liked": is_liked,
                    "likes_count": new_count
                }
                
        except Exception as e:
            conn.rollback()
            print(f"评论点赞失败: {e}")
            return None
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
        
        if not user:
            return {
                "id": user_id,
                "username": "未知用户",
                "nickname": None,
                "avatar_url": None,
                "level": 1,
                "level_name": "方言新手"
            }
        
        return {
            "id": user[0],
            "username": user[1],
            "nickname": user[2],
            "avatar_url": user[3],
            "level": user[4] or 1,
            "level_name": get_level_name(user[4] or 1)
        }

    @staticmethod
    def _add_user_points(cursor, user_id: int, points: int, reason: str):
        """增加用户积分"""
        cursor.execute("""
            UPDATE users 
            SET points = COALESCE(points, 0) + %s,
                updated_at = NOW()
            WHERE id = %s
        """, (points, user_id))
        
        # 检查是否需要升级
        cursor.execute("""
            SELECT points FROM users WHERE id = %s
        """, (user_id,))
        result = cursor.fetchone()
        if result:
            total_points = result[0] or 0
            new_level = CommentService._calculate_level(total_points)
            cursor.execute("""
                UPDATE users SET level = %s WHERE id = %s
            """, (new_level, user_id))

    @staticmethod
    def _calculate_level(points: int) -> int:
        """根据积分计算等级"""
        if points >= 10000:
            return 6
        elif points >= 5000:
            return 5
        elif points >= 2000:
            return 4
        elif points >= 500:
            return 3
        elif points >= 100:
            return 2
        else:
            return 1
