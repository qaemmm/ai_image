# Creem API 403 Forbidden 错误诊断指南

## 🔴 当前错误

**错误代码**: 403 Forbidden  
**API 端点**: `POST https://api.creem.io/v1/checkouts`  
**API Key**: `creem_test_3ge6060HZGZSeQth1dlWsZ` (test mode)  
**产品 ID**: `prod_4BV6rfzTZBt37QapS6JPtj` (Pro Monthly)

## 🔍 403 错误的常见原因

### 1. API Key 问题 ⚠️ (最可能)

#### 检查清单：
- [ ] API Key 是否是 **Test Mode** 的 Key？
- [ ] API Key 是否有 **创建 Checkout** 的权限？
- [ ] API Key 是否已过期或被撤销？
- [ ] 是否使用了正确的 API Key（不是 Webhook Secret）？

#### 如何验证：
1. 登录 Creem Dashboard
2. 进入 **Settings** → **API Keys**
3. 确认你使用的 Key 类型：
   - ✅ **Test Secret Key** (以 `creem_test_` 开头)
   - ❌ **Test Publishable Key** (只能用于前端)
   - ❌ **Webhook Secret** (以 `whsec_` 开头)

#### 解决方案：
```bash
# 在 .env.local 中确认使用的是 Secret Key
CREEM_API_KEY=creem_test_xxxxx  # ✅ Secret Key
# 不是：
# CREEM_API_KEY=creem_pk_test_xxxxx  # ❌ Publishable Key
```

---

### 2. 产品配置问题 ⚠️

#### 检查清单：
- [ ] 产品是否已在 Creem Dashboard 中**激活/发布**？
- [ ] 产品是否设置为 **Test Mode**？
- [ ] 产品的 **Checkout 功能**是否启用？
- [ ] 产品是否有有效的**价格配置**？

#### 如何验证：
1. 登录 Creem Dashboard
2. 进入 **Products** 页面
3. 找到产品 `prod_4BV6rfzTZBt37QapS6JPtj`
4. 检查产品状态：
   - ✅ Status: **Active** 或 **Published**
   - ❌ Status: **Draft** 或 **Archived**
5. 检查产品设置：
   - ✅ **Enable Checkout**: ON
   - ✅ **Test Mode**: ON (如果使用 test API key)
   - ✅ **Price**: 已配置且有效

---

### 3. Test Mode vs Production Mode 不匹配 ⚠️

#### 问题描述：
如果你的 API Key 是 Test Mode，但产品是 Production Mode（或反之），会导致 403 错误。

#### 如何验证：
```javascript
// 检查 API Key 前缀
creem_test_xxxxx  // ✅ Test Mode Key
creem_live_xxxxx  // ✅ Production Mode Key

// 检查产品 ID 前缀
prod_xxxxx        // 通常是通用的，但需要在对应的 mode 下创建
```

#### 解决方案：
确保 API Key 和产品都在同一个 mode 下：
- **Test Mode**: 使用 `creem_test_` 开头的 Key + Test Mode 产品
- **Production Mode**: 使用 `creem_live_` 开头的 Key + Production Mode 产品

---

### 4. API 端点或 URL 问题

#### 检查清单：
- [ ] 是否使用了正确的 API 域名？
  - ✅ `https://api.creem.io` (Production)
  - ✅ `https://test-api.creem.io` (Test - 如果 Creem 提供)
  - ❌ 其他域名

#### 当前配置：
```javascript
// server/index.js:200
const response = await axios.post(
  'https://api.creem.io/v1/checkouts', // ✅ 正确
  ...
);
```

---

### 5. 账户或订阅问题

#### 可能的原因：
- Creem 账户未完成验证
- 账户被暂停或限制
- 超出了 Test Mode 的使用限额
- 需要升级账户才能使用某些功能

---

## 🛠️ 诊断步骤

### 步骤 1: 验证 API Key

在 Creem Dashboard 中创建一个**新的 Test Secret Key**：

1. 登录 Creem Dashboard
2. 进入 **Settings** → **API Keys**
3. 点击 **Create New Key**
4. 选择 **Test Mode**
5. 复制新的 Secret Key
6. 更新 `.env.local`:
   ```bash
   CREEM_API_KEY=creem_test_新的key
   ```
