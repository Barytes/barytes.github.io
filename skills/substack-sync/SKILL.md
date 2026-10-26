---
name: substack-sync
description: Synchronize this website's Chinese and English blog articles to separate Substack drafts, verify content and images, and track pending changes. Use when adding or editing blog posts or explicitly syncing Substack; supports browser sessions and conorbronsdon/substack-mcp across agent environments.
---

# Substack 双语同步

将一篇博客同步为中文、英文两份 Substack 草稿。网站原稿与译文是唯一内容来源，`substack/config.json` 指定 publication，`substack/sync-state.json` 保存跨机器接续所需的稿件 ID、版本和验证方式。适用于 Codex、Grok bot 及其他能读取仓库的 Agent。

## 准备与选择通道

1. 读取 `README.md` 的双语约定，确认 slug、两种语言全文和当次授权范围。新增或修改博客时同时维护两份对应稿；默认目标是草稿。用户仅要求研究、起草或本地预览时，保持对应范围。
2. 首次运行或依赖缺失时，读 [安装与认证](references/setup.md)，安装 Node.js 22+ 和本 Skill 锁定的 npm 依赖。转换器使用 `conorbronsdon/substack-mcp`；浏览器通道无需启动 MCP 服务或导出 Cookie。不要假定其他 Agent 已有本机 Codex 工具、依赖或登录会话。
3. 在仓库根目录运行 `node skills/substack-sync/scripts/sync.mjs prepare SLUG`。检查 `.substack/prepared/SLUG/{zh,en}.md` 和 JSON 清单。表格转为保留列名与所有单元格的列表，封面置于正文开头，正文图片保持原位置，网站原稿不被改写。
4. 根据当前环境和状态文件的 `transport` 继续：
   - **有可操作的已登录浏览器：优先读 [浏览器同步](references/browser.md)**，直接在编辑器保存草稿。网页测试优先使用 in-app browser；其他环境使用其受支持的浏览器工具。需要登录时由用户在当前浏览器完成。
   - **已有授权的 MCP 会话，或用户明确要求 MCP：读 [安装与认证](references/setup.md)**，使用 `doctor`、`sync SLUG --write-drafts`、`verify SLUG`。原生 MCP 不可用时，仓库脚本自带 stdio client。浏览器登录不会自动认证独立 MCP 进程。

## 完成条件

复用 `(slug, language) → draft_id`；创建结果不明时先查草稿列表，避免重复。更新前比较已有远端基线，保留在 Substack 编辑器中产生的额外改动；发现差异时先协调来源。

两版均需：标题、摘要和全文读回一致；引用链接保留；图片已托管、加载成功且替代文字对应语言；表格的全部信息保留；退出后重新打开仍有相同内容，后台列为 Draft。再检查桌面与手机预览中的封面、正文图、列表和顺序，保存截图。浏览器检查与 MCP preflight 各自记录，不互相冒充。

完成后回写 `substack/sync-state.json`，报告两份编辑链接、转换安排、实际验证和发布状态。工具、网络或认证缺失时，完成可执行的本地步骤、保留 pending 及已有 ID，说明当前环境的具体缺口。仅本地转换不能报告远端同步成功。`.substack/` 保存私有临时文件；提交与推送按当次授权执行。

## 发布与接续

本 Skill 的命令只处理草稿。当前所有文章都应免费：读者范围设为 **Everyone**，不添加付费墙。浏览器新稿需在 Continue → Audience 中选择 Everyone，关闭面板后重新打开核对保存；最终 Publish/Send 按当次用户授权执行。用 Free subscriber view 检查完整正文，不能用切换预览读者类型代替实际受众设置。历史回填推荐只发布网页，发布前核对邮件选项和日期。

浏览器与 MCP 使用不同的内容指纹和图片映射。沿用状态中的通道；切换前读取现有稿件并建立对应基线。MCP 脚本会拒绝直接覆盖浏览器基线的稿件。已发布稿件由获得授权的浏览器编辑流程处理，保持原 ID。

手动使用 MCP 时沿用脚本的草稿工具 allowlist；`allow_unsupported` 保持 false。`create_note` 会立即公开，不用于文章同步。锁定版本未暴露 section/cover metadata 修改；封面使用第一张正文图片。
