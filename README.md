# Claude Skills Manager

智能 Skills 管理系统，作为 **Claude Code Custom Skill** 运行，帮助你从远程仓库同步、搜索和加载 skills。

## 安装方式

### 方式 A：作为 Claude Code Skill 安装（推荐）

1. 克隆到 Claude Code skills 目录：

```bash
# macOS/Linux
git clone https://github.com/Azurboy/claude_skills_control.git ~/.claude/skills/skills-manager

# 或者克隆到项目目录
git clone https://github.com/Azurboy/claude_skills_control.git .claude/skills/skills-manager
```

2. 安装依赖并构建：

```bash
cd ~/.claude/skills/skills-manager  # 或你的安装路径
npm install
npm run build
```

3. 首次配置 skills 仓库：

```bash
node dist/cli.js config https://github.com/ComposioHQ/awesome-claude-skills
node dist/cli.js sync
```

4. 在 Claude Code 中使用：

```
你: "帮我找一个关于 MCP Server 开发的 skill"

Claude 会自动识别并使用 skills-manager skill 来搜索和加载相关内容。
```

### 方式 B：作为独立 CLI 工具使用

```bash
git clone https://github.com/Azurboy/claude_skills_control.git
cd claude_skills_control
npm install
npm run build

# 使用
node dist/cli.js sync
node dist/cli.js load "创建 MCP Server"
```

---

## 为什么需要 Skills Manager？

### 一个真实的故事

> 小明是一名全栈开发者，他的 Claude Code 里积累了 150+ 个 skills：React 最佳实践、MCP Server 开发指南、Docker 部署模板、SQL 优化技巧……
>
> 某天下午，产品经理突然说："我们需要给 AI 助手加一个能连接外部 API 的功能，用 MCP 协议。"
>
> 小明心想："我记得之前收藏过 MCP 相关的 skill，但具体叫什么来着？"
>
> 他开始翻找：
> - `mcp-guide.md`？不对，这个是概念介绍
> - `mcp-server.md`？也不对，这个是部署相关的
> - `mcp-tools.md`？还是不对……
>
> 20 分钟过去了，他还在 150 个文件里大海捞针。
>
> **如果有 Skills Manager：**
>
> ```bash
> /skills load "创建 MCP Server 连接外部 API"
> ```
>
> 3 秒后，系统从 150 个 skills 中精准定位到 `mcp-builder`，并展示：
>
> ```
> **Recommended Skills:**
> 1. **mcp-builder** - Relevance: 10/10
>    Guide for creating MCP servers to integrate external APIs
> ```
>
> 小明确认加载，skill 内容直接注入到当前会话，Claude 立刻开始帮他写代码。
>
> **从 20 分钟 → 3 秒，这就是 Skills Manager 的价值。**

## 功能特性

- **远程仓库同步** - 从 GitHub 仓库克隆和更新 skills
- **三层匹配策略** - 关键词预筛选 + LLM 精选 + 用户确认，高效处理 100+ skills
- **使用追踪** - 自动检测 + 手动反馈，学习适用场景
- **中英文支持** - 支持中英文关键词提取和匹配
- **动态加载** - 将 skill 内容直接加载到 Claude Code 会话中

## 完整使用流程

### 第一步：安装

```bash
git clone https://github.com/Azurboy/claude_skills_control.git
cd claude_skills_control
npm install
npm run build
```

### 第二步：配置 Skills 仓库

你可以使用社区的 skills 仓库，比如 [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills)：

```bash
node dist/cli.js config https://github.com/ComposioHQ/awesome-claude-skills
```

或者使用你自己的 skills 仓库：

```bash
node dist/cli.js config https://github.com/your-username/your-skills-repo
```

### 第三步：同步 Skills

```bash
node dist/cli.js sync
```

输出示例：
```
Repository cloned successfully
Indexed 33 skills.
```

### 第四步：查看可用 Skills

```bash
node dist/cli.js list
```

输出示例：
```
# Available Skills (33 total)

## General
- **mcp-builder** (`mcp-builder`)
  Guide for creating high-quality MCP servers...

- **content-research-writer** (`content-research-writer`)
  Assists in writing high-quality content...
```

### 第五步：搜索并加载 Skills

这是核心功能。当你需要某个领域的帮助时：

```bash
node dist/cli.js load "创建 MCP Server 连接外部 API"
```

系统会：
1. **关键词预筛选**：从 "创建 MCP Server 连接外部 API" 提取关键词 `[mcp, server, api]`
2. **匹配候选**：从 33 个 skills 中筛选出最相关的 20 个
3. **生成推荐**：展示候选 skills 供 LLM 精选

输出示例：
```
**Pre-filtered Candidates (5 from 33 total):**

1. [mcp-builder] mcp-builder
   - Guide for creating high-quality MCP servers...

2. [connect-apps] connect-apps
   - Connect Claude to external apps...
```

### 第六步：加载选中的 Skill

```bash
node dist/cli.js inject mcp-builder
```

