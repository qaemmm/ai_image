# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 📋 项目概述

AI-powered 图片处理 Web 应用，集成四大核心功能 + 支付订阅系统：

1. **图片压缩** - 客户端压缩使用 `browser-image-compression`
2. **抠图去背景** - 使用 Remove.bg API
3. **图片识别** - 使用火山引擎多模态 API
4. **AI 生图** - 使用火山引擎图像生成 API
5. **定价与支付** - Creem.io 支付集成 + 积分系统

---

## 🏗️ 技术架构

### Frontend (Vite + React)
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **路由**: React Router v6
- **样式**: Tailwind CSS
- **认证**: Supabase Auth (GitHub + Google OAuth)
- **开发地址**: http://localhost:5174

### Backend (Express)
- **服务器**: Express.js + Node.js
- **数据库**: Supabase (PostgreSQL)
- **支付**: Creem.io API
- **开发地址**: http://localhost:3001

### 页面结构
```
src/pages/
├── Home.tsx           - 主页导航
├── Login.tsx          - 登录页（GitHub/Google OAuth）
├── Compress.tsx       - 图片压缩（纯前端）
├── RemoveBg.tsx       - 抠图去背景（Remove.bg API）
├── Recognize.tsx      - 图片识别（火山引擎）
├── AIGenerate.tsx     - AI 生图（火山引擎）
├── Pricing.tsx        - 定价页面（三档方案）
├── Dashboard.tsx      - 用户仪表板（积分/订阅）
├── PaymentSuccess.tsx - 支付成功页
├── PaymentCancel.tsx  - 支付取消页
└── TestAdmin.tsx      - 测试管理页（开发用）
```

### 后端 API 端点
```javascript
// 图片处理 API
POST /api/remove-bg          // Remove.bg 代理
POST /api/recognize          // 火山引擎图片识别
POST /api/generate-image     // 火山引擎 AI 生图

// Creem 支付 API
POST /api/create-checkout    // 创建支付会话
POST /api/webhooks/creem     // Creem webhook 处理
GET  /api/products           // 获取产品列表

// 积分管理 API
POST /api/credits/deduct     // 扣除积分
POST /api/credits/add        // 添加积分

// 测试 API（开发专用）
POST /api/test/grant-subscription  // 手动授予订阅
GET  /api/test/user-credits/:userId // 查看用户积分
```

---

## 🗄️ 数据库设计

### user_subscriptions (用户订阅表)
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id VARCHAR(255) UNIQUE,
  product_id VARCHAR(255),
  plan_name VARCHAR(50),        -- 'basic', 'pro', 'max'
  interval VARCHAR(20),          -- 'month', 'year'
  status VARCHAR(50) DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### user_credits (用户积分表)
```sql
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  credits INT DEFAULT 0,
  total_earned INT DEFAULT 0,
  total_spent INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### credit_transactions (积分交易记录)
```sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INT,                    -- 正数=增加, 负数=消耗
  type VARCHAR(50),              -- 'purchase', 'compress', 'remove_bg', etc.
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## ⚙️ 开发命令

### 前端开发 (根目录)
```bash
npm run dev         # 启动 Vite dev server (http://localhost:5174)
npm run build       # TypeScript 编译 + Vite 构建生产版本
npm run preview     # 预览生产构建
npm run lint        # ESLint 代码检查
```

### 后端开发 (server 目录)
```bash
cd server
npm start           # 生产模式启动
npm run dev         # 开发模式（Node.js --watch 自动重载）
```

### 完整启动流程
**需要两个独立终端**，前后端必须同时运行：
```bash
# Terminal 1 - 启动前端
npm run dev

# Terminal 2 - 启动后端
cd server && npm run dev
```

---

## 💰 定价方案

| 方案 | 月付 | 年付 | Credits | 特点 |
|------|------|------|---------|------|
| **Basic** | $12 | $115 (20% off) | 150 | 基础功能 |
| **Pro** 🔥 | $29 | $278 (20% off) | 400 | 最受欢迎 |
| **Max** | $59 | $566 (20% off) | 1000 | 最高配额 |

### Credits 消耗规则
- 图片压缩: 1 credit/张
- 去背景: 3 credits/张
- 图片识别: 2 credits/张
- AI 生图: 5 credits/张

https://www.creem.io/test/payment/prod_4fS2iV9lNqvL8Plt0jTDbS

https://www.creem.io/test/payment/prod_2WXLA8gc9V8fEBXEWwSF7X

https://www.creem.io/test/payment/prod_2DhOx0qR8mHrfY0rhSpLC

https://www.creem.io/test/payment/prod_4BV6rfzTZBt37QapS6JPtj

https://www.creem.io/test/payment/prod_46KCugbYjZn6nN5wDiDxbO

