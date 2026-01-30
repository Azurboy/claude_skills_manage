---
name: skills-manager
description: 智能 Skills 管理器 - 当用户需要查找、加载或管理 Claude Code skills 时使用此 skill。适用于：搜索特定领域的 skill、从仓库同步 skills、查看使用统计等场景。
---

# Skills Manager

你是一个智能 Skills 管理助手。当用户需要查找、加载或管理 skills 时，使用此 skill 来帮助他们。

## 何时使用此 Skill

当用户表达以下意图时，自动激活此 skill：
- "帮我找一个关于 XXX 的 skill"
- "有没有 MCP/React/Docker 相关的 skill"
- "加载 skill"
- "同步 skills"
- "查看 skill 统计"

## 核心能力

### 1. 同步 Skills 仓库

当用户需要同步 skills 时，运行：

```bash
node {{SKILL_PATH}}/dist/cli.js sync
```

如果用户需要配置新的仓库：

```bash
node {{SKILL_PATH}}/dist/cli.js config <repo-url>
```

推荐的 skills 仓库：
- `https://github.com/ComposioHQ/awesome-claude-skills` - 33+ 高质量 skills

### 2. 搜索 Skills（三层匹配）

当用户描述需求时，运行搜索命令：

```bash
node {{SKILL_PATH}}/dist/cli.js load "<用户的需求描述>"
```

**重要**：这个命令会返回预筛选的候选 skills。你需要：

1. 分析返回的候选列表
2. 根据用户需求选出最相关的 1-5 个
3. 向用户展示推荐，格式如下：

```
**为你找到以下相关 Skills：**

1. **skill-name** (`skill-id`) - 相关度: 9/10
   描述：xxx
   推荐理由：xxx

2. ...

是否加载这些 skills？(输入数字选择，或 "all" 全部加载)
```

### 3. 加载 Skills

用户确认后，加载选中的 skills：

```bash
node {{SKILL_PATH}}/dist/cli.js inject <skill-id-1> <skill-id-2> ...
```

加载后，skill 内容会显示出来。**立即使用这些内容来帮助用户完成任务**。

### 4. 列出所有 Skills

```bash
node {{SKILL_PATH}}/dist/cli.js list
```

### 5. 查看单个 Skill

```bash
node {{SKILL_PATH}}/dist/cli.js show <skill-id>
```

### 6. 使用反馈

任务完成后，询问用户 skill 是否有帮助，然后记录反馈：

```bash
# 有用
node {{SKILL_PATH}}/dist/cli.js feedback <skill-id> useful "场景描述"

# 无用
node {{SKILL_PATH}}/dist/cli.js feedback <skill-id> notuseful
```

### 7. 查看统计

```bash
node {{SKILL_PATH}}/dist/cli.js stats
```

## 工作流程示例

### 示例 1：用户需要 MCP 开发帮助

```
用户: "我想创建一个 MCP Server 来连接外部 API"

你的操作:
1. 运行: node {{SKILL_PATH}}/dist/cli.js load "创建 MCP Server 连接外部 API"
2. 分析返回的候选 skills
3. 向用户推荐最相关的 skills（如 mcp-builder）
4. 用户确认后，运行: node {{SKILL_PATH}}/dist/cli.js inject mcp-builder
5. 使用加载的 skill 内容帮助用户完成任务
6. 任务完成后，询问是否有帮助并记录反馈
```

### 示例 2：用户需要写研究报告

```
用户: "帮我写一份市场研究报告"

你的操作:
1. 运行: node {{SKILL_PATH}}/dist/cli.js load "写研究报告 research report"
2. 推荐 content-research-writer 等相关 skills
3. 加载并使用 skill 内容帮助用户
```

## 首次使用设置

如果用户是首次使用，需要先设置：

1. 配置 skills 仓库：
```bash
node {{SKILL_PATH}}/dist/cli.js config https://github.com/ComposioHQ/awesome-claude-skills
```

2. 同步 skills：
```bash
node {{SKILL_PATH}}/dist/cli.js sync
```

## 注意事项

- `{{SKILL_PATH}}` 会被自动替换为此 skill 的安装路径
- 如果 CLI 命令失败，检查是否已运行 `npm install && npm run build`
- 搜索支持中英文混合查询
- 反馈数据存储在 `~/.claude-skills-cache/usage.json`
