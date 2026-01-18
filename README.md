# 方言宝 (Dialect Master) - 现代方言学习与语音识别原型

## 简介
这是一个集成了 Next.js 前端、Python (FastAPI) 后端以及 SenseVoice 语音识别能力的方言学习平台原型。

## 技术栈
- **前端**: Next.js 14, React, Tailwind CSS
- **后端**: Python 3.10+ (FastAPI, Uvicorn, SQLAlchemy/psycopg)
- **数据库**: PostgreSQL 14+
- **语音引擎**: SenseVoiceSmall (ASR/SER/AED)

## 目录结构
- `pages/`: 前端 Next.js 页面 (首页、登录、注册、ASR 测试)
- `python_api/`: 后端核心逻辑 (API 接口、数据库连接)
- `SenseVoice/`: 语音识别引擎核心 (基于 FunASR)
- `.venv/`: Python 虚拟环境 (包含所有后端及 AI 依赖)
- `python_api/.env.local`: 本地环境配置文件 (数据库连接信息)

## 启动指南

### 1. 前端启动
```bash
npm install
npm run dev
# 访问地址: http://localhost:3000
```

### 2. 后端启动 (FastAPI)
```powershell
# 在根目录下执行
& ".venv/Scripts/python.exe" -m uvicorn python_api.main:app --host 0.0.0.0 --port 8000 --reload
# 访问地址: http://localhost:8000
```

### 3. ASR 引擎启动 (可选)
如果需要使用语音转文字功能，需启动 ASR 独立服务：
```powershell
# 在根目录下执行
& ".venv/Scripts/python.exe" SenseVoice/api.py
# 默认端口: 50000 (后端会自动转发请求)
```

## 配置说明
请确保在 `python_api/.env.local` 中配置正确的数据库连接：
- `DB_HOST`: 数据库地址
- `DB_PORT`: 端口 (默认 5432)
- `DB_NAME`: 数据库名
- `DB_USER`: 用户名
- `DB_PASSWORD`: 密码
- `PYTHON_ASR_URL`: 上游 ASR 服务的 URL

## 主要功能
- **用户系统**: 支持方言宝用户的注册与登录，密码采用 PBKDF2 哈希加密。
- **健康检查**: `GET /hello` 接口验证前后端连通性。
- **语音识别 (ASR)**: 通过 SenseVoice 引擎实现多语种/方言的自动转写。
