## Why

行程列表页 (`/trips`) 当前是单列文字列表，视觉单调、信息密度低。需要改为卡片画廊布局，用美拉德（Maillard）暖色调配色提升旅行场景的氛围感，并增加标签让用户快速识别行程属性。

## What Changes

- 行程列表从单列纵排改为自适应多列卡片网格（手机 1 列、平板 2 列、桌面 3 列）
- 安装全部 shadcn/ui 组件（`npx shadcn@latest add -a`），引入 Card、Badge 等组件
- 卡片采用美拉德色系（焦糖、琥珀、浓缩咖啡、奶油色），基于行程模式或目的地生成渐变色背景
- 增加标签展示：行程模式、天数、人数、状态（已生成/已保存）、预算等
- 卡片增加圆角、悬停微动效（上浮 + 阴影/边框变化）
- 页面容器从 `max-w-2xl` 扩宽到 `max-w-6xl`

## Capabilities

### New Capabilities

- `trip-card-gallery`: 以卡片画廊形式展示行程列表，包含美拉德配色、自适应网格布局、标签系统和过渡动效

### Modified Capabilities

- `trip-planner`: REQ-008 行程列表页的视觉呈现从"卡片列表"升级为"卡片画廊网格"，功能性需求（CRUD 操作）不变，但展示形式和视觉规范更新

## Impact

- `app/trips/page.tsx` — 容器宽度、布局模式变更
- `components/trip/trip-list-item.tsx` — 重写为卡片组件，引入 shadcn Card/Badge
- `app/globals.css` — 新增美拉德色系 CSS 变量（可选，视实现方案而定）
- `components/ui/` — 新增全部 shadcn/ui 组件（~50+ 文件）
- 不涉及 API、数据库、后端逻辑变更
