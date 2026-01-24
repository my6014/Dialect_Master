# 方言宝社区化改进计划

> 📅 创建日期：2026-01-24  
> 📝 版本：v1.0  
> 🎯 目标：将方言宝从工具型应用升级为社区型平台

---

## 📊 当前状态分析

### 已有功能
- ✅ 用户注册/登录（含邮箱验证）
- ✅ 忘记密码/重置密码
- ✅ 语音识别测试（ASR - SenseVoice）
- ✅ Dashboard 数据展示
- ✅ 响应式 UI 设计

### 缺失的社区功能
- ❌ 用户之间的互动机制
- ❌ 内容创作与分享
- ❌ 社区氛围营造
- ❌ 激励与成长体系

---

## 🚀 功能规划

### Phase 1：用户资料系统（基础层）

**预计工作量：1-2 天**

#### 1.1 用户资料扩展

| 字段 | 类型 | 说明 |
|------|------|------|
| nickname | TEXT | 昵称 |
| avatar_url | TEXT | 头像URL |
| bio | TEXT | 个人简介 |
| hometown | TEXT | 家乡 |
| dialect | TEXT | 母语方言 |
| points | INT | 积分 |
| level | INT | 用户等级 |

#### 1.2 需要开发的功能

- [ ] 个人主页 (`/user/[id]`)
- [ ] 编辑资料页 (`/settings/profile`)
- [ ] 头像上传功能
- [ ] 用户资料 API

#### 1.3 数据库变更

```sql
-- 用户表扩展
ALTER TABLE users ADD COLUMN nickname TEXT;
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN hometown TEXT;
ALTER TABLE users ADD COLUMN dialect TEXT;
ALTER TABLE users ADD COLUMN points INT DEFAULT 0;
ALTER TABLE users ADD COLUMN level INT DEFAULT 1;
ALTER TABLE users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
```

---

### Phase 2：帖子与动态系统（核心层）

**预计工作量：2-3 天**

#### 2.1 帖子功能

| 功能 | 说明 |
|------|------|
| 发布帖子 | 支持文字 + 方言录音 |
| 帖子列表 | 社区首页动态流 |
| 帖子详情 | 查看完整内容和评论 |
| 方言标签 | #粤语 #四川话 #东北话 等 |
| 删除帖子 | 作者可删除自己的帖子 |

#### 2.2 需要开发的页面

- [ ] 社区首页 (`/community`)
- [ ] 发布帖子 (`/post/create`)
- [ ] 帖子详情 (`/post/[id]`)
- [ ] 方言标签页 (`/dialect/[name]`)

#### 2.3 数据库设计

```sql
-- 帖子表
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  audio_url TEXT,                    -- 方言音频文件路径
  dialect_tag TEXT,                  -- 方言标签，如 "粤语"
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_dialect_tag ON posts(dialect_tag);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

#### 2.4 API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/posts` | GET | 获取帖子列表（分页） |
| `/api/posts` | POST | 创建新帖子 |
| `/api/posts/{id}` | GET | 获取帖子详情 |
| `/api/posts/{id}` | DELETE | 删除帖子 |
| `/api/posts/dialect/{tag}` | GET | 按方言标签筛选 |

---

### Phase 3：互动系统（点赞与评论）

**预计工作量：1-2 天**

#### 3.1 评论功能

- [ ] 发表评论（支持文字 + 语音）
- [ ] 评论列表
- [ ] 删除评论

#### 3.2 点赞功能

- [ ] 帖子点赞/取消点赞
- [ ] 评论点赞/取消点赞
- [ ] 点赞动画效果

#### 3.3 数据库设计

```sql
-- 评论表
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES posts(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  parent_id INT REFERENCES comments(id),  -- 支持回复评论
  content TEXT NOT NULL,
  audio_url TEXT,
  likes_count INT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 点赞表
CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  post_id INT REFERENCES posts(id) ON DELETE CASCADE,
  comment_id INT REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id)
);

-- 索引
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
```

#### 3.4 API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/posts/{id}/comments` | GET | 获取评论列表 |
| `/api/posts/{id}/comments` | POST | 发表评论 |
| `/api/posts/{id}/like` | POST | 点赞/取消点赞 |
| `/api/comments/{id}` | DELETE | 删除评论 |
| `/api/comments/{id}/like` | POST | 评论点赞 |

---

### Phase 4：关注系统

**预计工作量：1 天**

#### 4.1 功能列表

- [ ] 关注/取消关注用户
- [ ] 粉丝列表
- [ ] 关注列表
- [ ] 关注动态流（只看关注的人）

#### 4.2 数据库设计

```sql
-- 关注关系表
CREATE TABLE follows (
  id SERIAL PRIMARY KEY,
  follower_id INT REFERENCES users(id) ON DELETE CASCADE,
  following_id INT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- 用户表添加统计字段
ALTER TABLE users ADD COLUMN followers_count INT DEFAULT 0;
ALTER TABLE users ADD COLUMN following_count INT DEFAULT 0;

-- 索引
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
```

#### 4.3 API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/users/{id}/follow` | POST | 关注/取消关注 |
| `/api/users/{id}/followers` | GET | 获取粉丝列表 |
| `/api/users/{id}/following` | GET | 获取关注列表 |
| `/api/feed/following` | GET | 关注的人的动态 |

---

### Phase 5：通知系统

**预计工作量：1-2 天**

#### 5.1 通知类型

| 类型 | 触发场景 |
|------|----------|
| like | 有人点赞了你的帖子/评论 |
| comment | 有人评论了你的帖子 |
| reply | 有人回复了你的评论 |
| follow | 有人关注了你 |
| system | 系统公告 |

#### 5.2 功能列表

