# 使用已登录浏览器同步

这条路径通过 Substack 编辑器的富文本粘贴、图片托管和自动保存完成同步，登录状态留在浏览器。当前环境的 Agent 需具备浏览器导航、表单输入、HTML 粘贴、可见 DOM 读取和截图能力；未登录时请用户在该浏览器登录。Codex 优先使用 in-app browser，其他 Agent 使用其已授权的浏览器工具；不要求它们拥有 `cua_repl`。

## 生成传输页面

先按 [安装说明](setup.md) 安装依赖并运行 `prepare`，然后：

```sh
node skills/substack-sync/scripts/browser.mjs SLUG
```

命令绑定 `127.0.0.1` 的空闲端口并打印 `/zh`、`/en` URL。服务器只提供这两个页面；任务完成后停止进程。浏览器与终端在不同机器时，将生成页面作为私有产物交给浏览器所在环境，或使用该环境支持的本地文件/HTML 传输；保持正文和凭据私有，不为此公开本地服务。

传输页面中 `#draft-title`、`#draft-subtitle` 分别是标题和摘要，`#substack-body` 是要粘贴的正文。只读取该 article 的 HTML，避免把页面的操作说明粘进去。浏览器不支持 HTML 粘贴时，使用原生富文本复制粘贴；纯文本 Markdown 粘贴不能算完成。

图片 URL 指向 `src/site.json` 中的网站。先确认对应公开图片可访问且与 `public/` 原文件一致，再粘贴；Substack 会异步抓取并转存。新图片尚未在网站上线时，使用编辑器的图片上传控件上传本地文件，在相同位置插入并恢复替代文字，完成后核对顺序。不能让 localhost 图片 URL 留在草稿中。

## 查重、写入与保存

1. 确认 publication 与 `substack/config.json` 相同。检查状态映射及后台 Drafts；已有 ID 就打开该草稿。未映射但同名的稿件先核对内容和语言再关联。创建结果不明时先查列表。
2. 更新已有浏览器稿件前，按下节读取两版当前快照并运行 `browser-state.mjs check`。与上次基线不一致时先协调差异，保留远端手工编辑。
3. 新稿通过 Create → Article 创建。分别填标题、摘要，向正文编辑器粘贴对应 HTML。更新时替换同一稿件内的对应内容。取得实际 `/publish/post/数字ID` 后立即把 ID 和 `status: pending` 记入状态文件，后续失败仍能接续。
4. 等编辑器显示 **Saved**，并确认两张或更多图片已转为 Substack 图片 URL 且加载成功。只看到正文不代表图片转存已经完成。
5. 当前所有文章免费。点击 Continue 打开发布设置，在 **Audience** 中选择 **Everyone**（与评论权限的 Everyone 区分），关闭面板并重新载入，再打开 Continue 核对该选项仍选中。此处只保存草稿设置，不点击最终 Publish/Send。
6. 点击 Exit 回到后台，确认该条列为 **Draft**，再按原 ID 重新打开。只有重新打开后的标题、摘要和全文仍匹配，才进入验证记录。

## 内容读回与冲突基线

从重新打开的编辑器读取 DOM。下面是 2026-10-14 实测选择器；使用前从当前 DOM 确认它们仍对应正确字段。将函数交给当前浏览器工具的只读页面求值能力，不调用隐藏应用状态、Cookie 或私有网络接口。

```js
() => {
  const body = document.querySelector('div.tiptap[contenteditable="true"]');
  return {
    title: document.querySelector('#post-title').value,
    subtitle: document.querySelector('[placeholder="Add a subtitle…"]').value,
    text: body.innerText,
    headings: [...body.querySelectorAll('h2')].map(e => e.textContent),
    lists: [...body.querySelectorAll('ul')].map(e => [...e.children].map(li => li.textContent)),
    links: [...body.querySelectorAll('a[href]')].filter(e => !e.querySelector('img'))
      .map(e => ({ text: e.textContent, href: e.getAttribute('href') })),
    images: [...body.querySelectorAll('img')].map(e => ({ alt: e.alt, src: e.src })),
    image_loads: [...body.querySelectorAll('img')].map(e => ({ width: e.naturalWidth, height: e.naturalHeight })),
    formatting: { blockquote: body.querySelectorAll('blockquote').length,
      strong: body.querySelectorAll('strong').length, code: body.querySelectorAll('code').length }
  };
}
```

保存为私有 JSON：`{ "checked_at": "实际 ISO 时间", "zh": 中文快照, "en": 英文快照 }`。每份快照补充实际 `editor_url`。更新前的快照可直接用于：

```sh
node skills/substack-sync/scripts/browser-state.mjs check SLUG .substack/evidence/SLUG-before.json
```

`check` 比较上次的浏览器内容指纹，包含全文、标题、摘要、列表、链接、图片和格式数量；不受当前图片显示尺寸影响。若只有本地原稿变了，检查仍应通过；若 Substack 内容也变了，先协调来源。

## 视觉检查与记录完成

用编辑器 **Preview** 的 **Mobile / Desktop** 两种预览检查封面、正文图、全部列表及顺序。实测预览宽度分别是 375 和 1200 像素。窄编辑器可能隐藏 Preview 按钮，可在当前工具支持的较宽页面中打开同一草稿。若设置浏览器 viewport，核对实际尺寸，结束后恢复。

选择 **Free subscriber view** 检查完整正文；若出现 paywall，返回 Continue → Audience 修正为 Everyone 并核对保存。切换预览读者类型不修改草稿受众。不要把预览时间或预览地址当成已发布证据。

人工确认图片与原文件一致，检查表格每行信息和列表结构。保存关键截图后，在最终读回的每份快照中补充真实观察：`ui_status: "draft"`、`saved: true`、`reopened: true`、`visual_check: { "desktop": true, "mobile": true }`、`preview_audience: "free_subscriber_view"`、`draft_audience_observed: "everyone"`。未完成的项目保持未通过。

```sh
node skills/substack-sync/scripts/browser-state.mjs record SLUG .substack/evidence/SLUG-browser-readback.json
```

`record` 对仓库原稿核对两版标题、摘要、全文、二级标题、引用 URL、图片数量/替代文字/加载状态，之后写入 `transport: browser`、ID、source hash 和浏览器指纹。它验证输入证据的一致性；证据必须来自实际浏览器操作，截图检查仍由 Agent 完成。MCP 转换器会把 alt 另生成 caption，HTML 粘贴只保留 alt，因此两条路径分别验证。

同一版本再次同步时，读回并 `check`，无需重建或重复粘贴。换 Agent 后，版本库中的映射与指纹可继续使用；当前环境需要自己的浏览器会话。没有浏览器控制或无法登录时保持 pending，报告能力缺口和可安装的 MCP 备选通道。
