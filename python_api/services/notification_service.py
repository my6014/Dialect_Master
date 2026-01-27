"""
通知服务模块
处理通知相关的业务逻辑
"""
from typing import Optional, List, Dict, Any
from ..database.connection import get_db_connection
from ..models.notification import Notification
from ..models.user import UserPublicProfile, get_level_name

class NotificationService:
    """通知服务类"""

    @staticmethod
    def create_notification(
        user_id: int,
        type: str,
        actor_id: Optional[int] = None,
        post_id: Optional[int] = None,
        comment_id: Optional[int] = None,
        content: Optional[str] = None
    ) -> Optional[int]:
        """
        创建通知
        
        Args:
            user_id: 接收通知的用户ID
            type: 通知类型 (like, comment, reply, follow, system)
            actor_id: 触发行为的用户ID
            post_id: 关联的帖子ID
            comment_id: 关联的评论ID
            content: 通知内容
        """
        if actor_id and user_id == actor_id:
            # 不给自己发通知
            return None

        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO notifications 
                    (user_id, type, actor_id, post_id, comment_id, content)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (user_id, type, actor_id, post_id, comment_id, content))
                notification_id = cur.fetchone()[0]
                conn.commit()
                return notification_id
        except Exception as e:
            print(f"创建通知失败: {e}")
            return None
        finally:
            conn.close()

    @staticmethod
    def get_notifications(user_id: int, page: int = 1, size: int = 20) -> Dict[str, Any]:
        """获取通知列表"""
        conn = get_db_connection()
        offset = (page - 1) * size
        
        try:
            with conn.cursor() as cur:
                # 获取总数
                cur.execute("SELECT COUNT(*) FROM notifications WHERE user_id = %s", (user_id,))
                total = cur.fetchone()[0]
                
                # 获取列表 (LEFT JOIN users to get actor info)
                cur.execute("""
                    SELECT n.id, n.user_id, n.type, n.actor_id, n.post_id, n.comment_id, 
                           n.content, n.is_read, n.created_at,
                           u.id, u.username, u.nickname, u.avatar_url, u.bio,
                           u.hometown, u.dialect, u.points, u.level
                    FROM notifications n
                    LEFT JOIN users u ON n.actor_id = u.id
                    WHERE n.user_id = %s
                    ORDER BY n.created_at DESC
                    LIMIT %s OFFSET %s
                """, (user_id, size, offset))
                
                items = []
                for row in cur.fetchall():
                    # Build Notification Model
                    actor = None
                    if row[9]: # actor_id exists
                        level = row[17] or 1
                        actor = UserPublicProfile(
                            id=row[9],
                            username=row[10],
                            nickname=row[11],
                            avatar_url=row[12],
                            bio=row[13],
                            hometown=row[14],
                            dialect=row[15],
                            points=row[16] or 0,
                            level=level,
                            level_name=get_level_name(level),
                            # For notifications, we don't strictly need accurate counts, 0 is fine
                            followers_count=0, 
                            following_count=0,
                            is_following=False 
                        )
                    
                    notification = Notification(
                        id=row[0],
                        user_id=row[1],
                        type=row[2],
                        actor_id=row[3],
                        post_id=row[4],
                        comment_id=row[5],
                        content=row[6],
                        is_read=row[7],
                        created_at=row[8],
                        actor=actor
                    )
                    items.append(notification)
                
                return {
                    "items": items,
                    "total": total,
                    "page": page,
                    "size": size
                }
        finally:
            conn.close()

    @staticmethod
    def get_unread_count(user_id: int) -> int:
        """获取未读通知数量"""
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT COUNT(*) FROM notifications 
                    WHERE user_id = %s AND is_read = FALSE
                """, (user_id,))
                return cur.fetchone()[0]
        finally:
            conn.close()

    @staticmethod
    def mark_as_read(notification_id: int, user_id: int) -> bool:
        """标记单条通知为已读"""
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE notifications 
                    SET is_read = TRUE 
                    WHERE id = %s AND user_id = %s
                """, (notification_id, user_id))
                conn.commit()
                return cur.rowcount > 0
        finally:
            conn.close()

    @staticmethod
    def mark_all_as_read(user_id: int) -> int:
        """标记所有通知为已读"""
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE notifications 
                    SET is_read = TRUE 
                    WHERE user_id = %s AND is_read = FALSE
                """, (user_id,))
                conn.commit()
                return cur.rowcount
        finally:
            conn.close()