https://www.creem.io/test/payment/prod_2cJDGzjStr2eTZgVx0xfGD

产品id都在下面了

### Creem 产品 ID
```javascript
export const CREEM_PRODUCTS = {
  basic: {
    monthly: 'prod_2cJDGzjStr2eTZgVx0xfGD',
    yearly: 'prod_46KCugbYjZn6nN5wDiDxbO',
  },
  pro: {
    monthly: 'prod_4BV6rfzTZBt37QapS6JPtj',
    yearly: 'prod_2WXLA8gc9V8fEBXEWwSF7X',
  },
  max: {
    monthly: 'prod_4fS2iV9lNqvL8Plt0jTDbS',
    yearly: 'prod_2DhOx0qR8mHrfY0rhSpLC',
  },
};
```

---

## 🔐 环境变量

`.env.local` (根目录):
```bash
# Remove.bg API
REMOVE_BG_API_KEY=your_key_here

# 火山引擎 API
ARK_API_KEY=your_key_here

# Supabase
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Creem.io Payment
CREEM_API_KEY=creem_test_xxxxx
CREEM_WEBHOOK_SECRET=whsec_xxxxx
```

**重要**: `.env.local` 已在 `.gitignore` 中，不会提交到 Git。

---

## 📊 当前开发进度

### ✅ 已完成功能

#### 阶段 0: 环境准备
- [x] Express 后端代理服务器
- [x] CORS 配置
- [x] API Keys 管理

#### 阶段 1: 图片压缩
- [x] 纯前端压缩（browser-image-compression）
- [x] 质量调节（10%-100%）
- [x] 压缩前后对比
- [x] 下载功能

#### 阶段 2: 抠图去背景
- [x] Remove.bg API 集成
- [x] Base64 图片上传
- [x] 透明背景预览（棋盘格）
- [x] 错误处理和加载状态

#### 阶段 3: 图片识别
- [x] 火山引擎多模态 API 集成
- [x] 图片内容识别
- [x] 结果展示和复制功能

#### 阶段 4: AI 生图
- [x] 火山引擎图像生成 API
- [x] Prompt 输入（支持多行）
- [x] 示例提示词
- [x] 图片下载（跨域处理）
- [x] Ctrl+Enter 快捷键

#### 阶段 5: 定价页面
- [x] 三档价格方案 UI
- [x] 月付/年付切换
- [x] "Most Popular" 标签
- [x] 响应式设计
- [x] 路由和导航集成

#### 阶段 6: Creem 支付集成（部分完成）
- [x] Creem API 凭证配置
- [x] 产品 ID 映射（creem-products.js）
- [x] 数据库设计（Supabase tables）
- [x] Webhook 处理逻辑
- [x] Dashboard 页面（显示积分/订阅）
- [x] PaymentSuccess/Cancel 页面
- [x] TestAdmin 测试页面
- [x] 积分管理 API（deduct/add）
- [x] TestAdmin 自动刷新用户信息

### 🔄 进行中

#### 阶段 6: Creem 支付集成 - 已修复 ✅
- [x] 增强调试日志
- [x] 解决 Creem API 错误（修复了 API 端点和 payload 格式）
- [ ] 完整支付流程测试（需要真实支付测试）

### 📝 待开发

- [ ] 积分扣除功能（在各功能页面集成）
- [ ] 积分不足提示和充值引导
- [ ] Webhook 本地测试（ngrok）
- [ ] 生产环境部署

---

## ⚠️ 已知问题和待解决

### ✅ Creem API 错误（已修复 - 2025-10-06）

**问题描述**:
- 在 Pricing 页面点击购买按钮后，后端调用 Creem API 创建 checkout session 失败
- Creem API 返回 `404 Not Found` 和 `500 Internal Server Error`

**错误日志**:
```
=== Creem Checkout Request ===
Plan: pro month
Product ID: prod_4BV6rfzTZBt37QapS6JPtj
Payload: {
  "product_id": "prod_4BV6rfzTZBt37QapS6JPtj",
  "success_url": "http://localhost:5174/payment/success?session_id={CHECKOUT_SESSION_ID}",
  "cancel_url": "http://localhost:5174/pricing",
  "metadata": { ... }
}
API Key present: true
API Key prefix: creem_test...

❌ Creem Checkout Error
Status: 500
Error Data: {
  "statusCode": 500,
  "timestamp": "2025-10-02T12:18:36.842Z",
  "path": "/v1/checkout/sessions"
}
```

**根本原因**:
1. **错误的 API 端点**: 使用了 `/v1/checkout/sessions`，正确的应该是 `/v1/checkouts`
2. **缺少必填字段**: 缺少 `units` 字段（产品数量）
3. **响应字段错误**: 响应中的字段是 `checkout_url` 而不是 `url`

