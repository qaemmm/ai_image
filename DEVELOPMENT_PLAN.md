# 图片处理网站开发计划

## 项目概述
一个集成多种 AI 功能的图片处理网站，包含图片压缩、抠图去背景、图片识别和 AI 生图四大核心功能。

## 技术栈
- **前端**: React 18 + TypeScript + Vite + Tailwind CSS
- **后端**: Express.js + Node.js（API 代理服务器）
- **API 服务**:
  - Remove.bg API（去背景）
  - 火山引擎多模态 API（图片识别）
  - 火山引擎图像生成 API（AI 生图）

---

## 开发阶段

### ✅ 阶段零：环境准备（已完成）
- [x] 创建后端代理服务（Express + Node.js）
- [x] 配置 `.env.local` 存储 API Keys
  - Remove.bg API Key: `3R5g4sc8mdFN2Ztzx4giq2Wx`
  - 火山引擎 API Key: `a59df6c7-06b3-478e-a699-dd7e0a9bcd43`
- [x] 设置 CORS 和代理路由
  - `/api/remove-bg` - 去背景接口
  - `/api/recognize` - 图片识别接口
  - `/api/generate-image` - AI 生图接口
- [x] 测试后端服务器启动
- [x] Git 版本管理并推送

**后端服务器地址**: `http://localhost:3001`

---

### ✅ 阶段一：图片压缩功能
**状态**: 已完成

**实现内容**:
- 使用 `browser-image-compression` 库
- 纯前端压缩，无需调用后端 API
- 支持质量调节（10%-100%）
- 显示压缩前后对比和文件大小

**完成任务**:
1. [x] 测试图片压缩功能是否正常工作
2. [x] 验证压缩质量和下载功能
3. [x] Git commit + push

**文件路径**: `src/pages/Compress.tsx`

---

### ✅ 阶段二：抠图去背景功能
**状态**: 已完成

**实现内容**:
- 上传图片并转换为 base64
- 调用后端 `/api/remove-bg` 接口
- 显示原图和处理后对比
- 下载透明背景图片
- 完整的错误处理和加载状态

**完成任务**:
1. [x] 修改 `RemoveBg.tsx` 组件
   - 移除 `@imgly/background-removal` 依赖
   - 添加图片转 base64 功能
   - 调用后端 `/api/remove-bg` 接口
2. [x] 实现前后端数据交互
   - 前端发送 base64 图片数据（带 data URI 前缀）
   - 后端调用 Remove.bg API
   - 返回处理后的图片
3. [x] 优化 UI 和错误处理
   - 加载状态提示
   - 错误信息显示（红色提示框）
   - 透明背景棋盘格预览
4. [x] 测试完整流程
5. [x] Git commit + push

**API 请求格式**:
```bash
curl -H 'X-API-Key: 3R5g4sc8mdFN2Ztzx4giq2Wx' \
     -F 'image_file_b64=BASE64_STRING' \
     -F 'size=auto' \
     -f https://api.remove.bg/v1.0/removebg
```

**文件路径**: `src/pages/RemoveBg.tsx`

---

### 🔄 阶段三：图片识别功能
**状态**: 开发中

**需求**:
- 上传图片
- 调用火山引擎多模态 API 识别图片内容
- 显示识别结果（物体、场景、文字等）

**开发步骤**:
1. [x] 修改 `Recognize.tsx` 组件
   - 移除 `Tesseract.js` 依赖
   - 添加图片转 base64 功能（带格式前缀）
   - 调用后端 `/api/recognize` 接口
2. [x] 实现前后端数据交互
   - 前端发送 base64 图片（格式：`data:image/png;base64,xxx`）
   - 后端调用火山引擎 API（model: `ep-20251002143225-lp445`）
   - 返回 AI 识别的文字描述
3. [x] 优化 UI 展示
   - 左侧显示原图
   - 右侧显示识别结果
   - 支持复制识别文本（优化的提示方式）
4. [x] 测试完整流程并修复 API 权限问题
5. [ ] Git commit + push

**API 请求格式**:
```bash
curl --location 'https://ark.cn-beijing.volces.com/api/v3/chat/completions' \
--header 'Authorization: Bearer $ARK_API_KEY' \
--header 'Content-Type: application/json' \
--data '{
  "model": "ep-20251002143225-lp445",
  "messages": [{
    "role": "user",
    "content": [
      {"type": "image_url", "image_url": {"url": "data:image/png;base64,{base64}"}},
      {"type": "text", "text": "识别图片"}
    ]
  }]
    ]
  }]
}'
```

**文件路径**: `src/pages/Recognize.tsx`

