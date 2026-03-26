# 夏屿手札（Summer Island Blog）

一个可独立运行的个人博客前端项目，面向计算机科学与软件工程学习记录场景。

## 已实现功能

- 夏日岛屿风格视觉系统：蓝海、暖白沙滩、黄昏色调、大留白、毛玻璃卡片。
- 动态/静态背景切换：预设背景（视频+图片）与自定义上传（图片/视频）。
- 背景持久化：使用 localStorage 保存用户选择，下次自动恢复。
- 沉浸交互：滚动视差、蝴蝶光标、蓝色尾迹粒子、点击光晕粒子。
- 音频系统：背景音乐与环境音双通道独立开关、独立音量、状态持久化。
- 博客内容：Markdown 文件管理、首页列表、详情页渲染、代码高亮。
- 文章互动：阅读量、点赞、留言板（本地存储）。
- 响应式：移动端自动降级部分高开销特效（光标/尾迹/视差）。

## 本地运行

> 建议使用本地静态服务器运行，避免直接打开 HTML 导致 fetch 受限。

### 方式一：VS Code Live Server

1. 安装 Live Server 插件。
2. 在项目根目录右键 [index.html](index.html) 选择 Open with Live Server。

### 方式二：Python 简易服务器

```bash
python -m http.server 5173
```

然后访问：

- http://127.0.0.1:5173/index.html

## 目录结构

- [index.html](index.html): 首页（文章列表 + 侧边栏 + 设置面板 + 音频控制）
- [post.html](post.html): 文章详情页（Markdown 渲染 + 点赞 + 留言）
- [styles/main.css](styles/main.css): 视觉风格与动画
- [scripts/core.js](scripts/core.js): 背景、音频、特效、设置持久化
- [scripts/app.js](scripts/app.js): 首页数据渲染与分类过滤
- [scripts/post.js](scripts/post.js): 文章详情数据、统计、留言
- [data/posts/index.json](data/posts/index.json): 文章索引与元数据
- [data/posts/*.md](data/posts): Markdown 文章内容
- [assets/images](assets/images): 光标与预设背景图
- [assets/audio](assets/audio): 音频文件目录

## 更新博客内容

1. 在 [data/posts](data/posts) 新增 Markdown 文件，文件名建议使用 slug，例如 `new-article.md`。
2. 在 [data/posts/index.json](data/posts/index.json) 增加对应元数据：

```json
{
  "slug": "new-article",
  "title": "文章标题",
  "excerpt": "摘要",
  "date": "2026-03-26",
  "category": "学习笔记",
  "tags": ["标签1", "标签2"]
}
```

3. 刷新页面即可。

## 自定义资源

### 背景

- 使用右上角“自定义背景”上传图片/视频。
- 上传资源会以 Data URL 保存在 localStorage（建议文件小于 4MB）。

### 鼠标与粒子

- 在“沉浸设置”中可调节：蝴蝶尺寸、尾迹强度、尾迹颜色、点击波纹颜色。
- 若要替换蝴蝶图标，可覆盖 [assets/images/butterfly.svg](assets/images/butterfly.svg)。

### 音频

- 将音乐放入 [assets/audio](assets/audio)，命名为：
  - `bgm.mp3`
  - `ambient.mp3`

## 上传到 GitHub

在项目根目录执行：

```bash
git add .
git commit -m "feat: initialize summer island immersive personal blog"
git push origin main
```

## GitHub Pages 部署

1. 打开 GitHub 仓库 Settings -> Pages。
2. Source 选择 Deploy from a branch。
3. Branch 选择 `main`，Folder 选择 `/ (root)`。
4. 保存后等待 1~3 分钟，访问生成的 Pages 链接。

## 可选增强

- 接入 Giscus 替换本地留言板。
- 增加全文搜索与标签归档页。
- 接入构建工具（Vite）和组件化框架（React/Vue）扩展维护性。
