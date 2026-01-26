"""
关注服务模块
处理关注/粉丝相关的业务逻辑
"""
from typing import Optional, List, Tuple
from ..database.connection import get_db_connection
from ..models.user import UserPublicProfile, get_level_name
from ..models.follow import FollowerListResponse, FollowingListResponse

class FollowService:
    """关注服务类"""

    @staticmethod
    def follow_user(follower_id: int, following_id: int) -> bool:
        """
        关注用户
        
        Args:
            follower_id: 发起关注的用户ID
            following_id: 被关注的用户ID
            
        Returns:
            bool: 是否成功关注（如果已经关注则返回 False）
        """
        if follower_id == following_id:
            return False

        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                # 检查是否已经关注
                cur.execute("""
                    SELECT 1 FROM follows 
                    WHERE follower_id = %s AND following_id = %s
                """, (follower_id, following_id))
                
                if cur.fetchone():
                    return False
                
                # 开始事务
                conn.execute("BEGIN")

                try:
                    # 插入关注记录
                    cur.execute("""
                        INSERT INTO follows (follower_id, following_id)
                        VALUES (%s, %s)
                    """, (follower_id, following_id))
                    
                    # 更新被关注者的粉丝数
                    cur.execute("""
                        UPDATE users 
                        SET followers_count = followers_count + 1
                        WHERE id = %s
                    """, (following_id,))
                    
                    # 更新关注者的关注数
                    cur.execute("""
                        UPDATE users 
                        SET following_count = following_count + 1
                        WHERE id = %s
                    """, (follower_id,))
                    
                    conn.commit()
                    return True
                except Exception as e:
                    conn.rollback()
                    raise e
        finally:
            conn.close()

    @staticmethod
    def unfollow_user(follower_id: int, following_id: int) -> bool:
        """
        取消关注用户
        
        Args:
            follower_id: 发起取消关注的用户ID
            following_id: 被取消关注的用户ID
            
        Returns:
            bool: 是否成功取消关注
        """
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                # 检查是否已经关注
                cur.execute("""
                    SELECT 1 FROM follows 
                    WHERE follower_id = %s AND following_id = %s
                """, (follower_id, following_id))
                
                if not cur.fetchone():
                    return False
                
                # 开始事务
                conn.execute("BEGIN")

                try:
                    # 删除关注记录
                    cur.execute("""
                        DELETE FROM follows 
                        WHERE follower_id = %s AND following_id = %s
                    """, (follower_id, following_id))
                    
                    # 更新被关注者的粉丝数
                    cur.execute("""
                        UPDATE users 
                        SET followers_count = GREATEST(followers_count - 1, 0)
                        WHERE id = %s
                    """, (following_id,))
                    
                    # 更新关注者的关注数
                    cur.execute("""
                        UPDATE users 
                        SET following_count = GREATEST(following_count - 1, 0)
                        WHERE id = %s
                    """, (follower_id,))
                    
                    conn.commit()
                    return True
                except Exception as e:
                    conn.rollback()
                    raise e
        finally:
            conn.close()

    @staticmethod
    def is_following(follower_id: int, following_id: int) -> bool:
        """检查是否关注"""
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT 1 FROM follows 
                    WHERE follower_id = %s AND following_id = %s
                """, (follower_id, following_id))
                return cur.fetchone() is not None
        finally:
            conn.close()

    @staticmethod
    def get_followers(user_id: int, page: int = 1, size: int = 20, viewer_id: Optional[int] = None) -> FollowerListResponse:
        """
        获取用户的粉丝列表
        
        Args:
            user_id: 用户ID
            page: 页码
            size: 每页数量
            viewer_id: 查看者ID（用于判断列表中的人是否被查看者关注）
        """
        conn = get_db_connection()
        offset = (page - 1) * size
        
        try:
            with conn.cursor() as cur:
                # 获取总数
                cur.execute("SELECT COUNT(*) FROM follows WHERE following_id = %s", (user_id,))
                total = cur.fetchone()[0]
                
                # 获取列表
                # Join users table to get follower details
                cur.execute("""
                    SELECT u.id, u.username, u.nickname, u.avatar_url, u.bio,
                           u.hometown, u.dialect, u.points, u.level,
                           u.followers_count, u.following_count, u.created_at
                    FROM follows f
                    JOIN users u ON f.follower_id = u.id
                    WHERE f.following_id = %s
                    ORDER BY f.created_at DESC
                    LIMIT %s OFFSET %s
                """, (user_id, size, offset))
                
                items = []
                for row in cur.fetchall():
                    current_user_id = row[0]
                    # Check if viewer follows this user
                    is_following = False
                    if viewer_id and viewer_id != current_user_id:
                        # Optimization: could use a subquery or join above, 
                        # but separate query is safer for now to avoid complexity
                        with conn.cursor() as check_cur:
                            check_cur.execute("""
                                SELECT 1 FROM follows 
                                WHERE follower_id = %s AND following_id = %s
                            """, (viewer_id, current_user_id))
                            is_following = check_cur.fetchone() is not None
                    
                    level = row[8] or 1
                    items.append(UserPublicProfile(
                        id=current_user_id,
                        username=row[1],
                        nickname=row[2],
                        avatar_url=row[3],
                        bio=row[4],
                        hometown=row[5],
                        dialect=row[6],
                        points=row[7] or 0,
                        level=level,
                        level_name=get_level_name(level),
                        followers_count=row[9] or 0,
                        following_count=row[10] or 0,
                        is_following=is_following,
                        created_at=row[11] # Follow created_at, or user created_at? 
                        # UserPublicProfile expects created_at as user creation time, but row[11] is follow time.
                        # Ideally should fetch user creation time, but follow time is useful for list sorting.
                        # Let's fetch user created_at instead to match model semantics.
                    ))
                
                # Re-querying to get user created_at correctly if needed, 
                # but UserPublicProfile created_at is optional. 
                # Let's adjust the SQL to fetch u.created_at instead of f.created_at 
                # but sort by f.created_at.
                
                return FollowerListResponse(
                    items=items,
                    total=total,
                    page=page,
                    size=size
                )
        finally:
            conn.close()

    @staticmethod
    def get_following(user_id: int, page: int = 1, size: int = 20, viewer_id: Optional[int] = None) -> FollowingListResponse:
        """
        获取用户的关注列表
        """
        conn = get_db_connection()
        offset = (page - 1) * size
        
        try:
            with conn.cursor() as cur:
                # 获取总数
                cur.execute("SELECT COUNT(*) FROM follows WHERE follower_id = %s", (user_id,))
                total = cur.fetchone()[0]
                
                # 获取列表
                cur.execute("""
                    SELECT u.id, u.username, u.nickname, u.avatar_url, u.bio,
                           u.hometown, u.dialect, u.points, u.level,
                           u.followers_count, u.following_count, u.created_at
                    FROM follows f
                    JOIN users u ON f.following_id = u.id
                    WHERE f.follower_id = %s
                    ORDER BY f.created_at DESC
                    LIMIT %s OFFSET %s
                """, (user_id, size, offset))
                
                items = []
                for row in cur.fetchall():
                    current_user_id = row[0]
                    
                    is_following = False
                    if viewer_id:
                        if viewer_id == user_id:
                            is_following = True
                        elif viewer_id != current_user_id:
                             with conn.cursor() as check_cur:
                                check_cur.execute("""
                                    SELECT 1 FROM follows 
                                    WHERE follower_id = %s AND following_id = %s
                                """, (viewer_id, current_user_id))
                                is_following = check_cur.fetchone() is not None
                    
                    level = row[8] or 1
                    items.append(UserPublicProfile(
                        id=current_user_id,
                        username=row[1],
                        nickname=row[2],
                        avatar_url=row[3],
                        bio=row[4],
                        hometown=row[5],
                        dialect=row[6],
                        points=row[7] or 0,
                        level=level,
                        level_name=get_level_name(level),
                        followers_count=row[9] or 0,
                        following_count=row[10] or 0,
                        is_following=is_following,
                        created_at=row[11]
                    ))
                
                return FollowingListResponse(
                    items=items,
                    total=total,
                    page=page,
                    size=size
                )
        finally:
            conn.close()
