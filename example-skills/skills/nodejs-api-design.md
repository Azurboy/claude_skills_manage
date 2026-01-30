---
name: Node.js API Design
description: Node.js RESTful API 设计模式和最佳实践
tags: [nodejs, api, rest, backend, express]
domain: backend
scenario: development
level: intermediate
version: "1.0"
---

# Node.js API Design

## RESTful 设计原则

### URL 设计
- 使用名词而非动词
- 使用复数形式
- 层级关系用嵌套表示

```
GET    /users           # 获取用户列表
GET    /users/:id       # 获取单个用户
POST   /users           # 创建用户
PUT    /users/:id       # 更新用户
DELETE /users/:id       # 删除用户
GET    /users/:id/posts # 获取用户的文章
```

### HTTP 状态码
- 200: 成功
- 201: 创建成功
- 400: 请求错误
- 401: 未认证
- 403: 无权限
- 404: 未找到
- 500: 服务器错误

## Express 中间件模式

### 错误处理中间件

```javascript
// 错误处理中间件（放在最后）
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});
```

### 请求验证

```javascript
const validateUser = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  next();
};

app.post('/users', validateUser, createUser);
```

## 安全最佳实践

1. **输入验证** - 使用 Joi 或 Zod 验证请求数据
2. **参数化查询** - 防止 SQL 注入
3. **速率限制** - 使用 express-rate-limit
4. **CORS 配置** - 限制允许的来源
5. **Helmet** - 设置安全 HTTP 头
