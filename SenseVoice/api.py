import os, re
import logging
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing_extensions import Annotated
from typing import List
from enum import Enum
import torchaudio
import torch
from model import SenseVoiceSmall
from funasr.utils.postprocess_utils import rich_transcription_postprocess
from io import BytesIO

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set torchaudio backend to ffmpeg
try:
    torchaudio.set_audio_backend("ffmpeg")
    logger.info("Successfully set torchaudio backend to ffmpeg.")
except RuntimeError as e:
    logger.error(f"Failed to set torchaudio backend to ffmpeg: {e}")

TARGET_FS = 16000

class Language(str, Enum):
    auto = "auto"
    zh = "zh"
    en = "en"
    yue = "yue"
    ja = "ja"
    ko = "ko"
    nospeech = "nospeech"

# Model loading logic
model_dir = "iic/SenseVoiceSmall"
device = os.getenv("SENSEVOICE_DEVICE", "cuda:0" if torch.cuda.is_available() else "cpu")
print(f"Loading model on {device}...")
m, kwargs = SenseVoiceSmall.from_pretrained(model=model_dir, device=device)
m.eval()

regex_tag = r"<\|.*\|>"
regex_emo = r"<\|(HAPPY|SAD|ANGRY|NEUTRAL|FEARFUL|DISGUSTED|SURPRISED)\|>"
regex_event = r"<\|(BGM|Speech|Applause|Laughter|Cry|Sneeze|Breath|Cough)\|>"

app = FastAPI(title="SenseVoice API Service")

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <html>
        <head><title>SenseVoice API</title></head>
        <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f0f2f5;">
            <h1>SenseVoice API 运行中</h1>
            <p>这是一个专门为语音理解任务设计的接口 (ASR/SER/AED)</p>
            <a href="/docs" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">查看接口文档</a>
        </body>
    </html>
    """

@app.post("/api/v1/asr")
async def turn_audio_to_text(
    files: Annotated[List[UploadFile], File(description="音频文件 (16KHz 效果最佳)")],
    keys: Annotated[str, Form(description="音频标识，用逗号分隔")] = None,
    lang: Annotated[Language, Form(description="语音内容语言")] = "auto",
):
    audios = []
    for file in files:
        logger.info(f"Processing file: {file.filename}, content_type: {file.content_type}")
        try:
            file_content = await file.read()
            file_io = BytesIO(file_content)
            logger.info(f"File header (first 16 bytes): {file_content[:16].hex()}")
            data_or_path_or_list, audio_fs = torchaudio.load(file_io)
        except Exception as e:
            logger.error(f"Error processing file {file.filename}: {e}", exc_info=True)
            raise HTTPException(status_code=400, detail=f"无法读取音频文件 {file.filename}: {e}")

        # transform to target sample frequency
        if audio_fs != TARGET_FS:
            resampler = torchaudio.transforms.Resample(orig_freq=audio_fs, new_freq=TARGET_FS)
            data_or_path_or_list = resampler(data_or_path_or_list)

        # convert to mono
        if data_or_path_or_list.shape[0] > 1:
            data_or_path_or_list = data_or_path_or_list.mean(0, keepdim=True)
        
        audios.append(data_or_path_or_list[0])

    if not keys:
        key = [f.filename for f in files]
    else:
        key = keys.split(",")

    res = m.inference(
        data_in=audios,
        language=lang,
        use_itn=True,
        ban_emo_unk=False,
        key=key,
        fs=TARGET_FS,
        **kwargs,
    )

    if len(res) == 0:
        return {"result": []}

    formatted_results = []
    for it in res[0]:
        raw_text = it["text"]
        # Extract metadata
        emotions = re.findall(regex_emo, raw_text)
        events = re.findall(regex_event, raw_text)
        
        # Clean text
        clean_text = re.sub(regex_tag, "", raw_text).strip()
        rich_text = rich_transcription_postprocess(it["text"])
        
        formatted_results.append({
            "key": it.get("key", "unknown"),
            "text": rich_text,
            "clean_text": clean_text,
            "emotions": emotions,
            "events": events,
            "raw": raw_text
        })

    return {"result": formatted_results}


if __name__ == "__main__":
    import uvicorn
    # Use 50000 port by default as requested
    uvicorn.run(app, host="127.0.0.1", port=50000)
