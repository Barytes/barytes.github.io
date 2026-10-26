# 安装、认证和接续

这些命令在仓库根目录执行，适用于 macOS、Linux 和 Windows 的 Node.js 环境，不依赖本机 Codex。先阅读 `skills/substack-sync/package.json`；使用锁定依赖安装，避免同名的其他 `substack-mcp` 项目。

## 通用依赖

```sh
node --version
npm --version
npm ci --prefix skills/substack-sync --cache .substack/npm-cache --ignore-scripts --no-audit --no-fund
node skills/substack-sync/scripts/sync.mjs prepare skill-development
```

需要 Node.js 22 或更高版本。若缺少 Node.js，从 [Node.js 官方网站](https://nodejs.org/en/download) 安装支持当前操作系统的 LTS，再执行上述命令；托管 Agent 没有安装权限时，报告该缺口并将命令交给其运行环境维护者。依赖安装需要 npm registry 网络访问，同步还需要访问 Substack 和图片 CDN。

锁定的项目是 [`@conorbronsdon/substack-mcp@1.3.0`](https://github.com/conorbronsdon/substack-mcp)，不是官方 Substack MCP，也不是名字相近的其他 npm 包。内容准备使用它的转换器。选择浏览器通道时，安装依赖后继续 [浏览器同步](browser.md)，无需 MCP 登录、Cookie 导出或 Playwright Chromium 安装。

下面仅用于 MCP 通道。本 Skill 使用该项目的实际 stdio MCP 协议；带 MCP 客户端的 Agent 可原生连接，没有原生 MCP 客户端的 Agent 使用仓库脚本即可，脚本自带 MCP client。

脚本需要的工具只有：`get_publication`、`get_sections`、`list_drafts`、`get_draft`、`export_draft`、`preflight_draft`、`create_draft`、`plan_draft_update`、`update_draft`、`upload_image`。更新使用计划返回的 receipt；工具拒绝已发布草稿。该版本的 section/cover 修改能力以实际 schema 为准，不依赖 README 中较宽的描述。

## 认证方式 A：当前环境的私有变量或配置

从当前环境的 secret manager 注入以下三个变量，不将值写入仓库、任务提示词或聊天：

```text
SUBSTACK_PUBLICATION_URL=https://barytes.substack.com
SUBSTACK_USER_ID=<当前登录账号的数字 ID>
SUBSTACK_SESSION_TOKEN=<匹配 publication 域名的登录 Cookie>
```

也可以由用户在本地创建 `.substack/credentials.json`，脚本会私下读取：

```json
{
  "publication_url": "https://barytes.substack.com",
  "user_id": 12345,
  "session_token": "由用户在本地填写"
}
```

保持 `.substack/` 被 Git 忽略，限制本机文件访问；不要打印配置内容。在 Substack 托管域名，使用 `barytes.substack.com` 的 `connect.sid`，或 `.substack.com` 的 `substack.sid`；自定义域名必须使用该域名的 `connect.sid`。会话过期时在当前环境重新认证。

用当前登录账号自己的 handle 打开 `https://substack.com/api/v1/user/HANDLE/public_profile`，核对顶层 `id`、`handle` 和姓名；文章 byline 的 ID 不能证明登录账号身份。账号与 publication 仍需在浏览器确认。[上游认证说明](https://github.com/conorbronsdon/substack-mcp#setup)

## 认证方式 B：上游交互式浏览器登录

有交互式桌面的环境可用上游工具自动保存会话。这个工具会启动它自己的 Playwright 浏览器；in-app browser 不向它共享 Cookie。仅需本地内容准备或已有凭据时，无须安装浏览器。

先为当前终端设置 `SUBSTACK_MCP_HOME` 为本仓库 `.substack/auth` 的绝对路径，以及 `PLAYWRIGHT_BROWSERS_PATH` 为 `.substack/browsers` 的绝对路径。POSIX 示例：

```sh
export SUBSTACK_MCP_HOME="$PWD/.substack/auth"
export PLAYWRIGHT_BROWSERS_PATH="$PWD/.substack/browsers"
node skills/substack-sync/node_modules/playwright/cli.js install chromium
node skills/substack-sync/node_modules/@conorbronsdon/substack-mcp/dist/index.js login https://barytes.substack.com --user-id YOUR_ACCOUNT_ID
```

PowerShell 对应变量写法为 `$env:SUBSTACK_MCP_HOME = Join-Path (Get-Location) '.substack/auth'` 和 `$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.substack/browsers'`；其余 Node 命令相同。由用户在窗口内完成登录、验证码或 CAPTCHA。工具验证可读取草稿后保存机器绑定会话；该文件不能直接拷到另一台机器使用。

本机 Chrome for Testing 有过启动问题，网页预览优先使用 in-app browser。上游浏览器登录在当前环境失败时，优先使用 [浏览器同步](browser.md)；方式 A 仅用于用户愿意提供私有凭据的环境。保留实际错误，不反复重启同一个失效浏览器。

## 远端验证与故障恢复

```sh
node skills/substack-sync/scripts/sync.mjs doctor
node skills/substack-sync/scripts/sync.mjs sync skill-development --write-drafts
node skills/substack-sync/scripts/sync.mjs verify skill-development
```

- 缺凭据：完成本地 prepare，状态为 pending，通知用户认证；不创建伪远端 ID。
- 创建请求结果不明：保留 `create_pending`，下一次先查找同名草稿并验证内容，不盲目再建。
- 已有同名但无映射的草稿：先核对正文和所属语言，再明确关联 ID；脚本会停下，避免覆盖已有稿件。
- 远端正文在仓库之外被修改：脚本通过已保存的远端 hash 检出差异；先协调改动再建立新基线。
- 已发布文章：当前上游草稿更新工具会拒绝。由已获授权的浏览器编辑流程处理，并验证结果；不要复制一篇新文章冒充更新。
- 换机器或换 Agent：带上版本库中的 `substack/` 配置与状态，在新环境安装依赖并建立授权会话。脚本从文件位置确定仓库根目录，不含本机绝对路径。`transport: browser` 的稿件沿用浏览器通道；切换 MCP 前需要建立 MCP export hash 和该稿的图片映射，现有脚本会先停下。

本地副本、npm 安装或 MCP 握手分别只证明对应步骤。远端正文读回、图片检查和浏览器排版检查全部完成后，才报告草稿同步跑通。
