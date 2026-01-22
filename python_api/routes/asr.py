"""
ASR 路由
处理语音识别相关请求
"""
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form
from ..services import ASRService

router = APIRouter(tags=["语音识别"])


@router.post("/sensevoice")
async def sensevoice(
    file: UploadFile = File(...),
    lang: str = Form("auto"),
    keys: Optional[str] = Form(None)
):
    """
    语音识别接口
    
    Args:
        file: 上传的音频文件
        lang: 语言代码（默认: auto）
        keys: 可选的关键词
        
    Returns:
        语音识别结果
    """
    file_content = await file.read()
    
    return await ASRService.process_audio(
        file_content=file_content,
        filename=file.filename,
        content_type=file.content_type,
        lang=lang,
        keys=keys
    )