- [ ] 通知中心页面 (`/notifications`)
- [ ] 未读通知计数（小红点）
- [ ] 标记已读
- [ ] 清空通知

#### 5.3 数据库设计

```sql
-- 通知表
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,              -- like/comment/reply/follow/system
  actor_id INT REFERENCES users(id),  -- 触发者
  post_id INT REFERENCES posts(id),
  comment_id INT REFERENCES comments(id),
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

#### 5.4 API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/notifications` | GET | 获取通知列表 |
| `/api/notifications/unread-count` | GET | 未读数量 |
| `/api/notifications/{id}/read` | POST | 标记已读 |
| `/api/notifications/read-all` | POST | 全部标记已读 |

---

### Phase 6：积分与排行榜

**预计工作量：1 天**

#### 6.1 积分规则

| 行为 | 积分 | 说明 |
|------|------|------|
| 发布帖子 | +10 | 每日上限 50 |
| 发表评论 | +5 | 每日上限 30 |
| 获得点赞 | +2 | 无上限 |
| 每日签到 | +5 | 连续签到有加成 |
| 被关注 | +3 | 无上限 |

#### 6.2 等级体系

| 等级 | 名称 | 所需积分 |
|------|------|----------|
| 1 | 方言新手 | 0 |
| 2 | 方言学徒 | 100 |
| 3 | 方言爱好者 | 500 |
| 4 | 方言达人 | 2000 |
| 5 | 方言大师 | 5000 |
| 6 | 方言宗师 | 10000 |

#### 6.3 排行榜

- [ ] 周贡献榜（发帖+评论+点赞）
- [ ] 月贡献榜
- [ ] 方言达人榜（按方言分类）
- [ ] 总积分榜

#### 6.4 页面

- [ ] 排行榜页面 (`/leaderboard`)
- [ ] 个人积分详情
- [ ] 签到功能

---

## 🎨 UI/UX 设计建议

### 社区首页布局

```
┌─────────────────────────────────────────────────────┐
│  Sidebar (同现有)  │      社区动态流                 │
│                    │  ┌─────────────────────────┐    │
│  - 首页            │  │ 用户头像  昵称  时间      │    │
│  - 社区 ⭐         │  │ 帖子内容文字...          │    │
│  - 语音识别        │  │ [播放方言录音按钮]        │    │
│  - 设置            │  │ #粤语                    │    │
│                    │  │ ❤️ 128  💬 32  👁️ 1.2k  │    │
│                    │  └─────────────────────────┘    │
│                    │                                │
│                    │  ┌─────────────────────────┐    │
│                    │  │ 下一条帖子...             │    │
│                    │  └─────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### 配色方案（沿用现有）

- 主色：`#2c5f4e` (深绿)
- 强调色：`#7bdc93` (浅绿)
- 背景：`#1a1a2e` (深色模式)
- 文字：`#e2e8f0` (浅色)

---

## 🔧 技术实现要点

### 1. 文件上传

需要实现音频和头像文件的上传功能：
- 可选方案：本地存储 / 云存储（阿里云OSS、腾讯云COS）
- 音频格式：webm, wav, mp3
- 头像格式：jpg, png, webp

### 2. 实时通知（可选）

- WebSocket 实时推送
- 或使用轮询机制

### 3. 分页加载

- 帖子列表使用无限滚动
- API 支持 cursor-based 分页

### 4. 缓存策略

- 热门帖子缓存
- 用户资料缓存
- 点赞状态缓存

---

## 📋 实施检查清单

### Phase 1 - 用户资料
- [ ] 数据库表结构变更
- [ ] 用户资料 API
- [ ] 个人主页页面
- [ ] 编辑资料页面
- [ ] 头像上传功能

### Phase 2 - 帖子系统
- [ ] 帖子表创建
- [ ] 发帖 API
- [ ] 帖子列表 API（分页）
- [ ] 社区首页页面
- [ ] 发帖页面
- [ ] 帖子详情页面
- [ ] 方言标签筛选

### Phase 3 - 互动系统
- [ ] 评论表创建
- [ ] 点赞表创建
- [ ] 评论 API
- [ ] 点赞 API
- [ ] 评论区 UI 组件
- [ ] 点赞动画

### Phase 4 - 关注系统
- [ ] 关注表创建
- [ ] 关注/取消关注 API
- [ ] 粉丝/关注列表页面
- [ ] 关注动态流

### Phase 5 - 通知系统
- [ ] 通知表创建
- [ ] 通知 API
- [ ] 通知中心页面
- [ ] 未读角标

### Phase 6 - 积分排行
- [ ] 积分规则实现
- [ ] 等级计算
- [ ] 排行榜 API
- [ ] 排行榜页面
- [ ] 签到功能

---

## 🗓️ 时间估算

| 阶段 | 功能 | 预计时间 | 优先级 |
|------|------|----------|--------|
| Phase 1 | 用户资料系统 | 1-2 天 | 🔴 高 |
| Phase 2 | 帖子系统 | 2-3 天 | 🔴 高 |
| Phase 3 | 互动系统 | 1-2 天 | 🔴 高 |
| Phase 4 | 关注系统 | 1 天 | 🟡 中 |
| Phase 5 | 通知系统 | 1-2 天 | 🟡 中 |
| Phase 6 | 积分排行 | 1 天 | 🟢 低 |

**总计：7-11 天**（基础开发时间）

---

## 💡 未来扩展想法

1. **方言挑战赛** - 每周一个方言主题挑战
2. **方言词典** - 用户贡献的方言词汇库
3. **语音连麦** - 实时方言语音聊天室
4. **AI 方言导师** - AI 纠正发音
5. **方言地图** - 可视化展示各地方言分布
6. **方言故事** - 用方言讲述的民间故事

---

> 💬 如有问题或建议，请随时更新此文档