**修复方案** (已实施):
1. ✅ 修正 API 端点为 `/v1/checkouts`（参考官方文档）
2. ✅ 添加必填字段 `units: 1`
3. ✅ 添加可选的 `customer.email` 字段用于预填充结账页面
4. ✅ 修正响应字段为 `checkout_url`
5. ✅ 移除了不必要的 `cancel_url` 字段

**修改的文件**:
- `server/index.js:163-235` - 修复了 Checkout API 实现
- `src/pages/Pricing.tsx:12-49` - 添加了用户邮箱到请求

**正确的 Payload 格式**:
```javascript
{
  product_id: "prod_xxx",
  units: 1,                    // 必填：产品数量
  success_url: "...",          // 必填：成功回调 URL
  customer: {                  // 可选：预填充客户信息
    email: "user@example.com"
  },
  metadata: {                  // 可选：自定义元数据
    user_id: "...",
    plan_id: "...",
    interval: "..."
  }
}
```

**参考文档**:
- Creem API 文档: https://docs.creem.io/api-reference/endpoint/create-checkout

**临时测试方案**（如果支付仍有问题）:
使用 **TestAdmin 页面** (`/test-admin`) 手动授予订阅和积分：
1. 访问 `http://localhost:5174/test-admin`
2. 选择计划（Basic/Pro/Max）
3. 点击 "Grant Subscription"
4. 系统直接添加 credits 到数据库
5. 在 Dashboard 查看结果

**下一步测试**:
1. ✅ 重启后端服务以应用修复
2. 🔄 在 Pricing 页面测试购买流程
3. 🔄 验证是否能成功跳转到 Creem 支付页面
4. 🔄 完成测试支付并验证 webhook 是否正确处理
5. 🔄 检查 Dashboard 中的积分和订阅状态

---

## 🎨 图片格式处理规则

**关键架构细节**：不同 API 对 base64 格式要求不同，处理时必须注意：

| API | 输入格式 | 输出格式 |
|-----|---------|---------|
| **Remove.bg** | Base64 **无前缀**（仅编码数据） | Base64 (PNG) 带前缀 |
| **火山引擎识别** | Base64 **带前缀** (`data:image/png;base64,xxx`) | JSON 文本 |
| **火山引擎生图** | 文本 prompt | 图片 URL |

**实现位置**：
- 前端图片转换：各 page 组件中的 `FileReader` + `canvas` 处理
- 后端代理转换：`server/index.js` 中对应的 API 端点

---

---

## 🔧 关键架构说明

### 认证流程
- 使用 `AuthContext` (`src/contexts/AuthContext.tsx`) 管理全局认证状态
- `ProtectedRoute` 组件包装需要登录的路由
- Supabase Auth 处理 GitHub 和 Google OAuth 登录
- 前端使用 anon key，后端使用 service role key

### 积分系统架构
- 积分配置定义在 `src/config/pricing.ts`
- 后端 API 端点处理积分扣除和添加 (`server/index.js`)
- 前端通过 `src/utils/credits.ts` 工具函数调用积分 API
- `CreditBalance` 组件显示用户当前积分

### 图片处理流程
1. **压缩** (Compress.tsx): 完全在客户端使用 `browser-image-compression`
2. **去背景** (RemoveBg.tsx): 前端转 base64 → 后端代理 Remove.bg API
3. **识别** (Recognize.tsx): 前端转 base64 (带前缀) → 后端调用火山引擎多模态 API
4. **生图** (AIGenerate.tsx): 前端发送 prompt → 后端调用火山引擎生成 API → 返回图片 URL

### 支付流程（调试中）
1. 用户在 Pricing 页面选择计划
2. 前端调用 `/api/create-checkout` 创建支付会话
3. 重定向到 Creem 支付页面
4. 支付成功后 Creem 发送 webhook 到 `/api/webhooks/creem`
5. Webhook 处理器更新数据库（订阅 + 积分）
6. 重定向到 PaymentSuccess 页面

---

## 🧪 测试指南

### 手动测试 TestAdmin 功能
1. 确保前后端都在运行
2. 访问 `http://localhost:5174/test-admin`
3. 登录任意账户
4. 选择计划并点击 "Grant Subscription"
5. 查看右侧用户信息是否更新（自动刷新）
6. 前往 Dashboard 验证积分显示

### 测试 Creem 支付流程（待修复）
1. 访问 Pricing 页面
2. 点击任意计划的 "Get Started" 按钮
3. 查看浏览器控制台和服务器日志
4. 目前会显示错误（500 错误）

### 测试各功能的积分扣除（待实现）
暂未实现，需要在各功能页面集成积分检查和扣除逻辑。
