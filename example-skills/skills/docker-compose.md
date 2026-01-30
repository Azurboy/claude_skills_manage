---
name: Docker Compose
description: Docker Compose 配置和多容器应用编排
tags: [docker, compose, devops, containers]
domain: devops
scenario: deployment
level: intermediate
version: "1.0"
---

# Docker Compose

## 基础配置

### docker-compose.yml 结构

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## 常用命令

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f web

# 停止服务
docker-compose down

# 重建镜像
docker-compose build --no-cache

# 进入容器
docker-compose exec web sh
```

## 多环境配置

### 开发环境 (docker-compose.override.yml)

```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      target: development
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
```

### 生产环境 (docker-compose.prod.yml)

```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      target: production
    restart: always
    environment:
      - NODE_ENV=production
```

使用: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d`

## 健康检查

```yaml
services:
  web:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```
