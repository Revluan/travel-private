# Design: Landing page

## Colors — "Night Voyage"

深色基调配合电光蓝/青渐变和暖色点缀，模拟夜间航班窗外体验。

```
Background:       #0a0e17 (深蓝黑)
Surface:          #141926 (卡片/导航)
Primary:          电光蓝 → 青渐变 (#3b82f6 → #06b6d4)
Accent (warm):    #f59e0b (琥珀金, CTA/高亮)
Text primary:     #e2e8f0
Text secondary:   #94a3b8
Border:           rgba(255,255,255,0.08)
Glass:            rgba(20,25,38,0.6) + backdrop-blur
```

暗色模式通过 Tailwind `.dark` 类激活。当前 `globals.css` 已有 `.dark` 变量定义。

## Architecture

### Page structure

```
app/page.tsx (server component)
  └─ HomePage (client component, "use client")
       ├─ Navbar (fixed, z-50)
       ├─ WindowSection (pin area, ~300vh)
       │    ├─ WindowFrame (fixed, z-40)
       │    │    └─ 圆角边框 + 玻璃反光 + 机舱壁暗区
       │    ├─ SceneLayer × 4 (absolute, z-0)
       │    │    └─ 实拍照片 <img> + 颜色叠加层
       │    └─ SceneContent × 4 (z-20)
       │         └─ 每帧的文案 (标题/描述)
       ├─ FeaturesSection
       │    └─ 3 张功能卡片
       ├─ HighlightsSection
       │    └─ 左图右文 / 右图左文交替
       ├─ CTASection
       │    └─ 大 CTA 按钮 + 背景图
       └─ Footer
```

### 舷窗 pin 区域 scroll 映射

用户滚动 0 → 300vh 期间：

- **0-25% scroll**: Scene 1 (云海) 全屏 → 缩小到 90%
- **25% mark**: crossfade to Scene 2
- **25-50% scroll**: Scene 2 (山脉) 90% → 100% → 缩小到 90%
- **50% mark**: crossfade to Scene 3
- **50-75% scroll**: Scene 3 (海岸) 90% → 100% → 缩小到 90%
- **75% mark**: crossfade to Scene 4
- **75-100% scroll**: Scene 4 (城市) 90% → 100%
- **100% (end of pin)**: 窗框 borderRadius 过渡到 0，画面展开全屏，然后 pin 释放，正常内容区从下方滚入

### 场景切换动画（缩放→交叉淡入淡出→放大）

每个场景切换周期：

```
Phase 1 (前 15%): Scene_out scale 1.0→0.9, opacity 1→0.5
Phase 2 (中 20%): Scene_out→Scene_in crossfade (opacity)
Phase 3 (后 15%): Scene_in scale 0.9→1.0, opacity 0.5→1
```

## Component tree & data flow

```
Navbar
  props: none (uses useUser from Clerk internally)
  states: signed-out (登录按钮) | signed-in (头像+下拉菜单)
  menu actions: 进入工作台 / 退出登录

WindowSection
  props:
    scenes: Array<{ image: string; title: string; subtitle: string }>
  key hook: useScroll() → useTransform(scrollYProgress, [0,1], [0,...])
  behavior: 舷窗在 pin 区内 position:fixed; 结束后释放

WindowFrame
  props: none (pure presentational overlay)
  behavior: pointer-events-none, 圆角描边 + 玻璃反光 sweep + 暗角

SceneLayer
  props: { src: string; opacity: MotionValue; scale: MotionValue }
  behavior: 绝对定位在窗框内，framer-motion 绑定 opacity/scale

SceneContent
  props: { title: string; subtitle: string; opacity: MotionValue }
  behavior: 每个场景的文案，随场景图片同步淡入淡出

FeaturesSection
  props: Array<{ icon: LucideIcon; title: string; description: string }>
  behavior: useInView staggerChildren 卡片滑入

HighlightsSection
  props: Array<{ image: string; title: string; description: string; reverse: boolean }>
  behavior: useInView 图片和文字从两侧滑入

CTASection
  props: none (uses useUser)
  states: 未登录("开始规划") | 已登录("进入工作台")
```

## Image assets

4 张 Unsplash 照片，建议下载到 `public/images/` 并压缩（目标每张 <500KB webp）。

| # | Scene | Search terms | Tone |
|---|-------|-------------|------|
| 1 | 云海之上 | `clouds airplane window sunrise` | 蓝+金，辽阔 |
| 2 | 穿越云层 | `mountains aerial view snow peaks` | 蓝绿+白，壮阔 |
| 3 | 海岸日落 | `coast sunset aerial golden hour` | 金+橙+深蓝，温暖 |
| 4 | 城市之夜 | `city lights night aerial approach` | 暖黄+暗蓝，抵达 |

## Dependencies

- `motion` (framer-motion v11+) — 安装新依赖
- 不引入额外的第三方包

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| 多张图片 + parallax 导致 FPS 下降 | `will-change: transform`, GPU 合成层, 图片压缩 |
| useScroll 的 performance | 只对 opacity/scale 做 transform，不触发 layout |
| 移动端体验差 | 本次仅桌面端，后续 change 单独处理 |
| prefers-reduced-motion | 检测媒体查询，禁用 parallax 和动画 |
