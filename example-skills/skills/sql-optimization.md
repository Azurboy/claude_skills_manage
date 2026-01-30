---
name: SQL Optimization
description: SQL 查询优化技巧和性能调优
tags: [sql, database, performance, optimization]
domain: data
scenario: development
level: advanced
version: "1.0"
---

# SQL Optimization

## 索引优化

### 创建有效索引

```sql
-- 单列索引
CREATE INDEX idx_users_email ON users(email);

-- 复合索引（注意列顺序）
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);

-- 部分索引
CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';

-- 覆盖索引
CREATE INDEX idx_orders_covering ON orders(user_id, status, total);
```

### 索引使用原则

1. **选择性高的列** - 唯一值多的列更适合索引
2. **查询频率** - 频繁查询的列优先
3. **复合索引顺序** - 最常用的列放前面
4. **避免过度索引** - 影响写入性能

## 查询优化

### EXPLAIN 分析

```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 123;
```

关注指标：
- `Seq Scan` vs `Index Scan`
- `rows` 估计值
- `actual time`

### 常见优化

```sql
-- 避免 SELECT *
SELECT id, name, email FROM users WHERE id = 1;

-- 使用 EXISTS 替代 IN（大数据集）
SELECT * FROM orders o
WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = o.user_id AND u.status = 'active');

-- 分页优化（使用游标）
SELECT * FROM orders WHERE id > 1000 ORDER BY id LIMIT 20;

-- 避免函数在索引列上
-- 差: WHERE YEAR(created_at) = 2024
-- 好: WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'
```

## JOIN 优化

```sql
-- 确保 JOIN 列有索引
SELECT o.*, u.name
FROM orders o
INNER JOIN users u ON o.user_id = u.id
WHERE o.status = 'pending';

-- 小表驱动大表
-- 将过滤条件多的表放在前面
```

## 批量操作

```sql
-- 批量插入
INSERT INTO logs (message, level, created_at)
VALUES
  ('msg1', 'info', NOW()),
  ('msg2', 'error', NOW()),
  ('msg3', 'warn', NOW());

-- 批量更新
UPDATE orders SET status = 'shipped'
WHERE id IN (1, 2, 3, 4, 5);
```

## 监控与分析

```sql
-- PostgreSQL: 慢查询日志
-- 在 postgresql.conf 中设置
-- log_min_duration_statement = 1000  -- 记录超过1秒的查询

-- 查看表统计
SELECT relname, n_tup_ins, n_tup_upd, n_tup_del
FROM pg_stat_user_tables;
```
