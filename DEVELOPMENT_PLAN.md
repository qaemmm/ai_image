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

### 📝 阶段四：AI 生图功能
**状态**: 待开发

**需求**:
- 用户输入文字提示词（prompt）
- 调用火山引擎图像生成 API
- 显示生成的图片
- 支持下载

**开发步骤**:
1. [ ] 修改 `AIGenerate.tsx` 组件
   - 移除 Unsplash 占位代码
   - 添加提示词输入框（支持多行文本）
   - 调用后端 `/api/generate-image` 接口
2. [ ] 实现前后端数据交互
   - 前端发送用户输入的 prompt
   - 后端调用火山引擎 API
   - 返回生成图片的 URL
3. [ ] 优化 UI 和功能
   - 提示词输入框（textarea）
   - 生成按钮和加载状态
   - 显示生成的图片
   - 下载功能
4. [ ] 添加示例提示词（可选）
5. [ ] 测试完整流程
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
- [ ] 阶段三：图片识别（进行中）
- [ ] 阶段四：AI 生图

**最后更新**: 2025-10-02
