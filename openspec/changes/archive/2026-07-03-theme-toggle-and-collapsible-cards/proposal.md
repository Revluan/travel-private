## Why

用户偏好不同（深色护眼 vs 浅色清晰），且当前只支持深色模式。行程天数多时，全部展开的卡片导致大量滚动，用户需要一个快速折叠/展开的导航方式。

## What Changes

- 在导航栏顶部增加主题切换按钮（日间/夜间），支持一键切换深浅色主题，选择持久化到 localStorage
- 高德地图暗色/亮色样式随主题联动切换
- 主题切换时 CSS 颜色、背景色、边框色平滑过渡（0.2s transition）
- 行程详情页的每日行程卡片支持折叠/展开，默认展开，点击标题区域切换
- 首次访问时跟随系统主题偏好

## Capabilities

### New Capabilities
- `theme-switching`: 深浅色主题切换，localStorage 持久化，跟随系统默认，地图样式联动

### Modified Capabilities
- `landing-page`: REQ-003 从「全局启用深色主题」改为「支持深浅色主题切换」
- `trip-planner`: REQ-005 日卡片增加折叠/展开交互

## Impact

- `app/layout.tsx` — 添加 ThemeProvider，移除硬编码 dark class
- `app/globals.css` — 添加 color/background/border transition
- `components/home/navbar.tsx` — 添加主题切换按钮
- `components/trip/trip-map.tsx` — 接收 theme prop，动态切换地图样式
- `components/trip/agent-step-card.tsx` — day card 包裹 Collapsible
- `app/trips/[id]/page.tsx` — 传递 theme 给 TripMap
- `next-themes` — 已安装，直接使用
