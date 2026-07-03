## Context

当前项目通过 `<html class="dark">` 硬编码深色主题，`:root` 中虽定义了浅色变量但未使用。`next-themes` 已安装（`^0.4.6`），但尚未集成。高德地图通过 `mapStyle: "amap://styles/darkblue"` 硬编码暗色样式。行程详情页日卡片当前无折叠功能，多日行程需要大量滚动。

## Goals / Non-Goals

**Goals:**
- 用户可在导航栏一键切换深浅色主题，选择持久化到 localStorage
- 首次访问时跟随系统 `prefers-color-scheme` 偏好
- 高德地图样式随主题联动（深色 → `darkblue`，浅色 → `normal`）
- 主题切换时所有颜色平滑过渡（`transition: 200ms`）
- 行程详情页日卡片支持折叠/展开，默认展开

**Non-Goals:**
- 不修改机票搜索、工作台等次要页面的硬编码颜色（保持当前深色行为）
- 不修改 Clerk 认证页面的主题
- 不添加除日/夜切换外的其他主题变体

## Decisions

### D1: 使用 next-themes 管理主题状态

**选择**: `next-themes` `ThemeProvider` with `attribute="class"`

**原因**: 已安装，与 shadcn/ui 的 `.dark` class 约定兼容，内置 `localStorage` 持久化和系统偏好检测，避免手动管理状态。

**备选方案**: 手动 React context + localStorage — 功能等价但需要更多代码，且 `next-themes` 已处理好 SSR 闪烁问题（通过 `script` 注入 `class` 避免 hydration mismatch）。

### D2: 地图主题联动通过 prop 传递

**选择**: `TripMap` 接收 `theme?: string` prop，在 `useEffect` 中检测变化后调用 `map.setMapStyle()`

**原因**: AMap 实例支持运行时 `setMapStyle()` 切换样式，无需重建地图。`TripMap` 本身已是 `"use client"` 组件，可直接消费 prop。

**备选方案**: 在 `TripMap` 内部通过 `useTheme()` 读取 — 可行但增加组件对 next-themes 的耦合，prop 方式更通用。

**样式映射**:
| 主题 | AMap 样式 |
|------|----------|
| `dark` | `amap://styles/darkblue` |
| `light` | `amap://styles/normal` |

### D3: Collapsible 使用 @base-ui/react/collapsible

**选择**: 使用已有的 `components/ui/collapsible.tsx`（封装 `@base-ui/react/collapsible`）

**原因**: 已安装，shadcn/ui 原生方案，无需额外依赖。`CollapsibleTrigger` 天然支持 `aria-expanded` 无障碍属性。

### D4: CSS transition 放在 globals.css 全局层

**选择**: 在 `globals.css` 中为 `*` 或 `body` 添加 `transition: background-color 0.2s, color 0.2s, border-color 0.2s`

**原因**: 全局覆盖，所有组件自动受益。仅对颜色相关属性做过渡，不影响布局动画（width、transform 等），避免副作用。

## Risks / Trade-offs

- **[Risk] 地图切换样式时短暂闪烁** → **Mitigation**: `setMapStyle()` 是 AMap 内置方法，切换应在同一帧完成，闪烁概率低。如有问题可用 `requestAnimationFrame` 包裹。
- **[Risk] 高德地图 `normal` 样式与浅色主题视觉不协调** → **Mitigation**: 高德 `normal` 是标准浅色地图，与浅色 UI 搭配自然。如不满意可后续微调地图配置。
- **[Risk] 非目标页面在浅色模式下显示不佳** → **Mitigation**: 明确 scoped-out，后续迭代再覆盖。

## Open Questions

- 无。所有技术决策已在探索阶段达成一致。
