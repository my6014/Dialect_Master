"""
密码处理工具模块
提供密码哈希和验证功能
"""
import hashlib
import secrets


def hash_password(password: str) -> str:
    """
    使用 PBKDF2 算法对密码进行哈希加密
    
    Args:
        password: 明文密码
        
    Returns:
        格式为 "salt$hash" 的加密字符串
    """
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120000)
    return f"{salt}${dk.hex()}"


def verify_password(password: str, stored: str) -> bool:
    """
    验证密码是否匹配
    
    Args:
        password: 待验证的明文密码
        stored: 存储的哈希密码（格式: "salt$hash"）
        
    Returns:
        密码是否匹配
    """
    try:
        salt, hexhash = stored.split("$", 1)
    except ValueError:
        return False
    
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120000)
    return dk.hex() == hexhash
