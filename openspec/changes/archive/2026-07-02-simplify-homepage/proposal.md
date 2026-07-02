## Why

当前首页以复杂的滚动驱动动画为核心（全屏场景淡入淡出、motion/react 入场动画），交互重、代码多。目标是将首页重构为一个静态的、靠排版和留白说话的高级简约页面，移除所有滚动触发动画。

## What Changes

- 移除 `WindowSection` 及其依赖的 `SceneLayer`、`SceneContent`、`WindowFrame` 组件
- 移除 `FeaturesSection`、`HighlightsSection`、`CTASection` 组件
- 新增一个静态 Hero section：全屏背景图 + 标题 + 副标题 + CTA 按钮
- 改造 `Navbar`：增加「机票搜索」「行程规划」两个导航 tab
- 保留 `Footer` 不变
- 移除 `motion/react` 依赖（如无其他引用）
- **BREAKING**: 移除 REQ-002（全屏滚动动画）、REQ-006（动画无障碍偏好）—— 这两个需求不再适用

## Capabilities

### New Capabilities

（无新增 capability）

### Modified Capabilities

- `landing-page`: 移除滚动动画需求（REQ-002、REQ-006），修改导航栏需求（REQ-001 增加 tab），修改 CTA 展示方式（REQ-004 从场景内 CTA 改为静态 Hero CTA）

## Impact

- 删除 `components/home/window-section.tsx`、`scene-layer.tsx`、`scene-content.tsx`、`window-frame.tsx`
- 删除 `components/home/features-section.tsx`、`highlights-section.tsx`、`cta-section.tsx`
- 新增 `components/home/hero-section.tsx`
- 修改 `components/home/navbar.tsx`（增加 tab）
- 修改 `app/page.tsx`（简化为 Navbar + Hero + Footer）
- 如 `motion/react` 无其他引用则从 `package.json` 移除
