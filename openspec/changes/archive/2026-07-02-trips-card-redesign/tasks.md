## 1. 安装 shadcn/ui 全量组件

- [x] 1.1 执行 `npx shadcn@latest add -a` 安装全部 shadcn/ui 组件
- [x] 1.2 验证 `components/ui/card.tsx` 和 `components/ui/badge.tsx` 存在且可导入

## 2. 创建美拉德配色常量

- [x] 2.1 在 `lib/constants/maillard.ts` 中定义模式→渐变色映射（5 个模式各对应一组渐变 CSS 值）
- [x] 2.2 定义模式→标签色映射（用于 Badge 配色）
- [x] 2.3 定义共享的卡片样式常量（圆角、阴影、过渡）

## 3. 重写行程卡片组件

- [x] 3.1 在 `components/trip/trip-card.tsx` 创建新卡片组件，使用 shadcn Card（CardHeader/CardContent/CardFooter）
- [x] 3.2 实现基于 `mode` prop 的美拉德渐变背景
- [x] 3.3 使用 shadcn Badge 展示标签：模式、天数、人数、状态
- [x] 3.4 实现悬停动效（上浮 4px + 琥珀色光晕 + 边框变色 + 200ms 过渡）
- [x] 3.5 保留现有的查看/编辑/删除操作按钮（从 TripListItem 迁移）
- [x] 3.6 应用 `rounded-2xl` 圆角

## 4. 更新行程列表页

- [x] 4.1 将 `app/trips/page.tsx` 容器从 `max-w-2xl` 改为 `max-w-6xl`
- [x] 4.2 将 `space-y-3` 单列布局改为 CSS Grid 自适应网格（`grid-cols-[repeat(auto-fill,minmax(300px,1fr))]`）
- [x] 4.3 将 `TripListItem` 替换为 `TripCard`
- [x] 4.4 更新空状态和加载状态的占位区域以适配宽容器

## 5. 验证

- [x] 5.1 `pnpm typecheck` 通过
- [x] 5.2 `pnpm build` 构建成功（SSR 兼容：Card 组件无 `use client` 冲突）
- [x] 5.3 在浏览器验证：桌面端 3 列、平板端 2 列、手机端 1 列
- [x] 5.4 验证每种行程模式的卡片渐变色正确
- [x] 5.5 验证悬停动效流畅
- [x] 5.6 验证标签信息正确展示
