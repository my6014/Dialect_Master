"""
认证服务模块
处理用户注册和登录的业务逻辑
"""
from ..database import get_db_connection, ensure_users_table
from ..utils import hash_password, verify_password
from .email_service import EmailService


class AuthService:
    """认证服务类"""
    
    @staticmethod
    def register(username: str, password: str, email: str = None, code: str = None) -> dict:
        """
        用户注册（支持邮箱验证）
        
        Args:
            username: 用户名
            password: 密码
            email: 邮箱地址（可选，如果提供则需要验证码）
            code: 邮箱验证码（如果提供邮箱则必需）
            
        Returns:
            包含注册结果的字典
        """
        # 如果提供了邮箱，需要验证验证码
        if email:
            if not code:
                return {"error": "请输入邮箱验证码"}
            
            if not EmailService.verify_code(email, code, "register"):
                return {"error": "验证码无效或已过期"}
        
        conn = get_db_connection()
        ensure_users_table(conn)
        
        password_hash = hash_password(password)
        
        try:
            with conn.cursor() as cur:
                # 检查邮箱是否已被使用
                if email:
                    cur.execute(
                        "SELECT id FROM users WHERE email = %s",
                        (email,)
                    )
                    if cur.fetchone():
                        return {"error": "该邮箱已被注册"}
                
                # 插入新用户
                if email:
                    cur.execute(
                        """
                        INSERT INTO users (username, password_hash, email, email_verified) 
                        VALUES (%s, %s, %s, TRUE)
                        """,
                        (username.strip(), password_hash, email)
                    )
                else:
                    cur.execute(
                        "INSERT INTO users (username, password_hash) VALUES (%s, %s)",
                        (username.strip(), password_hash)
                    )
                conn.commit()
            return {"ok": True, "message": "注册成功"}
        except Exception as e:
            msg = str(e).lower()
            if "unique" in msg:
                if "email" in msg:
                    return {"error": "该邮箱已被注册"}
                return {"error": "用户名已存在"}
            return {"error": "注册失败"}
        finally:
            conn.close()
    
    @staticmethod
    def login(username: str, password: str) -> dict:
        """
        用户登录
        
        Args:
            username: 用户名
            password: 密码
            
        Returns:
            包含登录结果的字典
        """
        conn = get_db_connection()
        ensure_users_table(conn)
        
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, password_hash FROM users WHERE username = %s",
                    (username.strip(),)
                )
                row = cur.fetchone()
            
            if not row:
                return {"error": "用户不存在"}
            
            user_id, password_hash = row
            
            if not verify_password(password, password_hash):
                return {"error": "密码错误"}
            
            return {"ok": True, "message": "登录成功", "userId": user_id}
        finally:
            conn.close()
    
    @staticmethod
    def reset_password(email: str, code: str, new_password: str) -> dict:
        """
        重置密码
        
        Args:
            email: 邮箱地址
            code: 邮箱验证码
            new_password: 新密码
            
        Returns:
            包含操作结果的字典
        """
        # 验证验证码
        if not EmailService.verify_code(email, code, "reset_password"):
            return {"error": "验证码无效或已过期"}
        
        conn = get_db_connection()
        ensure_users_table(conn)
        
        try:
            with conn.cursor() as cur:
                # 检查邮箱是否存在
                cur.execute(
                    "SELECT id FROM users WHERE email = %s",
                    (email,)
                )
                row = cur.fetchone()
                
                if not row:
                    return {"error": "该邮箱未注册"}
                
                # 更新密码
                password_hash = hash_password(new_password)
                cur.execute(
                    "UPDATE users SET password_hash = %s WHERE email = %s",
                    (password_hash, email)
                )
                conn.commit()
            
            return {"ok": True, "message": "密码重置成功，请使用新密码登录"}
        except Exception as e:
            return {"error": f"重置密码失败: {str(e)}"}
        finally:
            conn.close()

