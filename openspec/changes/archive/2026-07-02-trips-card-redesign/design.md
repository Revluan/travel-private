## Context

行程列表页 (`/trips`) 当前为单列纵排布局（`max-w-2xl`），每行一个 `TripListItem` 组件。项目已使用 shadcn/ui v4（`base-nova` 风格），但仅安装了 button 组件。深色主题的 CSS 变量已在 `app/globals.css` 的 `.dark` 选择器中定义。

用户希望提升视觉表现：卡片画廊、美拉德暖色系、自适应网格、标签系统。

## Goals / Non-Goals

**Goals:**
- 将行程列表从单列改为自适应多列卡片网格（1→2→3 列）
- 应用美拉德（Maillard）配色方案：焦糖、琥珀、浓缩咖啡、奶油色
- 安装全部 shadcn/ui 组件，引入 Card 和 Badge
- 卡片展示行程模式、天数、人数、状态等标签
- 卡片采用渐变色背景（基于行程模式区分色相）
- 圆角卡片 + 悬停微动效（上浮 + 边框/阴影变化）

**Non-Goals:**
- 不修改数据库或 API
- 不改变 CRUD 功能逻辑（查看/编辑/删除行为不变）
- 不添加卡片封面图片（当前无图片数据源）
- 不修改 `/trips/[id]` 详情页
- 不修改 `/trips/new` 新建页

## Decisions

### D1: 网格布局 — CSS Grid `grid-template-columns: repeat(auto-fill, minmax(...))`

选择 CSS Grid 的 `auto-fill` + `minmax` 而非固定断点 `grid-cols-{n}`，因为：
- 不需要为每个断点手动指定列数
- 容器从 `max-w-2xl` 扩宽到 `max-w-6xl`，卡片最小宽度 ~300px
- 自动填充：`grid-cols-[repeat(auto-fill,minmax(300px,1fr))]`

备选：Tailwind 响应式 `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` — 更可控但需要手动管理断点。采用 auto-fill 以更灵活。

### D2: 美拉德配色 — 基于模式的渐变色卡片背景

五种行程模式各对应一个美拉德色系渐变：

| 模式 | 渐变色 | 意象 |
|---|---|---|
| 特种兵打卡 | `#8B4513 → #A0522D` (马鞍棕) | 活力、紧凑 |
| 休闲模式 | `#C68A54 → #DEB887` (焦糖→原木) | 温暖、放松 |
| 度假模式 | `#B8860B → #DAA520` (暗金→金菊) | 阳光、奢华 |
| 美食之旅 | `#A0522D → #CD853F` (赭色→秘鲁) | 食欲、温暖 |
| 文化探索 | `#6B3A2A → #8B5E3C` (深棕→咖啡) | 沉稳、底蕴 |

实现方式：在卡片组件内用 `mode` prop 查表返回 Tailwind 渐变类名或内联 `style`。背景为半透明叠加在深色卡片底上，保持可读性。

备选：CSS 变量集中定义 — 过度工程化，5 个渐变不值得抽象。

### D3: shadcn 组件引入 — 全量安装 + 仅使用 Card/Badge

执行 `npx shadcn@latest add -a` 安装全部组件（~50+）。虽然当前只用到 Card 和 Badge，但一次性安装避免后续逐个添加的仪式感。shadcn 组件是复制到项目中的源码，不影响 bundle size（tree-shaking）。

### D4: 标签系统 — Badge 组件 + 图标

每个卡片展示以下标签（使用 shadcn Badge）：

- 行程模式（彩色 Badge，与渐变色对应）
- 天数（例如"5 天"）
- 人数（例如"2 人"）
- 状态：`generated` → "AI 生成"，`saved` → "已保存"

标签排列在卡片标题下方、概览上方，使用 `flex flex-wrap gap-1.5`。

### D5: 动效 — CSS transition + hover 状态

悬停效果：
- `transform: translateY(-4px)` — 轻微上浮
- `box-shadow` 增强 — 琥珀色光晕（`0 4px 20px rgba(180, 120, 60, 0.15)`）
- `border-color` 从默认过渡到琥珀色
- `transition: all 0.2s ease-out`

不使用 Framer Motion 等动画库 — 纯 CSS transition 足够。

### D6: 圆角 — `rounded-2xl`（16px）

卡片使用 `rounded-2xl`（对应 `--radius-xl`，约 16px），与项目已有的圆角系统一致。

## Risks / Trade-offs

- [全量安装 shadcn] → 新增 ~50 个组件文件，增加 `components/ui/` 目录体积。缓解：shadcn 组件是复制源码，不增加运行时开销；可按需删除不用的组件
- [美拉德色系硬编码] → 颜色直接写在组件中而非 CSS 变量，后续换肤需改多处。缓解：当前只有 5 个渐变，且与模式一一对应，抽取为常量对象即可集中管理
- [auto-fill 网格可能产生不完整末行] → 行程数为 4 时，3 列布局末行只 1 个卡片。缓解：这是 card grid 的正常行为，不视为问题
