## Context

当前首页由 6 个 section 组成（Navbar、WindowSection、FeaturesSection、HighlightsSection、CTASection、Footer），其中 4 个使用了 `motion/react`（Framer Motion）实现滚动驱动的动画效果。`WindowSection` 占了 300vh 高度，内部有 4 层场景图片随滚动交叉淡入淡出。整个页面交互复杂、依赖重。

重构目标：移走所有滚动动画组件，改用一个静态 Hero section，靠排版、留白、色彩克制营造"简约高级"的感觉。Navbar 增加功能标签。

## Goals / Non-Goals

**Goals:**
- 移除所有 `motion/react` 滚动动画和组件
- 新增一个静态全屏 Hero section（背景图 + 标题 + 副标题 + CTA）
- Navbar 增加「机票搜索」「行程规划」两个链接标签
- 保持深色主题和现有配色方案（Night Voyage）
- 如 `motion/react` 无其他引用，从项目依赖中移除

**Non-Goals:**
- 不改 Footer
- 不改全局 CSS 或 `globals.css`
- 不改 auth 流程（Clerk 集成保持不变）
- 不实现「机票搜索」「行程规划」功能页面（只放链接占位）

## Decisions

### 组件结构

```
app/page.tsx
  ├── Navbar              （修改：增加 tab）
  ├── HeroSection         （新增：静态 hero）
  └── Footer              （不变）
```

删除的组件文件：
- `window-section.tsx`、`scene-layer.tsx`、`scene-content.tsx`、`window-frame.tsx`
- `features-section.tsx`、`highlights-section.tsx`、`cta-section.tsx`

### Hero Section 设计

- 全屏高度（`h-screen`），背景使用现有图片之一（推荐 `scene-1-clouds.webp`，云海意境最干净）
- 背景之上叠加 `bg-black/40` 遮罩确保白色文字可读
- 垂直居中排列：标题 → 副标题 → CTA 按钮
- 无任何 CSS 动画或 JS 交互。纯静态 HTML/CSS。
- 使用 `@clerk/nextjs` 的 `<Show>` 组件区分登录/未登录 CTA，与现有逻辑一致

### Navbar Tab

- 在 logo 和右侧 auth 区域之间，新增两个 `<Link>` 标签
- 「机票搜索」→ `/flights`
- 「行程规划」→ `/app`
- 与现有 navbar 一样使用透明/模糊背景，无需改动样式

### 依赖移除

所有 `motion/react` 引用都在待删除的文件中。Hero 是纯静态组件，Navbar 和 Footer 也不引用 motion。因此 `motion/react` 可从 `package.json` 安全移除。

## Risks / Trade-offs

- 删除 `motion/react` 后如果其他页面（如 `/app` 下）引用了它，构建会报错 → 先在 `package.json` 移除依赖前全仓搜索确认无其他引用
- Hero 是纯静态的，不像之前有多场景切换 → 这是有意为之，设计目标就是简约
