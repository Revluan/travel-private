## 1. 删除旧组件

- [x] 1.1 删除 `components/home/window-section.tsx`
- [x] 1.2 删除 `components/home/scene-layer.tsx`
- [x] 1.3 删除 `components/home/scene-content.tsx`
- [x] 1.4 删除 `components/home/window-frame.tsx`
- [x] 1.5 删除 `components/home/features-section.tsx`
- [x] 1.6 删除 `components/home/highlights-section.tsx`
- [x] 1.7 删除 `components/home/cta-section.tsx`

## 2. 新增 Hero Section

- [x] 2.1 创建 `components/home/hero-section.tsx`：全屏静态 hero，包含背景图、遮罩、标题、副标题、CTA 按钮（使用 Clerk `<Show>` 区分登录态）

## 3. 修改 Navbar

- [x] 3.1 在 `components/home/navbar.tsx` 中 logo 右侧增加「机票搜索」（`/flights`）和「行程规划」（`/app`）两个导航链接

## 4. 更新首页

- [x] 4.1 修改 `app/page.tsx`，引用 Navbar、HeroSection、Footer

## 5. 清理依赖

- [x] 5.1 全仓搜索确认 `motion/react` 无其他引用后从 `package.json` 移除，运行 `pnpm install`

## 6. 验证

- [x] 6.1 运行 `pnpm build` 确认构建通过
- [x] 6.2 运行 `pnpm dev`，浏览器访问首页确认：Hero 静态展示、Navbar 有导航标签、CTA 按钮正常显示、Footer 正常显示
