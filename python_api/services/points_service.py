"""
积分服务模块
处理积分、等级、签到和排行榜逻辑
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..database.connection import get_db_connection
from ..models.user import get_level_name, calculate_level


class PointsService:
    """积分服务类"""
    
    # 每日积分上限配置
    DAILY_LIMITS = {
        "发布帖子": 50,
        "发表评论": 30
    }
    
    @staticmethod
    def add_points(user_id: int, points: int, reason: str) -> bool:
        """
        增加积分（带上限检查）
        
        Args:
            user_id: 用户ID
            points: 增加积分数
            reason: 原因 (发布帖子 / 发表评论 / 获得点赞 / 每日签到 / 获得关注)
        
        Returns:
            是否成功增加积分
        """
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                # 检查每日上限
                if reason in PointsService.DAILY_LIMITS:
                    limit = PointsService.DAILY_LIMITS[reason]
                    
                    # 查询今日已获积分
                    cur.execute("""
                        SELECT SUM(points) FROM points_history
                        WHERE user_id = %s AND reason = %s 
                        AND created_at >= CURRENT_DATE
                    """, (user_id, reason))
                    
                    today_points = cur.fetchone()[0] or 0
                    
                    if today_points >= limit:
                        return False
                        
                    # 如果本次增加会导致超限，只增加剩余部分
                    if today_points + points > limit:
                        points = max(0, limit - today_points)
                        if points == 0:
                            return False
                
                # 1. 记录积分流水
                cur.execute("""
                    INSERT INTO points_history (user_id, points, reason)
                    VALUES (%s, %s, %s)
                """, (user_id, points, reason))
                
                # 2. 更新用户总积分和等级
                cur.execute("""
                    UPDATE users 
                    SET points = COALESCE(points, 0) + %s,
                        updated_at = NOW()
                    WHERE id = %s
                    RETURNING points
                """, (points, user_id))
                
                result = cur.fetchone()
                if result:
                    new_points = result[0]
                    new_level = calculate_level(new_points)
                    
                    # 更新等级
                    cur.execute("""
                        UPDATE users 
                        SET level = %s
                        WHERE id = %s AND (level IS NULL OR level < %s)
                    """, (new_level, user_id, new_level))
                
                conn.commit()
                return True
        except Exception as e:
            conn.rollback()
            print(f"增加积分失败: {e}")
            return False
        finally:
            conn.close()
    
    @staticmethod
    def daily_checkin(user_id: int) -> Dict[str, Any]:
        """
        每日签到
        
        Returns:
            签到结果 {success, points, streak, message}
        """
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                # 检查今日是否已签到
                cur.execute("""
                    SELECT 1 FROM user_checkins 
                    WHERE user_id = %s AND checkin_date = CURRENT_DATE
                """, (user_id,))
                
                if cur.fetchone():
                    return {"success": False, "message": "今日已签到"}
                
                # 检查昨日签到记录以计算连续签到
                cur.execute("""
                    SELECT consecutive_days FROM user_checkins
                    WHERE user_id = %s AND checkin_date = CURRENT_DATE - INTERVAL '1 day'
                """, (user_id,))
                
                last_checkin = cur.fetchone()
                streak = (last_checkin[0] + 1) if last_checkin else 1
                
                # 计算签到积分
                base_points = 5
                bonus = 0
                
                # 连续签到奖励规则
                if streak >= 7:
                    bonus = 10
                elif streak >= 3:
                    bonus = 3
                    
                total_points = base_points + bonus
                
                # 记录签到
                cur.execute("""
                    INSERT INTO user_checkins (user_id, checkin_date, consecutive_days, points_earned)
                    VALUES (%s, CURRENT_DATE, %s, %s)
                """, (user_id, streak, total_points))
                
                conn.commit()
                
                # 增加用户积分
                PointsService.add_points(user_id, total_points, "每日签到")
                
                message = f"签到成功！积分 +{total_points}"
                if bonus > 0:
                    message += f" (含连续签到奖励 +{bonus})"
                
                return {
                    "success": True, 
                    "points": total_points, 
                    "streak": streak,
                    "message": message
                }
        except Exception as e:
            conn.rollback()
            print(f"签到失败: {e}")
            return {"success": False, "message": "签到失败，请稍后重试"}
        finally:
            conn.close()

    @staticmethod
    def get_user_status(user_id: int) -> Dict[str, Any]:
        """获取用户积分状态"""
        conn = get_db_connection()
        status = {
            "points": 0,
            "level": 1,
            "level_name": "方言新手",
            "is_checked_in": False,
            "streak_days": 0,
            "next_level_points": 100
        }
        
        try:
            with conn.cursor() as cur:
                # 获取用户基本信息
                cur.execute("SELECT points, level FROM users WHERE id = %s", (user_id,))
                user = cur.fetchone()
                if user:
                    status["points"] = user[0] or 0
                    status["level"] = user[1] or 1
                    status["level_name"] = get_level_name(status["level"])
                    
                    # 计算下一级所需积分
                    levels = {1: 0, 2: 100, 3: 500, 4: 2000, 5: 5000, 6: 10000}
                    next_level = status["level"] + 1
                    if next_level <= 6:
                        status["next_level_points"] = levels[next_level]
                    else:
                        status["next_level_points"] = None
                
                # 获取签到状态
                cur.execute("""
                    SELECT consecutive_days FROM user_checkins
                    WHERE user_id = %s AND checkin_date = CURRENT_DATE
                """, (user_id,))
                today_checkin = cur.fetchone()
                
                if today_checkin:
                    status["is_checked_in"] = True
                    status["streak_days"] = today_checkin[0]
                else:
                    # 检查昨天
                    cur.execute("""
                        SELECT consecutive_days FROM user_checkins
                        WHERE user_id = %s AND checkin_date = CURRENT_DATE - INTERVAL '1 day'
                    """, (user_id,))
                    last_checkin = cur.fetchone()
                    status["streak_days"] = last_checkin[0] if last_checkin else 0
                    
            return status
        finally:
            conn.close()

    @staticmethod
    def get_leaderboard(type: str = "total", limit: int = 50) -> List[Dict[str, Any]]:
        """
        获取排行榜
        
        Args:
            type: 类型 (total=总榜, weekly=周榜, monthly=月榜)
            limit: 数量限制
        """
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                if type == "total":
                    # 总积分榜
                    cur.execute("""
                        SELECT id, username, nickname, avatar_url, level, points
                        FROM users
                        WHERE points > 0
                        ORDER BY points DESC, created_at ASC
                        LIMIT %s
                    """, (limit,))
                    
                elif type == "weekly":
                    # 周贡献榜 (最近7天)
                    cur.execute("""
                        SELECT u.id, u.username, u.nickname, u.avatar_url, u.level, 
                               SUM(p.points) as week_points
                        FROM points_history p
                        JOIN users u ON p.user_id = u.id
                        WHERE p.created_at >= CURRENT_DATE - INTERVAL '7 days'
                        GROUP BY u.id
                        ORDER BY week_points DESC
                        LIMIT %s
                    """, (limit,))
                    
                elif type == "monthly":
                    # 月贡献榜 (最近30天)
                    cur.execute("""
                        SELECT u.id, u.username, u.nickname, u.avatar_url, u.level, 
                               SUM(p.points) as month_points
                        FROM points_history p
                        JOIN users u ON p.user_id = u.id
                        WHERE p.created_at >= CURRENT_DATE - INTERVAL '30 days'
                        GROUP BY u.id
                        ORDER BY month_points DESC
                        LIMIT %s
                    """, (limit,))
                else:
                    return []
                
                result = []
                for row in cur.fetchall():
                    level = row[4] or 1
                    result.append({
                        "id": row[0],
                        "username": row[1],
                        "nickname": row[2],
                        "avatar_url": row[3],
                        "level": level,
                        "level_name": get_level_name(level),
                        "points": row[5]
                    })
                return result
        finally:
            conn.close()