---

### ✅ 阶段四：AI 生图功能
**状态**: 已完成

**实现内容**:
- 用户输入文字提示词（prompt）
- 调用火山引擎图像生成 API
- 显示生成的图片
- 支持下载
- 添加示例提示词和快捷键

**完成任务**:
1. [x] 修改 `AIGenerate.tsx` 组件
   - 移除 Unsplash 占位代码
   - 添加提示词输入框（支持多行文本）
   - 调用后端 `/api/generate-image` 接口
2. [x] 实现前后端数据交互
   - 前端发送用户输入的 prompt
   - 后端调用火山引擎 API
   - 返回生成图片的 URL
3. [x] 优化 UI 和功能
   - 提示词输入框（textarea）
   - 生成按钮和加载状态
   - 显示生成的图片
   - 下载功能（支持跨域图片下载）
   - 重新生成按钮
4. [x] 添加示例提示词
   - 4 个示例提示词可快速填充
   - Ctrl + Enter 快捷键生成
5. [x] 完整的错误处理
6. [ ] Git commit + push

**API 请求格式**:
```bash
curl -X POST https://ark.cn-beijing.volces.com/api/v3/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ARK_API_KEY" \
  -d '{
    "model": "ep-20251002143355-9kspk",
    "prompt": "星际穿越，黑洞，黑洞里冲出一辆快支离破碎的复古列车，抢视觉冲击力，电影大片，末日既视感，动感，对比色，oc渲染，光线追踪，动态模糊，景深，超现实主义，深蓝，画面通过细腻的丰富的色彩层次塑造主体与场景，质感真实，暗黑风背景的光影效果营造出氛围，整体兼具艺术幻想感，夸张的广角透视效果，耀光，反射，极致的光影，强引力，吞噬",
    "sequential_image_generation": "disabled",
    "response_format": "url",
    "size": "2K",
    "stream": false,
    "watermark": true
}'
```

**文件路径**: `src/pages/AIGenerate.tsx`

---

## Git 版本管理策略

每个阶段完成后都要进行版本管理：

1. **阶段零**: ✅ `feat: setup backend proxy server for API integration`
2. **阶段一**: `feat: verify and optimize image compression feature`
3. **阶段二**: `feat: integrate remove.bg API for background removal`
4. **阶段三**: `feat: integrate Volcano Engine API for image recognition`
5. **阶段四**: `feat: integrate Volcano Engine API for AI image generation`

---

## 开发注意事项

### 前后端通信
- 前端地址: `http://localhost:5179` (Vite)
- 后端地址: `http://localhost:3001` (Express)
- 后端已配置 CORS，前端可直接调用

### 图片格式处理
- **Remove.bg**: 接收 base64（无前缀），返回 PNG
- **火山引擎识别**: 接收带前缀的 base64（`data:image/png;base64,xxx`）
- **火山引擎生图**: 返回图片 URL

### 错误处理
- 所有 API 调用都要有 try-catch
- 显示友好的错误提示给用户
- 在控制台记录详细错误信息

### 环境变量安全
- `.env.local` 已在 `.gitignore` 中（`*.local`）
- API Key 不会被提交到 Git
- 生产环境需要单独配置环境变量

---

## 当前进度

- [x] 阶段零：环境准备
- [x] 阶段一：图片压缩验证
- [x] 阶段二：抠图去背景
- [x] 阶段三：图片识别
- [x] 阶段四：AI 生图

**最后更新**: 2025-10-02

---

## 阶段五：定价页面 (Pricing Page)
**状态**: 规划中

