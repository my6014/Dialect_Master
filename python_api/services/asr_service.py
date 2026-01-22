"""
ASR 服务模块
处理语音识别相关的业务逻辑
"""
from typing import Optional
import requests
from ..config import Config


class ASRService:
    """ASR 服务类"""
    
    @staticmethod
    async def process_audio(
        file_content: bytes,
        filename: str,
        content_type: str,
        lang: str = "auto",
        keys: Optional[str] = None
    ) -> dict:
        """
        处理音频文件并进行语音识别
        
        Args:
            file_content: 音频文件内容
            filename: 文件名
            content_type: 文件 MIME 类型
            lang: 语言代码（默认: auto）
            keys: 可选的关键词
            
        Returns:
            包含识别结果的字典
        """
        target_url = Config.PYTHON_ASR_URL
        
        try:
            # 准备文件和数据
            files = [
                ('files', (filename, file_content, content_type or "application/octet-stream"))
            ]
            data = {"lang": lang}
            if keys:
                data["keys"] = keys
            
            # 发送请求到 ASR 服务
            response = requests.post(target_url, files=files, data=data, timeout=30)
            
            # 尝试解析 JSON 响应
            try:
                return response.json()
            except Exception:
                return {
                    "error": "上游ASR返回无效JSON",
                    "raw": response.text
                }
        except requests.RequestException as e:
            return {
                "error": "无法连接上游ASR服务",
                "details": str(e)
            }
