# Creem 支付集成修复总结

## 📅 修复日期
2025-10-06

## 🐛 问题描述

在 Pricing 页面点击购买按钮后，后端调用 Creem API 创建 checkout session 失败，返回以下错误：

```
❌ Creem Checkout Error
Status: 404
Status Text: Not Found
Error Data: {
  "statusCode": 500,
  "timestamp": "2025-10-06T02:55:40.964Z",
  "path": "/v1/checkout/sessions"
}
```

## 🔍 根本原因分析

通过查阅 Creem 官方文档 (https://docs.creem.io/api-reference/endpoint/create-checkout)，发现了以下问题：

### 1. 错误的 API 端点
- **错误**: `/v1/checkout/sessions`
- **正确**: `/v1/checkouts`

### 2. 缺少必填字段
- **缺少**: `units` 字段（产品数量）
- **需要**: `units: 1`

### 3. 响应字段名称错误
- **错误**: 期望 `response.data.url`
- **正确**: 应该是 `response.data.checkout_url`

## ✅ 修复方案

### 修改文件 1: `server/index.js`

**位置**: 第 163-235 行

**主要修改**:
1. 修正 API 端点从 `/v1/checkout/sessions` 到 `/v1/checkouts`
2. 添加必填字段 `units: 1`
3. 添加可选的 `customer.email` 字段用于预填充结账页面
4. 修正响应字段从 `url` 到 `checkout_url`
5. 移除了不必要的 `cancel_url` 字段

**修改前**:
```javascript
const checkoutPayload = {
  product_id: productId,
  success_url: `${req.headers.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${req.headers.origin}/pricing`,
  metadata: {
    user_id: userId,
    plan_id: planId,
    interval: interval
  }
};

const response = await axios.post(
  'https://api.creem.io/v1/checkout/sessions', // ❌ 错误的端点
  checkoutPayload,
  ...
);

res.json({
  success: true,
  checkoutUrl: response.data.url, // ❌ 错误的字段名
  sessionId: response.data.id
});
```

**修改后**:
```javascript
const checkoutPayload = {
  product_id: productId,
  units: 1, // ✅ 添加必填字段
  success_url: `${req.headers.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
  metadata: {
    user_id: userId,
    plan_id: planId,
    interval: interval
  }
};

// ✅ 添加可选的客户信息
if (userEmail) {
  checkoutPayload.customer = {
    email: userEmail
  };
}

const response = await axios.post(
  'https://api.creem.io/v1/checkouts', // ✅ 正确的端点
  checkoutPayload,
  ...
);

res.json({
  success: true,
  checkoutUrl: response.data.checkout_url, // ✅ 正确的字段名
  sessionId: response.data.id
});
```

### 修改文件 2: `src/pages/Pricing.tsx`

**位置**: 第 12-49 行

**主要修改**:
添加用户邮箱到请求 payload 中

**修改前**:
```javascript
body: JSON.stringify({
  planId,
  interval,
  userId: user.id,
}),
```

**修改后**:
```javascript
body: JSON.stringify({
  planId,
  interval,
  userId: user.id,
  userEmail: user.email, // ✅ 添加用户邮箱
}),
```

## 📋 正确的 Creem API Payload 格式

根据官方文档，创建 checkout session 的正确格式为：

```javascript
{
  product_id: "prod_xxx",      // 必填：产品 ID
  units: 1,                     // 必填：产品数量
  success_url: "...",           // 必填：成功回调 URL
  customer: {                   // 可选：预填充客户信息
    id: "cust_xxx",            // 可选：客户 ID
    email: "user@example.com"  // 可选：客户邮箱
  },
  discount_code: "SUMMER2024",  // 可选：折扣码
  metadata: {                   // 可选：自定义元数据
    user_id: "...",
    plan_id: "...",
    interval: "..."
  }
}
```

## 📊 API 响应格式

成功响应示例：

```javascript
{
  id: "checkout_xxx",
  mode: "test",
  object: "checkout",
  status: "pending",
  product: "prod_xxx",
  units: 1,
  checkout_url: "https://checkout.creem.io/...", // ✅ 注意字段名
  success_url: "...",
  customer: "cust_xxx",
  metadata: { ... }
}
```

## 🧪 测试步骤

### 1. 重启后端服务
```bash
cd server
npm run dev
```

### 2. 测试购买流程
1. 访问 `http://localhost:5174/pricing`
2. 登录账户
3. 选择任意计划（Basic/Pro/Max）
4. 点击 "Get Started" 按钮
5. 检查是否成功跳转到 Creem 支付页面

### 3. 查看日志
后端应该输出类似以下的成功日志：

```
=== Creem Checkout Request ===
Plan: pro month
Product ID: prod_4BV6rfzTZBt37QapS6JPtj
Payload: {
  "product_id": "prod_4BV6rfzTZBt37QapS6JPtj",
  "units": 1,
  "success_url": "http://localhost:5173/payment/success?session_id={CHECKOUT_SESSION_ID}",
  "customer": {
    "email": "user@example.com"
  },
  "metadata": {
    "user_id": "...",
    "plan_id": "pro",
    "interval": "month"
  }
}
✅ Checkout session created successfully
Session ID: checkout_xxx
Checkout URL: https://checkout.creem.io/...
```

## 🔄 备用测试方案

如果支付流程仍有问题，可以使用 TestAdmin 页面进行测试：

1. 访问 `http://localhost:5174/test-admin`
2. 选择计划（Basic/Pro/Max）
3. 点击 "Grant Subscription"
4. 系统直接添加 credits 到数据库
5. 在 Dashboard 查看结果

## 📚 参考资料

- [Creem API 文档 - Create Checkout](https://docs.creem.io/api-reference/endpoint/create-checkout)
- [Creem API 文档 - Introduction](https://docs.creem.io/api-reference/introduction)

## ✨ 总结

这次修复主要解决了三个关键问题：
1. ✅ API 端点错误
2. ✅ 缺少必填字段
3. ✅ 响应字段名称错误

修复后，支付流程应该能够正常工作。如果仍有问题，请检查：
- Creem API Key 是否有效
- 产品 ID 是否正确配置
- 网络连接是否正常
- Creem Dashboard 中的产品配置是否正确

