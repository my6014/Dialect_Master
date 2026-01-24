"""
用户服务模块
处理用户资料的业务逻辑
"""
from typing import Optional
from ..database.connection import get_db_connection
from ..models.user import (
    UserProfile, 
    UserProfileUpdate, 
    UserPublicProfile,
    get_level_name,
    calculate_level
)


class UserService:
    """用户服务类"""
    
    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[UserProfile]:
        """
        根据用户ID获取用户资料
        
        Args:
            user_id: 用户ID
            
        Returns:
            UserProfile 或 None
        """
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, username, email, nickname, avatar_url, bio,
                           hometown, dialect, points, level, 
                           followers_count, following_count, created_at
                    FROM users
                    WHERE id = %s
                """, (user_id,))
                
                row = cur.fetchone()
                if not row:
                    return None
                
                return UserProfile(
                    id=row[0],
                    username=row[1],
                    email=row[2],
                    nickname=row[3],
                    avatar_url=row[4],
                    bio=row[5],
                    hometown=row[6],
                    dialect=row[7],
                    points=row[8] or 0,
                    level=row[9] or 1,
                    followers_count=row[10] or 0,
                    following_count=row[11] or 0,
                    created_at=row[12]
                )
        finally:
            conn.close()
    
    @staticmethod
    def get_public_profile(user_id: int, viewer_id: Optional[int] = None) -> Optional[UserPublicProfile]:
        """
        获取用户的公开资料
        
        Args:
            user_id: 要查看的用户ID
            viewer_id: 查看者的用户ID（用于判断是否关注）
            
        Returns:
            UserPublicProfile 或 None
        """
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, username, nickname, avatar_url, bio,
                           hometown, dialect, points, level,
                           followers_count, following_count, created_at
                    FROM users
                    WHERE id = %s
                """, (user_id,))
                
                row = cur.fetchone()
                if not row:
                    return None
                
                # 检查是否关注
                is_following = False
                if viewer_id and viewer_id != user_id:
                    cur.execute("""
                        SELECT 1 FROM follows 
                        WHERE follower_id = %s AND following_id = %s
                    """, (viewer_id, user_id))
                    is_following = cur.fetchone() is not None
                
                level = row[8] or 1
                
                return UserPublicProfile(
                    id=row[0],
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
                )
        finally:
            conn.close()
    
    @staticmethod
    def update_profile(user_id: int, update_data: UserProfileUpdate) -> Optional[UserProfile]:
        """
        更新用户资料
        
        Args:
            user_id: 用户ID
            update_data: 要更新的数据
            
        Returns:
            更新后的 UserProfile 或 None
        """
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                # 构建动态更新语句
                update_fields = []
                values = []
                
                if update_data.nickname is not None:
                    update_fields.append("nickname = %s")
                    values.append(update_data.nickname)
                
                if update_data.bio is not None:
                    update_fields.append("bio = %s")
                    values.append(update_data.bio)
                
                if update_data.hometown is not None:
                    update_fields.append("hometown = %s")
                    values.append(update_data.hometown)
                
                if update_data.dialect is not None:
                    update_fields.append("dialect = %s")
                    values.append(update_data.dialect)
                
                if update_data.avatar_url is not None:
                    update_fields.append("avatar_url = %s")
                    values.append(update_data.avatar_url)
                
                if not update_fields:
                    # 没有需要更新的字段
                    return UserService.get_user_by_id(user_id)
                
                # 添加更新时间
                update_fields.append("updated_at = NOW()")
                
                values.append(user_id)
                
                sql = f"""
                    UPDATE users 
                    SET {', '.join(update_fields)}
                    WHERE id = %s
                    RETURNING id
                """
                
                cur.execute(sql, values)
                result = cur.fetchone()
                
                if not result:
                    return None
                
                conn.commit()
                
                return UserService.get_user_by_id(user_id)
        finally:
            conn.close()
    
    @staticmethod
    def update_avatar(user_id: int, avatar_url: str) -> bool:
        """
        更新用户头像
        
        Args:
            user_id: 用户ID
            avatar_url: 头像URL
            
        Returns:
            是否更新成功
        """
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE users 
                    SET avatar_url = %s, updated_at = NOW()
                    WHERE id = %s
                """, (avatar_url, user_id))
                
                conn.commit()
                return cur.rowcount > 0
        finally:
            conn.close()
    
    @staticmethod
    def add_points(user_id: int, points: int) -> Optional[UserProfile]:
        """
        给用户增加积分（并自动更新等级）
        
        Args:
            user_id: 用户ID
            points: 要增加的积分数
            
        Returns:
            更新后的 UserProfile
        """
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                # 增加积分
                cur.execute("""
                    UPDATE users 
                    SET points = COALESCE(points, 0) + %s,
                        updated_at = NOW()
                    WHERE id = %s
                    RETURNING points
                """, (points, user_id))
                
                result = cur.fetchone()
                if not result:
                    return None
                
                new_points = result[0]
                new_level = calculate_level(new_points)
                
                # 更新等级
                cur.execute("""
                    UPDATE users 
                    SET level = %s
                    WHERE id = %s AND (level IS NULL OR level < %s)
                """, (new_level, user_id, new_level))
                
                conn.commit()
                
                return UserService.get_user_by_id(user_id)
        finally:
            conn.close()
    
    @staticmethod
    def search_users(query: str, limit: int = 20, offset: int = 0) -> list[UserPublicProfile]:
        """
        搜索用户（按用户名或昵称）
        
        Args:
            query: 搜索关键词
            limit: 返回数量限制
            offset: 偏移量
            
        Returns:
            用户列表
        """
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                search_pattern = f"%{query}%"
                cur.execute("""
                    SELECT id, username, nickname, avatar_url, bio,
                           hometown, dialect, points, level,
                           followers_count, following_count, created_at
                    FROM users
                    WHERE username ILIKE %s OR nickname ILIKE %s
                    ORDER BY followers_count DESC, created_at DESC
                    LIMIT %s OFFSET %s
                """, (search_pattern, search_pattern, limit, offset))
                
                users = []
                for row in cur.fetchall():
                    level = row[8] or 1
                    users.append(UserPublicProfile(
                        id=row[0],
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
                        created_at=row[11]
                    ))
                
                return users
        finally:
            conn.close()
