import os
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg
import time
import hashlib
import secrets
import requests

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_env_local():
    paths = [
        os.path.join(os.path.dirname(__file__), ".env.local"),
        os.path.join(os.path.dirname(__file__), "..", "php-api", ".env.local"),
    ]
    for p in paths:
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    v = v.strip().strip('"').strip("'")
                    os.environ.setdefault(k.strip(), v)
            break

def db_conn():
    load_env_local()
    host = os.getenv("DB_HOST", "localhost")
    port = int(os.getenv("DB_PORT", "5432"))
    name = os.getenv("DB_NAME")
    user = os.getenv("DB_USER")
    pwd = os.getenv("DB_PASSWORD", "")
    if not name or not user:
        raise RuntimeError("数据库配置缺失")
    conn = psycopg.connect(host=host, port=port, dbname=name, user=user, password=pwd)
    return conn

def ensure_users_table(conn):
    with conn.cursor() as cur:
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
              id SERIAL PRIMARY KEY,
              username TEXT UNIQUE NOT NULL,
              password_hash TEXT NOT NULL,
              created_at TIMESTAMPTZ DEFAULT NOW()
            )
            """
        )
        conn.commit()

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120000)
    return f"{salt}${dk.hex()}"

def verify_password(password: str, stored: str) -> bool:
    try:
        salt, hexhash = stored.split("$", 1)
    except ValueError:
        return False
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120000)
    return dk.hex() == hexhash

class AuthBody(BaseModel):
    username: str
    password: str

@app.get("/hello")
def hello():
    return {"message": "你好，方言宝！", "timestamp": int(time.time())}

@app.post("/register")
def register(body: AuthBody):
    conn = db_conn()
    ensure_users_table(conn)
    h = hash_password(body.password)
    try:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO users (username, password_hash) VALUES (%s, %s)", (body.username.strip(), h))
            conn.commit()
        return {"ok": True, "message": "注册成功"}
    except Exception as e:
        msg = str(e).lower()
        if "unique" in msg:
            return {"error": "用户名已存在"}
        return {"error": "注册失败"}
    finally:
        conn.close()

@app.post("/login")
def login(body: AuthBody):
    conn = db_conn()
    ensure_users_table(conn)
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, password_hash FROM users WHERE username = %s", (body.username.strip(),))
            row = cur.fetchone()
        if not row:
            return {"error": "用户不存在"}
        user_id, password_hash = row
        if not verify_password(body.password, password_hash):
            return {"error": "密码错误"}
        return {"ok": True, "message": "登录成功", "userId": user_id}
    finally:
        conn.close()

@app.post("/sensevoice")
def sensevoice(file: UploadFile = File(...), lang: str = Form("auto"), keys: Optional[str] = Form(None)):
    load_env_local()
    target = os.getenv("PYTHON_ASR_URL", "http://127.0.0.1:50000/api/v1/asr")
    try:
        files = {"files": (file.filename, file.file, file.content_type or "application/octet-stream")}
        data = {"lang": lang}
        if keys:
            data["keys"] = keys
        r = requests.post(target, files=files, data=data, timeout=30)
        try:
            return r.json()
        except Exception:
            return {"error": "上游ASR返回无效JSON", "raw": r.text}
    except requests.RequestException as e:
        return {"error": "无法连接上游ASR服务", "details": str(e)}
