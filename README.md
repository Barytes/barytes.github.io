# Beiyan Liu — Personal website

全新构建的轻量个人网站：暖纸色、克制的文字排版，无 logo、无大 slogan。页面在构建时生成纯静态 HTML，支持 GitHub Pages，无运行时框架、数据库或第三方字体依赖。

## 本地运行

需要 Node.js 22 或更高版本。

```sh
npm ci
npm run dev
```

打开 http://127.0.0.1:4321 。修改内容后自动重新构建，刷新浏览器即可。

```sh
npm run build
npm run check
npm run preview
```

## GitHub Pages 部署

1. 将代码提交并推送到 `master` 或 `main`。
2. 在 GitHub 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 仓库的 `Deploy personal website to GitHub Pages` 工作流会构建、检查内部链接并部署 `dist/`。
4. 本仓库对应地址为 https://barytes.github.io 。也可以在 Actions 页面手动运行部署。

遵循 [GitHub 官方自定义工作流说明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。部署工作流从 Pages 配置读取 base path，可用于仓库子路径；更换域名请同步修改 `src/site.json` 的 `url`（仅域名部分）。本地验证子路径可运行 `BASE_PATH=/example npm run build` 和 `BASE_PATH=/example npm run check`。

## 编辑内容

- `src/site.json`：姓名、邮箱、GitHub 链接、首页简介和站点域名。
- `scripts/build.mjs`：页面结构、教育经历、研究兴趣和首页文案。
- `src/style.css`：所有页面的视觉样式与移动端适配。
- `content/blog/*.md`：博客文章，文件名生成文章 URL。
- `content/publications/*.md`：论文详情，文件名生成论文 URL。
- `public/blog/`：博客图片。封面文件名必须与文章 slug 一致，例如 `content/blog/auto-research.md` 对应 `public/blog/auto-research.png`；构建时自动出现在列表卡片和文章页。文内配图也放在此目录，正文用 `/blog/filename` 引用。
- `public/papers/`：论文 PDF。

新增博客：

```md
---
title: Your article title
date: 2026-09-26
tag: AI 与 Agent
category: ai-agents
sample: false
description: A short summary for the list page.
---

## A section

Write your article in Markdown.
```

封面放到 `public/blog/{slug}.png`，文件名与 Markdown 的 slug 一致。文内配图也放进 `public/blog/`，用 `/blog/filename` 引用。

新增论文：

```md
---
title: Your paper title
year: 2026
venue: Conference or journal name
status: Published
kind: Conference
order: 4
authors: Author One, Author Two
description: A short summary.
pdf: /papers/your-paper.pdf
doi: https://doi.org/your-doi
---

## Overview

A description of the work.
```

`doi` 可省略。每篇论文配置一个真实 PDF；状态分别使用 Published / Accepted / Under review。Markdown 中的站内链接使用 `/` 开头，构建器会处理部署子路径。内容来自仓库维护者，Markdown 支持 HTML，请不要写入不可信 HTML。

## 内容来源与待编辑项

个人资料、教育经历、作者顺序与论文状态整理自用户指定的「12 week year／全局内容／个人资产／USER.md」及 PhD CV，采用 CV 中的 M.Eng.（2023–2026）而非旧站的 MPhil student 表述。论文 PDF 来自同目录的三份论文文件。未复制私人规划、成绩单、电话或其他个人材料。

博客已从 https://barytes.substack.com 搬运目前归档的全部 6 篇公开文章，保留原文、原始发布日期和来源链接。封面插画放在 `public/blog/{slug}.png`，文内配图也在同一目录。仅去掉 Substack 订阅组件和图片控件，未改写正文。导入清单见 `content/substack-import.json`。这次是一次性迁移，后续新增文章可继续用 Markdown 维护。论文的 Accepted 和 Under review 状态依作者资料整理，不代表实时检索核验。

网站已配置部署流程；本地构建成功不等于已在 GitHub 上部署。需要推送代码并启用 Pages 后才会上线。

## 首页结构

首页依次展示紧凑个人简介、论文列表、Recent writing 文章卡片和 Education 教育经历。教育经历仅保留硕士和本科信息。页面结构在 `scripts/build.mjs` 中维护；样式在 `src/style.css` 中维护。设计对比页与切换入口已移除。

## 博客分类

文章 front matter 中的 `category` 是分类 URL 标识，`tag` 是显示名称。当前分类为 AI 与 Agent、职业思考、个人成长、知识管理。构建时自动生成分类入口和独立分类页；无需 JavaScript，支持直接访问、刷新和浏览器前进后退。新增分类时，在文章里填写新的 `category` 和 `tag` 即可。Substack 原始来源保存在文章元数据中，不在页面显示来源说明。
