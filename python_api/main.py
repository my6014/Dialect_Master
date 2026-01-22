"""
方言宝 (Dialect Master) - FastAPI 应用入口
集成了用户认证、语音识别等功能的后端 API
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import Config
from .routes import health_router, auth_router, asr_router

# 创建 FastAPI 应用实例
app = FastAPI(
    title="方言宝 API",
    description="方言学习与语音识别平台后端服务",
    version="1.0.0"
)

# 配置 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(asr_router)


@app.on_event("startup")
async def startup_event():
    """应用启动时的初始化操作"""
    print("🚀 方言宝 API 服务启动中...")
    print(f"📊 数据库: {Config.DB_HOST}:{Config.DB_PORT}/{Config.DB_NAME}")
    print(f"🎤 ASR 服务: {Config.PYTHON_ASR_URL}")


@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时的清理操作"""
    print("👋 方言宝 API 服务已关闭")
