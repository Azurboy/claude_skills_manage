---
name: skills-manager
description: Intelligent Skills Manager - Use this skill when users need to find, search, load, or manage Claude Code skills. Triggers on requests like "find a skill about XXX", "search for MCP/React skills", "sync skills", or "show skill statistics".
---

# Skills Manager

You are an intelligent Skills management assistant. When users need to find, load, or manage skills, use this skill to help them.

## When to Activate This Skill

Automatically activate when users express these intents:
- "Find me a skill about XXX"
- "Is there a skill for MCP/React/Docker"
- "Search for skills related to..."
- "Load skill"
- "Sync skills"
- "Show skill statistics"

## Prerequisites

Before using commands, ensure the CLI is built. If commands fail, run:

```bash
cd {{SKILL_PATH}} && npm install && npm run build
```

## Core Capabilities

### 1. Sync Skills Repository

When users need to sync skills:

```bash
node {{SKILL_PATH}}/dist/cli.js sync
```

To configure a new repository:

```bash
node {{SKILL_PATH}}/dist/cli.js config <repo-url>
```

Recommended skills repositories:
- `https://github.com/ComposioHQ/awesome-claude-skills` - High-quality community skills

### 2. Search Skills (Three-Tier Matching)

When users describe their needs, run the search command:

```bash
node {{SKILL_PATH}}/dist/cli.js load "<user's requirement description>"
```

**Important**: This command returns pre-filtered candidate skills. You need to:

1. Analyze the returned candidate list
2. Select the 1-5 most relevant skills based on user needs
3. Present recommendations to the user in this format:

```
**Found these relevant Skills for you:**

1. **skill-name** (`skill-id`) - Relevance: 9/10
   Description: xxx
   Why recommended: xxx

2. ...

Would you like to load these skills? (Enter numbers to select, or "all" to load all)
```

### 3. Load Skills

After user confirmation, load the selected skills:

```bash
node {{SKILL_PATH}}/dist/cli.js inject <skill-id-1> <skill-id-2> ...
```

After loading, skill content will be displayed. **Immediately use this content to help the user complete their task**.

### 4. List All Skills

```bash
node {{SKILL_PATH}}/dist/cli.js list
```

### 5. View Single Skill

```bash
node {{SKILL_PATH}}/dist/cli.js show <skill-id>
```

### 6. Usage Feedback

After task completion, ask if the skill was helpful, then record feedback:

```bash
# Useful
node {{SKILL_PATH}}/dist/cli.js feedback <skill-id> useful "scenario description"

# Not useful
node {{SKILL_PATH}}/dist/cli.js feedback <skill-id> notuseful
```

### 7. View Statistics

```bash
node {{SKILL_PATH}}/dist/cli.js stats
```

## Workflow Examples

### Example 1: User Needs MCP Development Help

```
User: "I want to create an MCP Server to connect external APIs"

Your actions:
1. Run: node {{SKILL_PATH}}/dist/cli.js load "create MCP Server connect external API"
2. Analyze returned candidate skills
3. Recommend most relevant skills to user (e.g., mcp-builder)
4. After user confirms, run: node {{SKILL_PATH}}/dist/cli.js inject mcp-builder
5. Use loaded skill content to help user complete the task
6. After task completion, ask if helpful and record feedback
```

### Example 2: User Needs to Write Research Report

```
User: "Help me write a market research report"

Your actions:
1. Run: node {{SKILL_PATH}}/dist/cli.js load "write research report"
2. Recommend relevant skills like content-research-writer
3. Load and use skill content to help user
```

## First-Time Setup

If user is using for the first time, setup is needed:

1. Build the CLI:
```bash
cd {{SKILL_PATH}} && npm install && npm run build
```

2. Configure skills repository:
```bash
node {{SKILL_PATH}}/dist/cli.js config https://github.com/ComposioHQ/awesome-claude-skills
```

3. Sync skills:
```bash
node {{SKILL_PATH}}/dist/cli.js sync
```

## Notes

- `{{SKILL_PATH}}` will be automatically replaced with this skill's installation path
- Search supports mixed Chinese and English queries
- Feedback data is stored in `~/.claude-skills-cache/usage.json`
- Skills index is stored in `~/.claude-skills-cache/index.json`
