# 白日幻想 · Daydream — 独立部署版

基于 DeepSeek API 的独立部署版本，可托管于 GitHub Pages。

## 部署到 GitHub Pages

### 1. 获取 DeepSeek API Key

在 [DeepSeek 开放平台](https://platform.deepseek.com/) 获取 API Key。

### 2. 创建 GitHub 仓库

将本目录推送为一个新的 GitHub 仓库。

### 3. 设置 Secret

GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret：

- **Name**: `DEEPSEEK_API_KEY`
- **Value**: 你的 DeepSeek API Key（如 `sk-xxxxxxxx`）

### 4. 启用 GitHub Pages

Settings → Pages → Source: **GitHub Actions**

### 5. 推送代码

```bash
git init
git add .
git commit -m "Initial standalone deploy"
git branch -M main
git remote add origin <你的仓库地址>
git push -u origin main
```

推送后 Actions 自动部署。部署 URL 在 Settings → Pages 页面查看。

## 本地开发

将 `ai-service.js` 中的 `__DEEPSEEK_API_KEY__` 替换为实际 Key：

```javascript
apiKey: "sk-your-actual-key",
```

⚠️ 不要提交含真实 Key 的代码。

## 与互动空间版的区别

| 功能 | 互动空间版 | 独立部署版 |
|---|---|---|
| AI 调用 | `tt.callAIChatCompletion` | `fetch()` 直连 DeepSeek |
| API Key | 平台后台配置 | GitHub Secret → 构建时注入 |
| 模型 | doubao-seed-2-0-pro-260215 | deepseek-v4-pro |
