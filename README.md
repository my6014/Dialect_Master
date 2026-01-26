# 方言宝 (Dialect Master) - 现代方言学习与语音识别原型

## 简介
这是一个集成了 Next.js 前端、Python (FastAPI) 后端以及 SenseVoice 语音识别能力的方言学习平台原型。

## 技术栈
- **前端**: Next.js 14, React, Tailwind CSS
- **后端**: Python 3.10+ (FastAPI, Uvicorn, SQLAlchemy/psycopg)
- **数据库**: PostgreSQL 14+
- **语音引擎**: SenseVoiceSmall (ASR/SER/AED)

## 目录结构

### 前端
- `pages/`: Next.js 页面 (首页、登录、注册、ASR 测试、仪表盘)
- `components/`: React 组件 (UI 组件、图表组件、侧边栏等)
- `styles/`: 样式文件

### 后端 (已重构为模块化架构 🎉)
- `python_api/`: 后端核心逻辑
  - `main.py`: FastAPI 应用入口
  - `config.py`: 配置管理
  - `models/`: 数据模型 (Pydantic schemas)
  - `routes/`: API 路由层 (health, auth, asr)
  - `services/`: 业务逻辑层 (auth_service, asr_service)
  - `database/`: 数据访问层 (数据库连接)
  - `utils/`: 工具函数 (密码处理等)
  - `.env.local`: 本地环境配置
  - `README.md`: 详细的后端文档

### AI 引擎
- `SenseVoice/`: 语音识别引擎核心 (基于 FunASR)
- `.venv/`: Python 虚拟环境 (包含所有后端及 AI 依赖)

### 文档
- `QUICK_START.md`: 快速启动指南
- `REFACTORING_REPORT.md`: API 重构报告

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
- **用户资料**: 丰富的个人资料系统，支持头像、昵称、等级成长（积分制）。
- **社区互动**: 动态广场，支持发布语音/文字帖子，点赞互动。
- **方言生态**: 支持按方言标签（如#粤语、#四川话）分类浏览和检索内容。
