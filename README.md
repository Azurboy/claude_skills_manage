# Claude Skills Manager

An intelligent Skills management system that runs as a **Claude Code Custom Skill**. It helps you sync, search, and load skills from remote repositories.

## Quick Start

### Step 1: Install as Claude Code Skill

```bash
# Clone to Claude Code skills directory
git clone https://github.com/Azurboy/claude_skills_control.git ~/.claude/skills/skills-manager

# Enter directory and build
cd ~/.claude/skills/skills-manager
npm install
npm run build
```

### Step 2: Configure Skills Repository

```bash
# Use a community skills repository (or your own)
node dist/cli.js config https://github.com/ComposioHQ/awesome-claude-skills

# Sync skills
node dist/cli.js sync
```

### Step 3: Use in Claude Code

Now you can use it directly in Claude Code:

```
You: "Find me a skill about MCP Server development"

Claude will automatically:
1. Search through all synced skills
2. Recommend the most relevant ones
3. Load them after your confirmation
4. Use the skill content to help you
```

That's it! No changes needed to your own skills repository.

---

## Why Skills Manager?

### The Problem

Imagine you have 100+ skills in your Claude Code:
- `react-hooks.md`
- `mcp-guide.md`
- `docker-deploy.md`
- `api-design.md`
- ... and 96 more

When you need help with "creating an MCP Server to connect external APIs", how do you find the right skill?

**Without Skills Manager:** Manually search through 100 files, trying to remember which one is relevant. Takes 10-20 minutes.

**With Skills Manager:** Just say "find me a skill about MCP Server" and get instant recommendations.

### The Solution: Three-Tier Matching

```
Your query: "create MCP Server"
         ↓
┌─────────────────────────────────────────┐
│ Layer 1: Keyword Pre-filtering (Local)  │
│ - Extract keywords: [mcp, server]       │
│ - Match against name/description/tags   │
│ - Filter to top 20 candidates           │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ Layer 2: LLM Selection (Smart)          │
│ - Send only 20 candidates (~1K tokens)  │
│ - LLM picks the 5 most relevant         │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ Layer 3: User Confirmation + Load       │
└─────────────────────────────────────────┘
```

**Why three layers?**

| Approach | 100 skills | 500 skills | Problem |
|----------|-----------|-----------|---------|
| Send all to LLM | ~10K tokens | ~50K tokens | Context explosion, expensive |
| Pure keyword matching | Fast but imprecise | Fast but imprecise | Can't understand semantics |
| **Three-tier** | ~1K tokens | ~1K tokens | Fast + Accurate + Controllable |

---

## Features

- **Remote Repository Sync** - Clone and update skills from GitHub repositories
- **Three-Tier Matching** - Keyword pre-filtering + LLM selection + User confirmation
- **Usage Tracking** - Learn from feedback to improve future recommendations
- **Bilingual Support** - Works with both English and Chinese queries
- **Dynamic Loading** - Load skill content directly into your Claude Code session

---

## Detailed Usage

### Commands Reference

| Command | Description |
|---------|-------------|
| `sync` | Sync skills from remote repository |
| `list` | List all available skills |
| `load <query>` | Search and find matching skills |
| `show <skill-id>` | View a specific skill |
| `inject <id> [id...]` | Load skills by ID |
| `config [repo-url]` | View or update configuration |
| `feedback <id> useful\|notuseful [scenario]` | Mark skill usefulness |
| `stats` | View usage statistics |

### Example: Search and Load

```bash
# Search for skills
node dist/cli.js load "create MCP Server"

# Output shows pre-filtered candidates:
# 1. [mcp-builder] - Guide for creating MCP servers...
# 2. [connect-apps] - Connect Claude to external apps...

# Load the skill you want
node dist/cli.js inject mcp-builder
```

### Example: Usage Feedback

After using a skill, provide feedback to improve future recommendations:

```bash
# Mark as useful with scenario description
node dist/cli.js feedback mcp-builder useful "building API integration tools"

# Mark as not useful
node dist/cli.js feedback some-skill notuseful
```

### Example: View Statistics

```bash
node dist/cli.js stats

# Output:
# Total Loads: 15
# Useful: 12 (80.0%)
# Not Useful: 3
#
# Learned Scenarios:
# - mcp-builder: "building API integration tools", "MCP development"
```

---

## Supported Skills Repository Formats

### Format 1: Standard (Recommended)

```
your-skills-repo/
├── skills/
│   ├── react-best-practices.md
│   ├── nodejs-api-design.md
│   └── docker-compose.md
└── README.md
```

### Format 2: Composio Style

```
your-skills-repo/
├── mcp-builder/
│   └── SKILL.md
├── pdf-tools/
│   └── SKILL.md
└── README.md
```

### Skill File Format

Each skill file should include frontmatter:

```markdown
---
name: React Best Practices
description: Best practices for React development
tags: [react, hooks, performance]
domain: frontend
scenario: development
level: intermediate
---

# React Best Practices

Your skill content here...
```

---

## Configuration

Configuration is stored in `~/.claude-skills-config.json`:

```json
{
  "repoUrl": "https://github.com/user/skills-repo",
  "cacheDir": "~/.claude-skills-cache",
  "autoSync": true
}
```

Usage data is stored in `~/.claude-skills-cache/usage.json`.

---

## Recommended Skills Repositories

- [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) - High-quality community skills
- [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) - Curated community skills
- [abubakarsiddik31/claude-skills-collection](https://github.com/abubakarsiddik31/claude-skills-collection) - Official and community skills collection

---

## Project Structure

```
skills-manager/
├── SKILL.md              # Claude Code Skill definition
├── src/
│   ├── index.ts          # Main command handler
│   ├── cli.ts            # CLI entry point
│   ├── config.ts         # Configuration
│   ├── types.ts          # TypeScript types
│   ├── repo/sync.ts      # Git repository sync
│   ├── index/parser.ts   # Markdown parsing
│   ├── index/store.ts    # Index storage
│   ├── matcher/keywords.ts  # Keyword extraction
│   ├── matcher/llm.ts    # LLM matching
│   ├── loader/inject.ts  # Skill loading
│   └── usage/tracker.ts  # Usage tracking
├── package.json
└── README.md
```

---

## FAQ

**Q: Do I need to modify my own skills repository?**

A: No. Skills Manager works with any skills repository that follows standard formats. Just point it to your repo URL.

**Q: Why do I need to run `npm install` and `npm run build`?**

A: The CLI is written in TypeScript and needs to be compiled. This is a one-time setup.

**Q: Can I use this without Claude Code?**

A: Yes, you can use it as a standalone CLI tool. Just run commands like `node dist/cli.js load "your query"`.

---

## License

MIT
