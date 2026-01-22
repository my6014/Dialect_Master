"""
认证服务模块
处理用户注册和登录的业务逻辑
"""
from ..database import get_db_connection, ensure_users_table
from ..utils import hash_password, verify_password


class AuthService:
    """认证服务类"""
    
    @staticmethod
    def register(username: str, password: str) -> dict:
        """
        用户注册
        
        Args:
            username: 用户名
            password: 密码
            
        Returns:
            包含注册结果的字典
        """
        conn = get_db_connection()
        ensure_users_table(conn)
        
        password_hash = hash_password(password)
        
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO users (username, password_hash) VALUES (%s, %s)",
                    (username.strip(), password_hash)
                )
                conn.commit()
            return {"ok": True, "message": "注册成功"}
        except Exception as e:
            msg = str(e).lower()
            if "unique" in msg:
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
