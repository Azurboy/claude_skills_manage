---
name: skills-control
description: 智能 Skills 管理 - 同步、搜索、加载来自仓库的 skills
---

# Skills Control

智能 Skills 管理系统，帮助你从远程仓库同步、搜索和加载 Claude Code skills。

## 功能特性

- **三层匹配策略** - 关键词预筛选 + LLM 精选 + 用户确认，高效处理 100+ skills
- **使用追踪** - 自动检测 + 手动反馈，学习适用场景
- **中英文支持** - 支持中英文关键词提取和匹配

## 安装配置

首次运行时会自动检测安装路径并初始化配置。

### 配置 Skills 仓库

```bash
node {{SKILL_PATH}}/scripts/skills-cli.js config https://github.com/your/skills-repo
```

### 同步 Skills

```bash
node {{SKILL_PATH}}/scripts/skills-cli.js sync
```

## 命令

### 基础命令

- `/skills sync` - 从远程仓库同步 skills
- `/skills list` - 列出所有可用 skills
- `/skills load <query>` - 查找并加载匹配的 skills
- `/skills show <skill-id>` - 查看指定 skill
- `/skills inject <id> [id...]` - 按 ID 加载 skills
- `/skills config [repo-url]` - 查看或更新配置

### 使用追踪命令

- `/skills feedback <id> useful [场景]` - 标记 skill 有用，可选添加场景描述
- `/skills feedback <id> notuseful` - 标记 skill 无用
- `/skills stats` - 查看使用统计和学习的场景

## 使用示例

### 查找并加载 Skills

```
用户: /skills load "创建 MCP Server"

系统会:
1. 从关键词 [mcp, server, 创建] 预筛选候选 skills
2. 使用 LLM 从候选中精选最相关的 5 个
3. 展示推荐并询问是否加载
```

### 反馈使用效果

```
用户: /skills feedback mcp-builder useful "构建 MCP 工具服务器"

系统会:
1. 记录该 skill 对此场景有用
2. 下次搜索类似场景时优先推荐
```

### 查看统计

```
用户: /skills stats

输出:
- 总加载次数
- 有用/无用比例
- 学习到的场景
- 最近使用记录
```

## 三层匹配策略

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

## Skills 仓库格式

你的 skills 仓库应该遵循以下结构:

```
skills-repo/
├── skills/
│   ├── react-best-practices.md
│   ├── nodejs-api-design.md
│   └── docker-compose.md
└── README.md
```

每个 skill 文件应包含 frontmatter:

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

## 维度说明

| 维度 | 可选值 |
|------|--------|
| domain | frontend, backend, devops, data, mobile, ai, general |
| scenario | development, debugging, deployment, testing, review |
| level | beginner, intermediate, advanced |
