# 方言宝原型（Next + PHP + PostgreSQL）

## 简介
- 前端使用 Next.js，后端为 PHP（内置服务器），数据存储使用 PostgreSQL
- 目标：快速验证注册/登录与基本接口打通

## 技术栈
- 前端：Next.js、React
- 后端：PHP 8.5（PDO + pgsql）
- 数据库：PostgreSQL 14+

## 目录结构
- pages/ 前端页面（首页、注册、登录）
- php-api/ 后端接口（hello、register、login、common）
- php.ini 项目本地 PHP 配置（开启 pdo_pgsql/pgsql 扩展）
- php-api/.env.local 本地数据库配置（仅开发环境）

## 启动步骤
1) 安装前端依赖并启动：
   - npm install
   - npm run dev
   - 前端访问 http://localhost:3000/
2) 启动后端（两种方式）：
   - 使用环境变量：
     - 设置 DB_HOST、DB_PORT、DB_NAME、DB_USER、DB_PASSWORD
     - php -S localhost:8001 -t php-api
   - 使用本地配置：
     - 确认 php.ini 位于项目根目录并启用 pdo_pgsql/pgsql
     - 设置 PHPRC 指向项目根目录后再启动后端

## 接口
- GET /hello.php 返回JSON健康信息
- POST /register.php body: {username, password}
- POST /login.php body: {username, password}

## 配置说明
- php-api/.env.local（示例）：
  - DB_HOST=localhost
  - DB_PORT=5432
  - DB_NAME=postgres
  - DB_USER=postgres
  - DB_PASSWORD=你的密码
- 优先读取 .env.local，其次读取环境变量
- 不建议把真实密码写入代码或版本库

## 验证
- 前端页面：/register 与 /login 将直接调用后端接口
- 首次注册会自动创建 users 表

