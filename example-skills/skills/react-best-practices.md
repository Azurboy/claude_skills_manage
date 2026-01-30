---
name: React Best Practices
description: React 开发最佳实践，包括 hooks 使用、性能优化、状态管理
tags: [react, hooks, performance, state-management]
domain: frontend
scenario: development
level: intermediate
version: "1.0"
---

# React Best Practices

## Hooks 使用规范

### useState
- 将相关状态组合在一起
- 避免过度使用 useState，考虑 useReducer 处理复杂状态

```tsx
// 好的做法
const [user, setUser] = useState({ name: '', email: '' });

// 避免
const [name, setName] = useState('');
const [email, setEmail] = useState('');
```

### useEffect
- 每个 effect 只做一件事
- 正确设置依赖数组
- 清理副作用

```tsx
useEffect(() => {
  const subscription = api.subscribe(id);
  return () => subscription.unsubscribe();
}, [id]);
```

### useMemo 和 useCallback
- 只在必要时使用（昂贵计算或引用稳定性）
- 不要过度优化

## 性能优化

### React.memo
用于避免不必要的重渲染：

```tsx
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* 渲染逻辑 */}</div>;
});
```

### 代码分割
使用 React.lazy 和 Suspense：

```tsx
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}
```

## 状态管理建议

1. **本地状态优先** - 能用 useState 解决的不要引入全局状态
2. **Context 适度使用** - 适合低频更新的全局数据（主题、用户信息）
3. **外部库按需引入** - Redux/Zustand 用于复杂状态逻辑
