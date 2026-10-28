> 首页场景已纳入正式构建，维护源文件位于 `public/desk-scene/`，使用 `npm run dev` 预览。这个目录保留独立实验版本；下文的本地预览开关说明是历史记录。
>
> The homepage scene is now part of the production build. Maintain it in `public/desk-scene/` and preview with `npm run dev`. This directory retains the standalone experiment; preview-flag instructions below are historical.

# 窗边的书桌 / A desk by the window

独立的 3D 场景草稿。保留重晶石标本，加入窗边书房、阳光、木桌、书、台灯、茶、小球轨道、白猫、电吉他和三张专辑封面。已接入首页的独立本地预览模式；正式构建不包含场景，也没有发布。

A standalone 3D scene draft: a baryte specimen in a sunlit study, with an open book, a lamp, tea, a little marble run, a white cat, an electric guitar, and three framed album covers. It is available in an opt-in local homepage preview, excluded from the production build, and not published.

## 首页预览 / Homepage preview

在仓库根目录运行 `npm run dev:scene`，打开 <http://127.0.0.1:4321/> 或 <http://127.0.0.1:4321/en/>。首页仅放置场景画布，不显示草稿页的标题、说明或按钮。可直接点击物件、拖动视角，或聚焦后用方向键和 Home 操作。

Run `npm run dev:scene` from the repository root. The homepages display only a small canvas beside the introduction, with direct object interactions, dragging, arrow keys and Home. No draft-page headings, captions or buttons are included.

## 独立场景预览 / Standalone preview

在仓库根目录运行 / From the repository root:

```sh
node drafts/desk-scene/serve.mjs
```

- 中文：<http://127.0.0.1:8765/>
- English: <http://127.0.0.1:8765/?lang=en>
- 模拟 GitHub Pages 子路径 / Simulate a GitHub Pages subpath:

```sh
PORT=8766 BASE_PATH=/example/desk-scene node drafts/desk-scene/serve.mjs
```

然后打开 / Then open <http://127.0.0.1:8766/example/desk-scene/>.

请通过 HTTP 预览，浏览器通常不允许通过 `file://` 加载 ES modules。`serve.mjs` 只是本地静态预览工具；部署不需要服务器程序。

Preview over HTTP; browsers generally block ES modules loaded from `file://`. The preview server is only a local development tool, not a production dependency.

## 互动 / Interactions

- 点书翻页；点台灯开关；点小球轨道开始滚动；点标本转动晶石；点茶杯升起热气；点窗户切换午后与傍晚。
- 点白猫，它会抬头、伸懒腰、动动尾巴；点电吉他，琴弦会轻轻晃动。场景保持安静，不播放声音。
- 点墙上的唱片可放大封面，也可以展开下方的「墙上的唱片」选择。Esc、关闭按钮或点弹窗外均可收起。
- 拖动调整视角；触屏保留纵向页面滚动，横向拖动调整视角。
- 下方按钮提供相同操作。聚焦场景后，方向键调整视角，Home 复位。
- 场景空闲时停止渲染，移出视口或切到后台时暂停；遵循系统的“减少动态效果”设置。

Click the book, lamp, marble run, crystal, tea or window to interact. Drag to look around. On touch screens, vertical page scrolling remains available; drag horizontally to turn the view. The buttons provide the same actions with keyboard access. When the scene is focused, use arrow keys to rotate and Home to reset. Rendering stops when idle and pauses offscreen or in a hidden tab. Reduced-motion preferences are respected.

Pet the cat to see a little stretch and a tail flick, or tap the guitar to make its strings shimmer. The scene stays silent. Click a framed record to view its cover, or choose one under “Records on the wall.” Close with Escape, the close button, or a click outside the dialog.

## GitHub Pages

部署文件只有 / The deployable files are:

```text
index.html
style.css
scene.js
assets/whats-going-on.jpg
assets/abbey-road.jpg
assets/dark-side-of-the-moon.jpg
assets/SOURCES.md
vendor/three.module.min.js
vendor/three.core.min.js
vendor/LICENSE
```

全部使用相对路径。无需 API、后端、登录、远程模型、外部字体或运行时 CDN；纸张、木纹和窗外景色在浏览器内生成。Three.js 固定为 0.180.0，MIT 许可证随文件保留。需要支持 WebGL 2 的浏览器。

All resource paths are relative. There are no APIs, backend services, logins, remote models, external fonts, or runtime CDN requests. Paper, wood and landscape textures are generated locally. Three.js is pinned to 0.180.0 with its MIT license included. A browser with WebGL 2 support is required.

唱片封面随场景从本地资源加载，官方来源记录在 `assets/SOURCES.md`。封面图片保留原权利人的版权，不属于 Three.js 的 MIT 许可证。

Album covers are served from local files, with official sources recorded in `assets/SOURCES.md`. Album artwork remains the property of its respective rights holders and is not covered by the Three.js MIT license.

上述文件夹本身可以由 GitHub Pages 直接提供静态服务。本仓库的 `drafts/` 被 Git 忽略，正式构建不会收录这里。

本地首页集成由 `PREVIEW_SCENE=1` 启用：构建器将 `scene.js`、`vendor/` 和 `assets/` 复制到预览目录，在中英文首页插入小画布；图片地址相对于 JS 模块解析，支持 `BASE_PATH`。场景草稿的 `index.html` 不进入站点构建。默认构建保持关闭；正式接入和发布需要另行确定。

The local integration is enabled with `PREVIEW_SCENE=1`. The builder copies the scene module, vendor files and artwork into the preview output and embeds a small canvas in each homepage. Image URLs resolve relative to the module, including under `BASE_PATH`. The standalone HTML is not copied into the site. The normal build keeps the integration disabled; production integration and publication remain separate decisions.
