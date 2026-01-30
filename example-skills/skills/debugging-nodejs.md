---
name: Node.js Debugging
description: Node.js 应用调试技巧和工具使用
tags: [nodejs, debugging, devtools, troubleshooting]
domain: backend
scenario: debugging
level: intermediate
version: "1.0"
---

# Node.js Debugging

## 内置调试器

### 启动调试模式

```bash
# 使用 inspect 标志
node --inspect app.js

# 在第一行暂停
node --inspect-brk app.js

# 指定端口
node --inspect=9229 app.js
```

### Chrome DevTools 调试

1. 启动 `node --inspect app.js`
2. 打开 Chrome，访问 `chrome://inspect`
3. 点击 "Open dedicated DevTools for Node"

## console 调试技巧

```javascript
// 格式化输出
console.log('%o', complexObject);

// 表格显示
console.table([{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }]);

// 计时
console.time('operation');
// ... 操作
console.timeEnd('operation');

// 堆栈追踪
console.trace('Trace point');

// 条件日志
console.assert(value > 0, 'Value should be positive');
```

## 常见问题排查

### 内存泄漏

```javascript
// 使用 heapdump
const heapdump = require('heapdump');
heapdump.writeSnapshot('/tmp/heap-' + Date.now() + '.heapsnapshot');

// 监控内存使用
setInterval(() => {
  const used = process.memoryUsage();
  console.log(`Memory: ${Math.round(used.heapUsed / 1024 / 1024)} MB`);
}, 5000);
```

### 异步问题

```javascript
// 使用 async_hooks 追踪
const async_hooks = require('async_hooks');

const hook = async_hooks.createHook({
  init(asyncId, type, triggerAsyncId) {
    console.log(`Init: ${type} (${asyncId}) triggered by ${triggerAsyncId}`);
  }
});
hook.enable();
```

### 未捕获异常

```javascript
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
```

## VS Code 调试配置

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug App",
      "program": "${workspaceFolder}/app.js",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```
