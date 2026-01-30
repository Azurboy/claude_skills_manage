# Claude Skills Manager

智能 Skills 管理系统，为 Claude Code 提供 skills 的同步、搜索和加载功能。

## 功能特性

- **远程仓库同步** - 从 GitHub 仓库克隆和更新 skills
- **三层匹配策略** - 关键词预筛选 + LLM 精选 + 用户确认，高效处理 100+ skills
- **使用追踪** - 自动检测 + 手动反馈，学习适用场景
- **中英文支持** - 支持中英文关键词提取和匹配
- **动态加载** - 将 skill 内容直接加载到 Claude Code 会话中

## 安装

```bash
npm install
npm run build
```

## 使用方法

### 配置仓库

```bash
/skills config https://github.com/your/skills-repo
```

### 同步 Skills

```bash
/skills sync
```

### 查找并加载 Skills

```bash
/skills load "React hooks 开发"
```

### 列出所有 Skills

```bash
/skills list
```

### 查看指定 Skill

```bash
/skills show react-best-practices
```

### 使用反馈

```bash
# 标记有用（可选添加场景描述）
/skills feedback react-best-practices useful "React 组件开发"

# 标记无用
/skills feedback some-skill notuseful
```

### 查看统计

```bash
/skills stats
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

## Skills 仓库格式

你的 skills 仓库应该遵循以下结构：

```
skills-repo/
├── skills/
│   ├── react-best-practices.md
│   ├── nodejs-api-design.md
│   └── docker-compose.md
└── README.md
```

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

## 打包为独立 Skill

```bash
# 安装依赖
npm install

# 构建并打包
npm run build:bundle

# 输出文件: bundle/skills-cli.js
```

## License

MIT