7. 重启后端服务

### 步骤 2: 验证产品配置

在 Creem Dashboard 中检查产品：

1. 进入 **Products** 页面
2. 找到 `prod_4BV6rfzTZBt37QapS6JPtj`
3. 确认以下设置：
   ```
   ✅ Status: Active
   ✅ Mode: Test
   ✅ Enable Checkout: ON
   ✅ Price: $29/month (或你设置的价格)
   ```
4. 如果产品状态不对，点击 **Publish** 或 **Activate**

### 步骤 3: 测试简化的请求

创建一个最简化的测试请求，排除其他因素：

```javascript
// 最简化的 payload
const minimalPayload = {
  product_id: "prod_4BV6rfzTZBt37QapS6JPtj",
  units: 1,
  success_url: "https://example.com/success"
  // 移除 customer 和 metadata
};
```

运行测试：
```bash
node test-creem-api-minimal.js
```

### 步骤 4: 检查 Creem Dashboard 日志

1. 登录 Creem Dashboard
2. 进入 **Logs** 或 **Events** 页面
3. 查找最近的 API 请求
4. 查看详细的错误信息

---

## 🔧 快速修复方案

### 方案 1: 重新创建 API Key (推荐)

```bash
# 1. 在 Creem Dashboard 创建新的 Test Secret Key
# 2. 更新 .env.local
CREEM_API_KEY=creem_test_新的key

# 3. 重启后端
cd server
npm run dev
```

### 方案 2: 重新创建产品

如果产品配置有问题，在 Creem Dashboard 中：

1. 创建一个新的测试产品
2. 设置价格和配置
3. 确保 **Enable Checkout** 开启
4. 复制新的产品 ID
5. 更新 `server/creem-products.js`:
   ```javascript
   pro: {
     monthly: 'prod_新的产品ID',
     ...
   }
   ```

### 方案 3: 联系 Creem 支持

如果以上方案都不行，可能是账户级别的问题：

1. 发送邮件到 Creem 支持: support@creem.io
2. 提供以下信息：
   - 账户邮箱
   - API Key 前缀 (不要发送完整的 Key)
   - 产品 ID
   - 错误的 trace_id (从错误响应中获取)
   - 错误截图

---

## 📋 需要你提供的信息

为了更准确地诊断问题，请提供以下信息：

### 1. Creem Dashboard 截图

请提供以下页面的截图（**注意隐藏敏感信息**）：

#### A. API Keys 页面
- 路径: Settings → API Keys
- 需要看到：
  - Key 的类型 (Test/Live)
  - Key 的权限
  - Key 的状态 (Active/Inactive)

#### B. 产品详情页面
- 路径: Products → 选择 Pro Monthly 产品
- 需要看到：
  - 产品状态 (Active/Draft/Archived)
  - Mode (Test/Production)
  - Enable Checkout 开关
  - 价格配置

#### C. Logs/Events 页面（如果有）
- 路径: Logs 或 Events
- 需要看到：
  - 最近的 API 请求记录
  - 错误详情

### 2. 完整的错误响应

请提供后端日志中的完整错误响应，特别是：
```javascript
{
  "trace_id": "...",  // ← 这个很重要
  "message": "...",
  "error": "...",
  ...
}
```

### 3. API Key 信息

请确认（**不要发送完整的 Key**）：
- API Key 前缀: `creem_test_` 还是 `creem_live_`？
- API Key 长度: 大约多少个字符？
- 是从哪个页面获取的？

---

## 🧪 临时解决方案

在等待修复的同时，你可以使用 **TestAdmin 页面**来测试其他功能：

```
1. 访问 http://localhost:5174/test-admin
2. 选择计划 (Basic/Pro/Max)
3. 点击 "Grant Subscription"
4. 系统会直接添加积分到数据库
5. 在 Dashboard 查看结果
```

这样可以先测试积分系统、Dashboard 等其他功能，不影响开发进度。

---

## 📞 下一步

请按照以上诊断步骤操作，并提供：
1. ✅ Creem Dashboard 的相关截图（隐藏敏感信息）
2. ✅ 完整的错误响应（包括 trace_id）
3. ✅ API Key 的类型确认

我会根据你提供的信息给出更精确的解决方案！

