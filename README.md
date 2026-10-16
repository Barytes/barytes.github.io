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

## 中文与英文版本

页头的「中文 / EN」切换整页语言，包括导航、首页介绍、教育经历、博客标题与正文、分类、Thoughts 和论文介绍。**论文标题在两版中都保留正式英文原题**；作者署名、期刊名、DOI 和原始 PDF 共用，不翻译或复制论文文件。

中文为默认版本，沿用 `/`、`/blog/`、`/thoughts/`、`/publications/` 等现有地址；英文版加 `/en/`，例如 `/en/blog/skill-development/`。切换保留当前文章、分类或分页，浏览器启用脚本时也保留查询参数与锚点。站内导航始终指向当前语言的页面。浏览器本地存储记住选择，再次从首页入口 `/` 进入时使用上次语言；直接打开文章或英文网址时以网址语言为准。不启用 JavaScript 或不允许本地存储时，仍可通过静态链接切换语言。

双语内容在构建时写入 HTML，不依赖读者端翻译服务。每个页面都有对应的 `lang`、canonical、`hreflang` 与分享元数据，站点地图包含两个版本。

- `src/locales.json`：双语界面文案和分类名称。新增分类时，需同时补齐中文和英文名称。
- `src/site.json`：`description`、`intro`、`current` 分别维护 `zh` 和 `en`。
- `content/blog/`、`content/thoughts/`、`content/publications/`：保留原稿及共用元数据，`lang` 标明原稿语言（`zh-CN` 或 `en`；论文默认英文，博客和 Thoughts 默认中文）。
- `content/translations/{zh,en}/{blog,thoughts,publications}/{slug}.md`：对应语言的译文，slug 与原稿一致。原稿已是该语言时可直接使用；混合语言的原稿可以为两种语言各提供一份版本。

译文只维护 `title`、`description` 和正文，不重复日期、分类、来源、发布状态、作者、DOI 等元数据。论文译文只维护 `description` 和正文，标题直接取自原稿。原稿没有标题或摘要的 Thoughts，译文也不需要 front matter。示例：

```md
---
title: "English article title"
description: "An English description."
---

The full translated article.
```

新增内容时同时准备另一种语言的全文，构建器发现缺少所需译文会报错。Thoughts 的 `status`、原始日期和顺序统一取自原稿；译文保留相同的 `<!-- more -->` 片段数量及链接卡片格式，不另建 thread。修改原稿时同步更新对应译文。原始中英双语的长期游戏文章按已有两份正文分别展示，原稿仍保留。

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
- `src/locales.json`、`src/language.js`：双语界面文案、语言切换与偏好记忆。
- `content/blog/*.md`：博客文章，文件名生成文章 URL。
- `content/publications/*.md`：论文详情，文件名生成论文 URL。
- `content/thoughts/*.md`：想法原稿，一份文件组织一组 thread，正文独立于网页存储。
- `public/blog/`：博客图片。封面文件名必须与文章 slug 一致，例如 `content/blog/auto-research.md` 对应 `public/blog/auto-research.png`；构建时自动出现在列表卡片和文章页。文内配图也放在此目录，正文用 `/blog/filename` 引用。
- `public/papers/`：论文 PDF。
- `public/thoughts/`：Thoughts 的附图和链接卡片缩略图，正文使用 `/thoughts/文件名` 引用。

新增博客：

```md
---
title: Your article title
date: 2026-09-26
status: draft
lang: en
tag: AI 与 Agent
category: ai-agents
sample: false
description: A short summary for the list page.
---

## A section

Write your article in Markdown.
```

封面放到 `public/blog/{slug}.png`，文件名与 Markdown 的 slug 一致。文内配图也放进 `public/blog/`，用 `/blog/filename` 引用。

博客的 `status` 使用 `draft` 或 `published`；旧文章未填写时按 `published` 处理。撤回文章时将原稿设为 `draft`，中英文版本一起从正式首页、博客列表、分类、文章页及站点地图中移除，正文、译文、原始日期和封面继续保留。`sample` 仅改变展示标记，不控制发布。

运行 `npm run dev:drafts` 后打开 `/blog/` 或 `/en/blog/` 可预览博客草稿；列表和文章页显示草稿标记，预览输出到 `dist-drafts/`，页面设置 `noindex`，草稿文章不进入站点地图。正式部署仍只上传 `dist/`。明确授权重新发布后，将原稿的 `status` 改为 `published`。

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

