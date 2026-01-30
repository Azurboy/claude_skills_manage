# Example Skills Collection

This is an example skills repository for the Claude Skills Manager.

## Structure

```
skills/
├── react-best-practices.md    # Frontend - React development
├── nodejs-api-design.md       # Backend - API design patterns
├── docker-compose.md          # DevOps - Container orchestration
├── git-workflow.md            # DevOps - Version control
├── debugging-nodejs.md        # Backend - Debugging techniques
└── sql-optimization.md        # Data - Database optimization
```

## Skill Format

Each skill uses YAML frontmatter for metadata:

```markdown
---
name: Skill Name
description: Brief description
tags: [tag1, tag2]
domain: frontend|backend|devops|data|mobile|ai
scenario: development|debugging|deployment|testing|review
level: beginner|intermediate|advanced
---

# Skill Content
...
```

## Usage

1. Configure this repository in Claude Skills Manager
2. Run `/skills sync` to index all skills
3. Use `/skills load "your query"` to find relevant skills
