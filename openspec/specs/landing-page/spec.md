# Landing page spec

## Purpose

为 `/` 路径提供公开首页，展示产品定位并引导用户登录或进入工作台。

## Requirements

### REQ-001: 导航栏在页面顶部固定展示

系统 SHALL 在页面顶部渲染固定导航栏，左侧显示 logo/项目名，logo 右侧显示功能导航标签，右侧根据登录状态显示不同内容。

#### Scenario: 未登录用户看到导航栏
- **WHEN** 未登录用户访问 `/`
- **THEN** 导航栏左侧显示项目名/logo
- **AND** logo 右侧显示「机票搜索」「行程规划」两个导航链接
- **AND** 右侧显示「登录」按钮
- **AND** 导航栏始终固定在视口顶部

#### Scenario: 已登录用户看到导航栏
- **WHEN** 已登录用户访问 `/`
- **THEN** 导航栏左侧显示项目名/logo
- **AND** logo 右侧显示「机票搜索」「行程规划」两个导航链接
- **AND** 右侧显示用户头像
- **AND** 点击头像展开下拉菜单，包含「进入工作台」和「退出登录」选项

#### Scenario: 导航栏半透明背景
- **WHEN** 用户滚动页面
- **THEN** 导航栏呈现毛玻璃效果（背景半透明 + 模糊）

### REQ-002: 首页展示静态 Hero 区域

系统 SHALL 在首页展示全屏静态 Hero 区域，包含背景图、标题、副标题和行动号召。

#### Scenario: 用户进入首页看到 Hero
- **WHEN** 用户访问 `/`
- **THEN** 页面展示全屏 Hero 区域
- **AND** 背景为一张大幅实景照片
- **AND** 背景图之上显示半透明遮罩确保文字可读
- **AND** 居中显示标题「规划你的下一次完美旅行」
- **AND** 标题下方显示副标题「智能行程编排，从简开始」
- **AND** 副标题下方显示 CTA 按钮

#### Scenario: Hero 区域为静态内容
- **WHEN** 用户在 Hero 区域内滚动
- **THEN** Hero 区域随页面正常滚动
- **AND** 无任何视差、缩放、淡入淡出等动画效果

### REQ-003: 支持深浅色主题切换

系统 SHALL 默认使用深色主题，并在导航栏提供主题切换按钮，允许用户在深浅色之间切换，选择持久化到 localStorage。

#### Scenario: 页面以深色模式渲染（默认）
- **WHEN** 用户首次访问且系统偏好为深色或用户上次选择了深色主题
- **THEN** 页面背景为深色
- **AND** 文字为浅色
- **AND** 所有 UI 组件使用深色主题样式

#### Scenario: 页面以浅色模式渲染
- **WHEN** 用户首次访问且系统偏好为浅色或用户点击切换至浅色主题
- **THEN** 页面背景为浅色
- **AND** 文字为深色
- **AND** 所有 UI 组件使用浅色主题样式

#### Scenario: 主题选择持久化
- **WHEN** 用户切换主题后关闭网站并重新访问
- **THEN** 页面使用用户上次选择的主题渲染

### REQ-004: 首页提供注册/登录引导

系统 SHALL 在首页提供明确的行动号召，引导用户进入产品。

#### Scenario: 未登录用户在 Hero 区域看到 CTA
- **WHEN** 未登录用户查看首页
- **THEN** Hero 区域展示「规划你的下一次完美旅行」标题
- **AND** 显示「开始规划」按钮，点击跳转到 `/sign-in`

#### Scenario: 已登录用户看到不同的 CTA
- **WHEN** 已登录用户查看首页
- **THEN** CTA 按钮文案变为「进入工作台」
- **AND** 按钮点击跳转到 `/app`

### REQ-005: 深色模式下视觉配色符合设计规范

系统 SHALL 使用「Night Voyage」配色方案，深蓝黑基底配合电光蓝渐变和琥珀金点缀。

#### Scenario: 配色符合设计稿
- **WHEN** 页面渲染完成
- **THEN** 背景色为深蓝黑
- **AND** 主要交互元素使用电光蓝到青色的渐变
- **AND** CTA 按钮使用琥珀金色调

## History

- 2026-07-01 — initial spec (from landing-page change)
- 2026-07-02 — simplified to static hero layout; removed scroll animations; added nav tabs (from simplify-homepage change)
- 2026-07-03 — REQ-003 MODIFIED: dark-only → theme toggle with system preference and persistence (from theme-toggle-and-collapsible-cards change)