博客已从 https://barytes.substack.com 搬运目前归档的全部 6 篇公开文章，保留原文、原始发布日期和来源链接。封面插画放在 `public/blog/{slug}.png`，文内配图也在同一目录。仅去掉 Substack 订阅组件和图片控件，未改写正文。导入清单见 `content/substack-import.json`。这次是一次性迁移，后续新增文章可继续用 Markdown 维护。Computer Networks 论文的出版状态、卷号、文章号和 DOI 已于 2026-10-10 核对 [Crossref 正式记录](https://api.crossref.org/works/10.1016/j.comnet.2026.112819)及[出版社记录](https://api.elsevier.com/content/article/pii/S1389128626008315?httpAccept=application%2Fjson)；TMC 论文的 Under review 状态仍依作者资料整理。

网站已配置部署流程；本地构建成功不等于已在 GitHub 上部署。需要推送代码并启用 Pages 后才会上线。

## 首页结构

首页依次展示紧凑个人简介、论文列表、近期文章和教育经历；英文版对应 Recent writing 和 Education。教育经历仅保留硕士和本科信息。页面结构在 `scripts/build.mjs` 中维护；样式在 `src/style.css` 中维护。设计对比页与切换入口已移除。

## 博客分类

文章 front matter 中的 `category` 是分类 URL 标识，`tag` 保留原稿的分类名称；两种语言的页面显示名称在 `src/locales.json` 中统一维护。当前中文分类为 AI 与智能体、职业思考、个人成长、知识管理。构建时自动生成双语分类入口和独立分类页；无需 JavaScript，支持直接访问、刷新和浏览器前进后退。新增分类时，在文章里填写新的 `category` 和 `tag`，并补齐双语分类文案。Substack 原始来源保存在文章元数据中，不在页面显示来源说明。

## Thoughts

中文导航和页面标题为「想法」，地址为 `/thoughts/`；英文版为 Thoughts，地址为 `/en/thoughts/`。每组内容完整展开，按发布时间倒序，每页 20 组。页面沿用全站样式；多片段用细线连接，没有复制、分享或永久链接操作。首页结构保持不变。

在 `content/thoughts/` 新建一份 Markdown，例如：

```md
---
date: "2026-10-10T20:30:00+08:00"
lang: "zh-CN"
status: "draft"
---

一个简短的想法，可以有几个普通段落。

<!-- more -->

顺着这个想法继续说。这是同一组 thread 的第二个片段。
```

`date` 必须是带引号和时区的完整时间，页面日期按北京时间显示。`title` 可选，默认直接展示正文；`lang` 默认 `zh-CN`。独占一行的 `<!-- more -->` 分隔片段，普通空行只分段。单片段也可以发布。正文支持链接卡片、列表、图片等 Markdown 写法。

`status` 必须为 `draft` 或 `published`。正式构建只收录 `published`，草稿不进入公开页面或站点地图。运行 `npm run dev:drafts`，打开 `/thoughts/` 可以连同草稿预览，每组草稿有明确标记，预览页面设置 `noindex`，并输出到独立的 `dist-drafts/`。普通 `npm run dev` 和部署构建不会展示草稿。现有部署流程只上传正式构建的 `dist/`，草稿预览不会覆盖正式构建产物。

### 附图片与链接卡片

图片放进 `public/thoughts/`，在对应片段中使用普通 Markdown 图片语法。多张图片可以依次写入，按原始比例展示并随屏幕宽度缩放：

```md
这张截图记录了当时的设计。

![设计截图的文字说明](/thoughts/design-example.png)
```

按 `AGENTS.md` 中的 Thoughts 链接规则，在对应片段中插入 `link-card` 代码块，块内使用 YAML：

````md
一篇值得继续读的文章。

```link-card
url: "https://example.com/article"
title: "文章标题"
description: "这篇文章讨论的具体问题。"
image: "/thoughts/article-preview.jpg"
```
````

`url` 和 `title` 必填；`description` 和 `image` 可省略，无图时展示文字卡片。链接与缩略图地址支持 HTTP(S) 网址或 `/` 开头的站内路径，站内路径自动适配 `BASE_PATH`。整张卡片可点击，来源域名从 `url` 生成。一个片段可以放多张图片、多张卡片，也可以和列表、引用、普通代码块混排。

卡片资料直接保存在 Markdown 原稿中，网站构建和读者浏览时不抓取目标网页。整理内容时由 Agent 读取用户提供的网址，核对后填入文章或视频的真实标题、摘要和可选缩略图；读取失败与标题确认按 `AGENTS.md` 的链接卡片规则执行。仅粘贴网址不会自动生成卡片，需要在原稿中写成上述格式。优先将获准使用的缩略图放进 `public/thoughts/`，也可以引用外部图片。新增或调整实际 Thoughts 仍按 `AGENTS.md` 的确认流程执行。

需要转发到其他平台时，Agent 直接读取对应 Markdown 原稿，去掉元数据并按片段整理即可；不需要从页面提取文案，也没有另一份需要同步维护的导出文件。
