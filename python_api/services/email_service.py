"""
邮件服务模块
处理邮件发送和验证码相关逻辑
"""
import random
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header
from email.utils import formataddr
from datetime import datetime, timedelta, timezone
from ..config import Config
from ..database import get_db_connection, ensure_verification_codes_table


class EmailService:
    """邮件服务类"""
    
    @staticmethod
    def generate_code(length: int = 6) -> str:
        """
        生成随机验证码
        
        Args:
            length: 验证码长度，默认6位
            
        Returns:
            随机数字验证码
        """
        return ''.join(random.choices(string.digits, k=length))
    
    @staticmethod
    def send_email(to_email: str, subject: str, html_content: str) -> bool:
        """
        发送邮件
        
        Args:
            to_email: 收件人邮箱
            subject: 邮件主题
            html_content: HTML 邮件内容
            
        Returns:
            是否发送成功
        """
        if not Config.SMTP_USER or not Config.SMTP_PASSWORD:
            raise RuntimeError("SMTP 配置缺失，请在 .env.local 中配置 SMTP_USER 和 SMTP_PASSWORD")
        
        try:
            # 创建邮件
            msg = MIMEMultipart('alternative')
            msg['Subject'] = Header(subject, 'utf-8')
            
            # 按照 QQ 邮箱 RFC2047 标准编码中文发件人名称
            # 格式: "=?UTF-8?B?base64编码的昵称?=" <邮箱地址>
            import base64
            nickname_bytes = Config.SMTP_FROM_NAME.encode('utf-8')
            nickname_b64 = base64.b64encode(nickname_bytes).decode('ascii')
            from_header = f'"=?UTF-8?B?{nickname_b64}?=" <{Config.SMTP_USER}>'
            msg['From'] = from_header
            msg['To'] = to_email
            
            # 添加 HTML 内容
            html_part = MIMEText(html_content, 'html', 'utf-8')
            msg.attach(html_part)
            
            # 连接 SMTP 服务器并发送
            with smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT) as server:
                server.starttls()  # 启用 TLS 加密
                server.login(Config.SMTP_USER, Config.SMTP_PASSWORD)
                server.sendmail(Config.SMTP_USER, to_email, msg.as_string())
            
            return True
        except Exception as e:
            print(f"发送邮件失败: {e}")
            return False
    
    @classmethod
    def send_verification_code(cls, email: str, purpose: str = "register") -> dict:
        """
        发送验证码邮件
        
        Args:
            email: 收件人邮箱
            purpose: 验证码用途 (register/reset_password)
            
        Returns:
            包含操作结果的字典
        """
        conn = get_db_connection()
        ensure_verification_codes_table(conn)
        
        try:
            # 检查是否频繁发送（1分钟内只能发送一次）
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT created_at FROM verification_codes 
                    WHERE email = %s AND purpose = %s 
                    ORDER BY created_at DESC LIMIT 1
                    """,
                    (email, purpose)
                )
                last_sent = cur.fetchone()
                
                if last_sent:
                    last_time = last_sent[0]
                    if last_time.tzinfo is None:
                        last_time = last_time.replace(tzinfo=timezone.utc)
                    now = datetime.now(timezone.utc)
                    if (now - last_time).total_seconds() < 60:
                        return {"error": "请稍后再试，验证码发送过于频繁"}
            
            # 生成验证码
            code = cls.generate_code()
            expires_at = datetime.now(timezone.utc) + timedelta(minutes=Config.CODE_EXPIRE_MINUTES)
            
            # 保存验证码到数据库
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO verification_codes (email, code, purpose, expires_at)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (email, code, purpose, expires_at)
                )
                conn.commit()
            
            # 根据用途生成邮件内容
            if purpose == "register":
                subject = "【方言宝】注册验证码"
                action_text = "注册账号"
            else:
                subject = "【方言宝】重置密码验证码"
                action_text = "重置密码"
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
                <div style="max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #2c5f4e 0%, #3a6b5a 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
                    <div style="padding: 30px; text-align: center;">
                        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #7bdc93 0%, rgba(123, 220, 147, 0.8) 100%); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                            <span style="font-size: 28px;">📧</span>
                        </div>
                        <h1 style="color: white; margin: 0; font-size: 24px;">方言宝</h1>
                        <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0; font-size: 14px;">方言学习平台</p>
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 16px 16px 0 0;">
                        <h2 style="color: #2c5f4e; margin: 0 0 15px; font-size: 20px;">您好！</h2>
                        <p style="color: #64748b; line-height: 1.6; margin: 0 0 20px;">
                            您正在{action_text}，请使用以下验证码完成验证：
                        </p>
                        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px dashed #7bdc93; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
                            <span style="font-size: 36px; font-weight: bold; color: #2c5f4e; letter-spacing: 8px;">{code}</span>
                        </div>
                        <p style="color: #94a3b8; font-size: 13px; margin: 20px 0 0;">
                            ⏱️ 验证码有效期为 {Config.CODE_EXPIRE_MINUTES} 分钟，请尽快使用。<br>
                            🔒 如非本人操作，请忽略此邮件。
                        </p>
                    </div>
                    <div style="background: #f8fafc; padding: 20px; text-align: center;">
                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                            © 2026 方言宝 · 传承文化，学习方言
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # 发送邮件
            if cls.send_email(email, subject, html_content):
                return {"ok": True, "message": "验证码已发送，请查收邮件"}
            else:
                return {"error": "邮件发送失败，请稍后重试"}
                
        except Exception as e:
            return {"error": f"发送验证码失败: {str(e)}"}
        finally:
            conn.close()
    
    @staticmethod
    def verify_code(email: str, code: str, purpose: str = "register") -> bool:
        """
        验证验证码
        
        Args:
            email: 邮箱地址
            code: 验证码
            purpose: 验证码用途
            
        Returns:
            验证是否成功
        """
        conn = get_db_connection()
        ensure_verification_codes_table(conn)
        
        try:
            with conn.cursor() as cur:
                # 查找有效的验证码
                cur.execute(
                    """
                    SELECT id FROM verification_codes 
                    WHERE email = %s AND code = %s AND purpose = %s 
                      AND used = FALSE AND expires_at > NOW()
                    ORDER BY created_at DESC LIMIT 1
                    """,
                    (email, code, purpose)
                )
                row = cur.fetchone()
                
                if row:
                    # 标记验证码为已使用
                    cur.execute(
                        "UPDATE verification_codes SET used = TRUE WHERE id = %s",
                        (row[0],)
                    )
                    conn.commit()
                    return True
                    
                return False
        finally:
            conn.close()
