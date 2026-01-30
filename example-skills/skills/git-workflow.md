---
name: Git Workflow
description: Git 工作流程和团队协作最佳实践
tags: [git, workflow, collaboration, version-control]
domain: devops
scenario: development
level: beginner
version: "1.0"
---

# Git Workflow

## 分支策略

### Git Flow

```
main (production)
  └── develop
        ├── feature/user-auth
        ├── feature/payment
        └── release/v1.0
              └── hotfix/critical-bug
```

### 简化流程 (GitHub Flow)

```
main
  ├── feature/add-login
  ├── feature/update-ui
  └── fix/bug-123
```

## 常用命令

### 分支操作

```bash
# 创建并切换分支
git checkout -b feature/new-feature

# 查看所有分支
git branch -a

# 删除本地分支
git branch -d feature/old-feature

# 删除远程分支
git push origin --delete feature/old-feature
```

### 提交规范

```bash
# 提交格式
git commit -m "type(scope): description"

# 类型
# feat: 新功能
# fix: 修复 bug
# docs: 文档更新
# style: 代码格式
# refactor: 重构
# test: 测试
# chore: 构建/工具
```

### 合并策略

```bash
# 合并（保留历史）
git merge feature/branch

# 变基（线性历史）
git rebase main

# Squash 合并
git merge --squash feature/branch
```

## Pull Request 最佳实践

1. **小而专注** - 每个 PR 只做一件事
2. **清晰描述** - 说明改动原因和影响
3. **自我审查** - 提交前先自己 review
4. **及时响应** - 快速处理评论和建议
5. **保持更新** - 定期 rebase 主分支

## 冲突解决

```bash
# 1. 更新主分支
git checkout main
git pull

# 2. 切回功能分支并 rebase
git checkout feature/branch
git rebase main

# 3. 解决冲突后
git add .
git rebase --continue

# 4. 强制推送（仅限个人分支）
git push --force-with-lease
```
