# 稿件依据与配图说明

本文及图片供本地确认，放在已被 Git 忽略的 drafts/ 下。未写入正式 content/blog/ 或 public/blog/，未提交、推送、部署或写入 Pages。

## 叙述范围

- 原始聊天：设计真实工作建模策略，01a11592-c2ca-7da0-9984-30551c040454。已读取四页共 34 轮，包括最初需求、创建 skill、试用纠偏、教学与项目分离及迁移讨论。
- 原始聊天：阅读独立项目迁移交接，01a12089-fd1f-7a03-9ee0-d3df693c6047。已读取两页共 17 轮，包括公共约定、domain model、入口、反馈、显式 trace 归档及分支提交。
- 代码及结构依据：独立项目的 1b18f92cd373275bf496b9124b6252ee34109fde 提交。读取 README、六个 SKILL.md、共同教学约定、记录格式和归档说明。
- 2026-10-10，按用户要求读取原帖《用 builder 心态准备面试skill》：https://www.superlinear.academy/c/share-your-projects/builder-skill。开头及动机部分沿用原帖中榛子老师的求职准备经验、重建工作 context 的解释，以及模拟广告预测工作的过程；轻微调整拼写与衔接，不搬原帖“问题”部分。当前技能结构仍以上述代码提交为依据。

## 重点事实

- 六个 skill 的名称、职责及三种记录，以上述提交为准。
- 公共约定与学习记录归 track-progress；教学判断归两个教学 skill。
- trace 与 feedback 分别保存；save-trace 仅显式调用。
- 同一会话可切换技能和模型；模型按回合记录。
- 归档时版本与会话早期实际使用版本有区别。
- 按用户要求，正文已删除测试与链接检查结果段，以及末尾的重构提交说明。
- 文中“暂时还没有完成一项能说明这套方法有效的学习任务”来自迁移前的用户自述，描述这次开发阶段，不对之后的学习作判断。

## 配图

按用户指定的 orange-line-illustration skill 重新生成，来源：https://github.com/orange2ai/orange-line-illustration，读取版本 f7e1f8444c1832e38ab92bca03d314560fc4fb98。

使用内置 imagegen，保留五个封面候选供用户选择：

1. assets/cover-01-tools.png：拆分工具。
2. assets/cover-02-step.png：修正台阶。
3. assets/cover-03-pruning.png：剪去旁枝。
4. assets/cover-04-thread.png：整理线团。
5. assets/cover-05-draft.png：走过草稿。

正文插图 assets/shared-learning-record.png 表现教学与项目共用学习记录，位于“拆开后公共约定该放在哪”一节。六个 skill 的具体职责用文字表格说明。

完整生成提示词与 skill 版本保存在 image-prompts.json。用户已选定候选 1「拆分工具」作为封面；其他候选保留在 cover-candidates.html 中。

最初的通用封面 assets/cover.png 和结构草图 assets/skills-map.svg 仅作为未采用的草稿留存，不出现在当前文章预览里。

用户的长期偏好已写入网站根目录 AGENTS.md，并保存为记忆更新笔记。

## 本地确认

article.md 为可编辑正文；preview.html 为带封面和结构图的本地阅读预览。确认后再决定正式文章 slug、日期以及上线位置。