Skill 内容会被加载并显示，你可以直接使用这些知识。

### 第七步：反馈使用效果

使用完成后，告诉系统这个 skill 是否有帮助：

```bash
# 有用，并记录场景
node dist/cli.js feedback mcp-builder useful "构建 MCP 工具服务器"

# 无用
node dist/cli.js feedback some-skill notuseful
```

### 第八步：查看统计

```bash
node dist/cli.js stats
```

输出示例：
```
# Skills Usage Statistics

## Overview
- **Total Loads:** 15
- **Useful:** 12 (80.0%)
- **Not Useful:** 3
- **Pending Feedback:** 2

## Learned Scenarios

### mcp-builder
- 构建 MCP 工具服务器
- 创建 API 集成

### content-research-writer
- 写研究报告
- 内容创作
```

## 三层匹配策略

针对 100+ skills 的高效匹配方案：

```
用户查询: "创建 MCP Server"
         ↓
┌─────────────────────────────────────────┐
│ 第一层: 关键词预筛选 (本地，无 LLM)      │
│ - 从 query 提取关键词: [mcp, server]    │
│ - 匹配 name/description/tags           │
│ - 筛选出候选 skills (最多 20 个)        │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ 第二层: LLM 精选 (仅候选 skills)         │
│ - 只发送 20 个候选的摘要 (~1000 tokens) │
│ - LLM 选出最相关的 5 个                 │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ 第三层: 用户确认 + 加载                  │
└─────────────────────────────────────────┘
```

**为什么需要三层？**

| 方案 | 100 skills | 500 skills | 问题 |
|------|-----------|-----------|------|
| 全部发给 LLM | ~10K tokens | ~50K tokens | 上下文爆炸，成本高 |
| 纯关键词匹配 | 快但不准 | 快但不准 | 无法理解语义 |
| **三层策略** | ~1K tokens | ~1K tokens | 快速 + 精准 + 可控 |

## 使用追踪系统

### 自动检测

- 加载 skill 后，记录 `pendingUsage`
- 用户可通过 feedback 命令确认是否有用

### 手动反馈

```bash
/skills feedback <id> useful [场景描述]
/skills feedback <id> notuseful
```

### 学习场景

- 从成功使用的 query 中提取场景描述
- 存储到 `learnedScenarios` 字段
- 下次匹配时作为额外权重

## 命令参考

| 命令 | 说明 |
|------|------|
| `/skills sync` | 从远程仓库同步 skills |
| `/skills list` | 列出所有可用 skills |
| `/skills load <query>` | 查找并加载匹配的 skills |
| `/skills show <skill-id>` | 查看指定 skill |
| `/skills inject <id> [id...]` | 按 ID 加载 skills |
| `/skills config [repo-url]` | 查看或更新配置 |
| `/skills feedback <id> useful\|notuseful [场景]` | 标记 skill 是否有用 |
| `/skills stats` | 查看使用统计 |

## Skills 仓库格式

### 支持的格式

**格式 1：标准格式（推荐）**

```
skills-repo/
├── skills/
│   ├── react-best-practices.md
│   ├── nodejs-api-design.md
│   └── docker-compose.md
└── README.md
```

**格式 2：Composio 格式**

```
skills-repo/
├── mcp-builder/
│   └── SKILL.md
├── pdf/
│   └── SKILL.md
└── README.md
```

### Skill 文件格式

每个 skill 文件应包含 frontmatter：

```markdown
---
name: React Best Practices
description: React 开发最佳实践
tags: [react, hooks, performance]
domain: frontend
scenario: development
level: intermediate
---

# React Best Practices

Skill 内容...
```

### 维度说明

| 维度 | 可选值 |
|------|--------|
| domain | frontend, backend, devops, data, mobile, ai, general |
| scenario | development, debugging, deployment, testing, review |
| level | beginner, intermediate, advanced |

## 配置

配置存储在 `~/.claude-skills-config.json`：

```json
{
  "repoUrl": "https://github.com/user/skills-repo",
  "cacheDir": "~/.claude-skills-cache",
  "autoSync": true
}
```

使用数据存储在 `~/.claude-skills-cache/usage.json`。

## 项目结构

```
src/
├── index.ts           # 主命令处理器
├── cli.ts             # CLI 入口
├── config.ts          # 配置常量
├── types.ts           # TypeScript 类型
├── repo/
│   └── sync.ts        # Git 仓库同步
├── index/
│   ├── parser.ts      # Markdown 解析
│   └── store.ts       # 索引存储
├── matcher/
│   ├── keywords.ts    # 关键词提取和预筛选
│   └── llm.ts         # LLM 匹配逻辑
├── loader/
│   └── inject.ts      # Skill 加载
└── usage/
    └── tracker.ts     # 使用追踪
```

## 推荐的 Skills 仓库

- [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) - 33+ 高质量 skills
- [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) - 社区精选 skills
- [abubakarsiddik31/claude-skills-collection](https://github.com/abubakarsiddik31/claude-skills-collection) - 官方和社区 skills 合集

## License

MIT