**参考设计**: [Nano Banana Pricing](https://nanobanana.ai/pricing)

**核心功能**:
- 三档价格方案展示（Basic / Pro / Max）
- 月付/年付切换（年付享受折扣）
- 每档方案包含的功能对比
- 购买按钮跳转到结账流程
- FAQ 常见问题解答

**开发阶段**:

### 5.1 设计定价方案 ✓
**任务**:
1. [x] 分析参考网站的定价结构
2. [ ] 定义三档价格方案
   - **Basic**: 个人用户，基础功能
   - **Pro**: 专业用户，所有功能 + 优先队列
   - **Max**: 企业用户，最高配额 + 专属支持
3. [ ] 设计积分系统（Credits）
   - 图片压缩: 1 credit/张
   - 去背景: 3 credits/张
   - 图片识别: 2 credits/张
   - AI 生图: 5 credits/张

**价格方案草案**:
```
Basic:
- 月付: $12/月 (150 credits)
- 年付: $144/年 → $115/年 (20% off)

Pro (Most Popular):
- 月付: $29/月 (400 credits)
- 年付: $348/年 → $278/年 (20% off)

Max:
- 月付: $59/月 (1000 credits)
- 年付: $708/年 → $566/年 (20% off)
```

### 5.2 创建 Pricing 页面 UI
**文件**: `src/pages/Pricing.tsx`

**任务**:
1. [ ] 创建定价卡片组件（PricingCard）
2. [ ] 实现月付/年付切换开关
3. [ ] 添加"Most Popular"标签
4. [ ] 功能列表展示（带图标）
5. [ ] 购买按钮（需要登录才能购买）
6. [ ] FAQ 手风琴组件
7. [ ] 响应式设计（移动端友好）

**UI 要点**:
- 使用 Tailwind CSS 实现卡片阴影和渐变效果
- Pro 方案高亮显示（边框/背景不同）
- 年付方案显示折扣徽章
- 价格数字大而醒目
- 功能列表使用 checkmark 图标

### 5.3 路由配置
**文件**: `src/App.tsx`

**任务**:
1. [ ] 添加 `/pricing` 路由
2. [ ] 在主页导航添加"定价"链接
3. [ ] 在所有页面顶部导航栏添加"定价"入口

**Git Commit**: `feat: create pricing page UI with three-tier plans`

---

## 阶段六：Creem 支付集成
**状态**: 规划中

**支付平台**: [Creem.io](https://creem.io)
**文档**: https://docs.creem.io/

**API 凭证**:
- API Key: `creem_test_3ge6060HZGZSeQth1dlWsZ`
- Webhook Secret: `whsec_3jqhPU3mkFMQHuS5m7t3RP`

### 6.1 环境变量配置
**文件**: `.env.local`

**任务**:
1. [ ] 添加 Creem API 密钥
   ```
   CREEM_API_KEY=creem_test_3ge6060HZGZSeQth1dlWsZ
   CREEM_WEBHOOK_SECRET=whsec_3jqhPU3mkFMQHuS5m7t3RP
   ```

### 6.2 后端集成 - Product 创建
**文件**: `server/index.js`

**API 文档**: https://docs.creem.io/api-reference/endpoint/create-product

**任务**:
1. [ ] 在 Creem 后台创建 3 个产品（Products）
   - Basic Plan (Monthly & Yearly)
   - Pro Plan (Monthly & Yearly)
   - Max Plan (Monthly & Yearly)
2. [ ] 保存产品 ID 到环境变量或数据库
3. [ ] 创建 `/api/products` 接口返回产品列表

**Product 数据结构**:
```javascript
{
  name: "Basic Plan - Monthly",
  description: "150 credits per month",
  price: 1200, // cents ($12.00)
  currency: "USD",
  interval: "month"
}
```

### 6.3 后端集成 - Checkout Session
**文件**: `server/index.js`

**API 文档**: https://docs.creem.io/api-reference/endpoint/create-checkout

**任务**:
1. [ ] 创建 `POST /api/create-checkout` 接口
2. [ ] 接收前端传来的产品 ID 和用户信息
3. [ ] 调用 Creem API 创建结账会话
4. [ ] 返回 checkout URL 给前端跳转

**请求示例**:
```bash
POST https://api.creem.io/v1/checkout/sessions
Headers:
  x-api-key: creem_test_3ge6060HZGZSeQth1dlWsZ
  Content-Type: application/json

Body:
{
  "product_id": "prod_xxxxx",
  "success_url": "https://yourdomain.com/payment/success",
  "cancel_url": "https://yourdomain.com/pricing"
}
```

**返回示例**:
```json
{
  "id": "cs_xxxxx",
  "url": "https://checkout.creem.io/pay/cs_xxxxx"
}
```

### 6.4 后端集成 - Webhook 处理
**文件**: `server/index.js`

**API 文档**: https://docs.creem.io/api-reference/webhooks/overview

**任务**:
1. [ ] 创建 `POST /api/webhooks/creem` 接口
2. [ ] 验证 webhook 签名（使用 CREEM_WEBHOOK_SECRET）
3. [ ] 处理支付成功事件（`payment.succeeded`）
   - 更新用户订阅状态
   - 添加积分到用户账户
4. [ ] 处理订阅取消事件（`subscription.canceled`）
5. [ ] 记录所有 webhook 事件到日志

**Webhook 事件类型**:
- `checkout.session.completed` - 结账完成
- `payment.succeeded` - 支付成功
- `subscription.created` - 订阅创建
- `subscription.canceled` - 订阅取消
- `subscription.updated` - 订阅更新

**验证签名示例**:
```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return hash === signature;
}
```

### 6.5 数据库设计
**需要的表**:

**用户订阅表 (user_subscriptions)**:
```sql
CREATE TABLE user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  subscription_id VARCHAR(255) UNIQUE,
  product_id VARCHAR(255),
  plan_name VARCHAR(50), -- 'basic', 'pro', 'max'
  interval VARCHAR(20), -- 'month', 'year'
  status VARCHAR(50), -- 'active', 'canceled', 'expired'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**用户积分表 (user_credits)**:
```sql
CREATE TABLE user_credits (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  credits INT DEFAULT 0,
  total_earned INT DEFAULT 0,
  total_spent INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**积分交易记录 (credit_transactions)**:
```sql
CREATE TABLE credit_transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  amount INT, -- 正数为增加，负数为消耗
  type VARCHAR(50), -- 'purchase', 'compress', 'remove_bg', 'recognize', 'generate'
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 6.6 前端集成 - 购买流程
**文件**: `src/pages/Pricing.tsx`

**任务**:
1. [ ] 点击购买按钮检查登录状态
2. [ ] 未登录引导到登录页面
3. [ ] 已登录调用 `/api/create-checkout` 创建结账会话
4. [ ] 跳转到 Creem 支付页面
5. [ ] 支付成功后返回到成功页面

**购买流程**:
```
用户点击"购买"
  → 检查登录状态
  → 调用后端创建 checkout session
  → 跳转到 Creem 支付页面
  → 用户完成支付
  → Creem 发送 webhook 到后端
  → 后端更新数据库
  → 用户重定向回成功页面
```

### 6.7 前端集成 - 支付结果页面
**文件**:
- `src/pages/PaymentSuccess.tsx` - 支付成功页面
- `src/pages/PaymentCancel.tsx` - 支付取消页面

**任务**:
1. [ ] 创建支付成功页面
   - 显示订阅信息
   - 显示获得的积分数量
   - 返回主页按钮
2. [ ] 创建支付取消页面
   - 提示用户支付已取消
   - 返回定价页面按钮

### 6.8 前端集成 - 积分系统显示
**文件**:
- `src/components/CreditBalance.tsx` - 积分余额组件
- `src/pages/Dashboard.tsx` - 用户仪表板

**任务**:
1. [ ] 创建积分余额显示组件
   - 显示当前积分数量
   - 显示订阅状态
   - "购买更多"按钮
2. [ ] 在所有功能页面顶部显示积分余额
3. [ ] 使用功能时扣除积分
   - 压缩: 1 credit
   - 去背景: 3 credits
   - 识别: 2 credits
   - 生图: 5 credits
4. [ ] 积分不足时提示充值

### 6.9 Git 版本管理

**阶段 5 提交**:
```
Stage 5.1: feat: design pricing tiers and credit system structure
Stage 5.2: feat: create pricing page UI with three-tier plans
Stage 5.3: feat: add pricing page routing and navigation
```

**阶段 6 提交**:
```
Stage 6.1: feat: add Creem API credentials to environment variables
Stage 6.2: feat: create products in Creem and add product list endpoint
Stage 6.3: feat: implement Creem checkout session creation endpoint
Stage 6.4: feat: implement Creem webhook handler for payment events
Stage 6.5: feat: setup database schema for subscriptions and credits
Stage 6.6: feat: integrate checkout flow in pricing page
Stage 6.7: feat: create payment success and cancel pages
Stage 6.8: feat: implement credit balance display and usage tracking
Stage 6.9: test: end-to-end testing of payment and credit system
```

---

## 当前进度

- [x] 阶段零：环境准备
- [x] 阶段一：图片压缩验证
- [x] 阶段二：抠图去背景
- [x] 阶段三：图片识别
- [x] 阶段四：AI 生图
- [ ] 阶段五：定价页面
- [ ] 阶段六：Creem 支付集成

---

## 项目总结

所有四个核心功能已开发完成：
1. ✅ **图片压缩** - 纯前端实现，使用 browser-image-compression
2. ✅ **抠图去背景** - 集成 Remove.bg API
3. ✅ **图片识别** - 集成火山引擎多模态 API (ep-20251002143225-lp445)
4. ✅ **AI 生图** - 集成火山引擎图像生成 API (ep-20251002143355-9kspk)

**进行中**:
5. 🔄 **定价页面** - 三档价格方案 + 月付/年付切换
6. 🔄 **支付集成** - Creem.io 支付系统 + Webhook + 积分管理

所有功能均包含完整的错误处理、加载状态和良好的用户体验。
