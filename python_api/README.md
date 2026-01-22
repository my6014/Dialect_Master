# Python API 项目结构说明

## 📁 目录结构

```
python_api/
├── main.py                 # FastAPI 应用入口
├── config.py               # 配置管理（环境变量加载）
├── .env.local              # 本地环境变量（不提交到 Git）
├── .env.example            # 环境变量模板
│
├── models/                 # 数据模型
│   ├── __init__.py
│   └── schemas.py          # Pydantic 模型定义
│
├── routes/                 # API 路由
│   ├── __init__.py
│   ├── health.py          # 健康检查路由
│   ├── auth.py            # 认证路由（登录/注册）
│   └── asr.py             # 语音识别路由
│
├── services/               # 业务逻辑层
│   ├── __init__.py
│   ├── auth_service.py    # 认证服务
│   └── asr_service.py     # ASR 服务
│
├── database/               # 数据库相关
│   ├── __init__.py
│   └── connection.py      # 数据库连接管理
│
└── utils/                  # 工具函数
    ├── __init__.py
    └── password.py        # 密码哈希和验证
```

## 🎯 模块说明

### 1. **main.py** - 应用入口
- 创建 FastAPI 应用实例
- 配置 CORS 中间件
- 注册所有路由
- 应用生命周期管理

### 2. **config.py** - 配置管理
- 统一管理所有环境变量
- 自动加载 `.env.local` 文件
- 配置验证

### 3. **models/** - 数据模型
- `schemas.py`: Pydantic 模型定义，用于请求/响应验证

### 4. **routes/** - 路由层
- `health.py`: 健康检查接口
- `auth.py`: 用户认证接口（注册、登录）
- `asr.py`: 语音识别接口

### 5. **services/** - 业务逻辑层
- `auth_service.py`: 处理用户认证的核心逻辑
- `asr_service.py`: 处理语音识别的核心逻辑

### 6. **database/** - 数据库层
- `connection.py`: 数据库连接管理和表结构初始化

### 7. **utils/** - 工具函数
- `password.py`: 密码加密和验证工具

## 🚀 优势

### ✅ 模块化设计
- 每个模块职责单一，易于维护
- 代码复用性高

### ✅ 分层架构
- **路由层**: 处理 HTTP 请求
- **服务层**: 处理业务逻辑
- **数据层**: 处理数据库操作

### ✅ 易于扩展
- 添加新功能只需创建新的路由和服务
- 不影响现有代码

### ✅ 易于测试
- 每个模块可以独立测试
- 业务逻辑与路由分离

## 📝 使用示例

### 添加新的 API 接口

1. **创建服务类** (`services/new_service.py`):
```python
class NewService:
    @staticmethod
    def do_something():
        # 业务逻辑
        return {"result": "success"}
```

2. **创建路由** (`routes/new_route.py`):
```python
from fastapi import APIRouter
from ..services import NewService

router = APIRouter(tags=["新功能"])

@router.get("/new-endpoint")
def new_endpoint():
    return NewService.do_something()
```

3. **注册路由** (`main.py`):
```python
from .routes import new_router
app.include_router(new_router)
```

## 🔧 配置说明

复制 `.env.example` 为 `.env.local` 并填写配置：

```bash
cp .env.example .env.local
```

必需的配置项：
- `DB_NAME`: 数据库名称
- `DB_USER`: 数据库用户名
- `DB_PASSWORD`: 数据库密码

## 🎉 重构完成

原来的 137 行 `main.py` 已经被重构为：
- **main.py**: 40 行（应用入口）
- **其他模块**: 分布在各个专门的文件中

代码更清晰、更易维护、更易扩展！
