# Creem 403 错误快速检查清单

## ⚡ 快速诊断（5分钟）

### 1️⃣ 检查 API Key 类型

在 `.env.local` 文件中，你的 API Key 是：
```
CREEM_API_KEY=creem_test_3ge6060HZGZSeQth1dlWsZ
```

✅ **正确**: 以 `creem_test_` 开头（Test Mode Secret Key）  
❌ **错误**: 如果是以下任何一种：
- `creem_pk_test_...` (Publishable Key - 只能用于前端)
- `whsec_...` (Webhook Secret - 不是 API Key)
- `creem_live_...` (Production Key - 但产品在 Test Mode)

**如何验证**:
```bash
# 运行诊断脚本
node test-creem-api-detailed.js
```

---

### 2️⃣ 检查产品状态

登录 Creem Dashboard，检查产品 `prod_4BV6rfzTZBt37QapS6JPtj`:

**必须满足的条件**:
- [ ] Status: **Active** 或 **Published** (不是 Draft/Archived)
- [ ] Mode: **Test** (与 API Key 匹配)
- [ ] Enable Checkout: **ON** (开关打开)
- [ ] Price: 已配置且有效

**如何检查**:
1. 登录 https://dashboard.creem.io
2. 进入 **Products** 页面
3. 找到 Pro Monthly 产品
4. 查看状态和设置

---

### 3️⃣ 重新创建 API Key（最快的解决方案）

如果不确定 API Key 是否有问题，最快的方法是创建一个新的：

**步骤**:
1. 登录 Creem Dashboard
2. 进入 **Settings** → **API Keys**
3. 点击 **Create New Key** 或 **Generate New Key**
4. 选择 **Test Mode**
5. 选择 **Secret Key** (不是 Publishable Key)
6. 复制新的 Key
7. 更新 `.env.local`:
   ```bash
   CREEM_API_KEY=creem_test_新的key
   ```
8. 重启后端服务:
   ```bash
   cd server
   npm run dev
   ```
9. 重新测试

---

## 🔍 详细诊断（15分钟）

### 步骤 1: 运行诊断脚本

```bash
node test-creem-api-detailed.js
```

这个脚本会：
- ✅ 验证 API Key 格式
- ✅ 测试最简化的请求
- ✅ 测试完整的请求
- ✅ 提供详细的错误分析

### 步骤 2: 查看 Creem Dashboard 日志

1. 登录 Creem Dashboard
2. 进入 **Logs** 或 **Events** 或 **API Logs** 页面
3. 查找最近的失败请求
4. 查看详细错误信息

### 步骤 3: 验证产品配置

在 Creem Dashboard 中，确认以下设置：

**产品基本信息**:
```
Name: Pro Monthly
ID: prod_4BV6rfzTZBt37QapS6JPtj
Status: Active ✅
Mode: Test ✅
```

**定价信息**:
```
Price: $29/month
Currency: USD
Billing Period: Monthly
```

**Checkout 设置**:
```
Enable Checkout: ON ✅
Redirect URL: (可选)
```

---

## 🛠️ 常见解决方案

### 解决方案 1: API Key 问题

**症状**: 403 Forbidden，所有请求都失败

**原因**: API Key 无效、过期或类型错误

**解决**:
```bash
# 1. 创建新的 Test Secret Key
# 2. 更新 .env.local
CREEM_API_KEY=creem_test_新的key

# 3. 重启服务
cd server
npm run dev
```

---

### 解决方案 2: 产品未激活

**症状**: 403 Forbidden，但 API Key 是正确的

**原因**: 产品状态是 Draft 或 Archived

**解决**:
1. 在 Creem Dashboard 找到产品
2. 点击 **Publish** 或 **Activate** 按钮
3. 确认状态变为 **Active**
4. 重新测试

---

### 解决方案 3: Mode 不匹配

**症状**: 403 Forbidden，API Key 和产品都存在

**原因**: API Key 是 Test Mode，但产品是 Production Mode（或反之）

**解决**:
```bash
# 确保使用 Test Mode 的所有资源
API Key: creem_test_... ✅
Product Mode: Test ✅

# 或者都使用 Production Mode
API Key: creem_live_... ✅
Product Mode: Production ✅
```

---

### 解决方案 4: 重新创建产品

**症状**: 尝试了所有方法仍然 403

**原因**: 产品配置损坏或有隐藏问题

**解决**:
1. 在 Creem Dashboard 创建一个新的测试产品
2. 设置相同的价格和配置
3. 确保 **Enable Checkout** 开启
4. 复制新的产品 ID
5. 更新 `server/creem-products.js`:
   ```javascript
   pro: {
     monthly: 'prod_新的产品ID',
     yearly: 'prod_2WXLA8gc9V8fEBXEWwSF7X',
   }
   ```
6. 重启服务并测试

---

## 📸 需要提供的截图

如果以上方法都不行，请提供以下截图（**隐藏敏感信息**）：

### 1. API Keys 页面
- 路径: Settings → API Keys
- 截图内容: Key 列表，显示类型和状态

### 2. 产品详情页面
- 路径: Products → Pro Monthly
- 截图内容: 产品状态、Mode、Enable Checkout 开关

### 3. 错误日志
- 运行 `node test-creem-api-detailed.js` 的完整输出
- 包括 trace_id（如果有）

### 4. Creem Dashboard 日志（如果有）
- 路径: Logs 或 Events
- 截图内容: 最近的 API 请求记录

---

## 🚀 临时解决方案

在等待修复的同时，使用 **TestAdmin 页面**继续开发：

```bash
# 1. 访问测试管理页面
http://localhost:5174/test-admin

# 2. 选择计划并授予订阅
# 3. 系统会直接添加积分到数据库
# 4. 在 Dashboard 查看结果
```

这样可以测试：
- ✅ 积分系统
- ✅ Dashboard 显示
- ✅ 订阅管理
- ✅ 其他功能

不影响开发进度！

---

## 📞 联系支持

如果所有方法都尝试过了，联系 Creem 支持：

**邮箱**: support@creem.io

**提供信息**:
1. 账户邮箱
2. API Key 前缀 (creem_test_3ge6060...)
3. 产品 ID (prod_4BV6rfzTZBt37QapS6JPtj)
4. Trace ID (从错误响应中获取)
5. 错误截图
6. 诊断脚本输出

**邮件模板**:
```
Subject: 403 Forbidden Error when creating checkout session

Hi Creem Support,

I'm getting a 403 Forbidden error when trying to create a checkout session.

Details:
- Account Email: [你的邮箱]
- API Key Prefix: creem_test_3ge6060...
- Product ID: prod_4BV6rfzTZBt37QapS6JPtj
- Trace ID: [从错误响应中获取]
- Error: 403 Forbidden

I have verified:
- API Key is a Test Mode Secret Key
- Product is Active and in Test Mode
- Enable Checkout is ON

Please help investigate this issue.

Thank you!
```

---

## ✅ 检查清单总结

在联系支持前，确认已完成：

- [ ] 运行了 `node test-creem-api-detailed.js`
- [ ] 检查了 API Key 类型（Secret Key，不是 Publishable Key）
- [ ] 确认产品状态是 Active
- [ ] 确认产品 Mode 与 API Key 匹配
- [ ] 尝试创建了新的 API Key
- [ ] 检查了 Creem Dashboard 日志
- [ ] 准备好了截图和错误信息

完成这些步骤后，你应该能够：
1. 自己解决问题，或
2. 有足够的信息联系 Creem 支持

