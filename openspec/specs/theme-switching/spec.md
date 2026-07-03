# Theme Switching spec

## Purpose

提供深色/浅色主题切换功能，主题切换按钮位于导航栏，支持平滑过渡动画，联动高德地图样式，不影响 Clerk 认证页面。

## Requirements

### REQ-001: 主题切换按钮在导航栏可见

系统 SHALL 在导航栏右侧（登录按钮/用户头像左侧）渲染一个主题切换按钮，图标随当前主题变化（深色显示太阳，浅色显示月亮）。

#### Scenario: 用户点击切换至浅色主题
- **WHEN** 当前为深色主题且用户点击主题切换按钮
- **THEN** 页面切换为浅色主题
- **AND** 按钮图标变为月亮
- **AND** 选择持久化到 localStorage

#### Scenario: 用户点击切换至深色主题
- **WHEN** 当前为浅色主题且用户点击主题切换按钮
- **THEN** 页面切换为深色主题
- **AND** 按钮图标变为太阳

#### Scenario: 首次访问时跟随系统偏好
- **WHEN** 用户首次访问网站（localStorage 中无主题记录）
- **THEN** 系统使用 `prefers-color-scheme` 媒体查询结果作为初始主题
- **AND** 用户手动切换后覆盖系统偏好

### REQ-002: 主题切换时颜色平滑过渡

系统 SHALL 在主题切换时为 `background-color`、`color`、`border-color` 属性提供 200ms 过渡动画。

#### Scenario: 用户切换主题时视觉平滑
- **WHEN** 用户点击主题切换按钮
- **THEN** 页面背景色、文字色、边框色在 200ms 内平滑过渡到目标颜色
- **AND** 无布局抖动

### REQ-003: 高德地图样式随主题联动

系统 SHALL 根据当前主题自动切换高德地图样式：深色主题使用 `amap://styles/darkblue`，浅色主题使用 `amap://styles/normal`。

#### Scenario: 切换至浅色主题时地图联动
- **WHEN** 用户从深色切换至浅色主题
- **THEN** 高德地图样式切换为 `amap://styles/normal`

#### Scenario: 切换至深色主题时地图联动
- **WHEN** 用户从浅色切换至深色主题
- **THEN** 高德地图样式切换为 `amap://styles/darkblue`

### REQ-004: 主题切换不影响 Clerk 认证页面

系统 SHALL 保持 Clerk 托管页面（`/sign-in`、`/sign-up`）的样式不变，不受主题切换影响。

#### Scenario: 用户在认证页面
- **WHEN** 用户导航到 `/sign-in` 或 `/sign-up`
- **THEN** 认证页面样式保持不变

## History

- 2026-07-03 — initial spec (from theme-toggle-and-collapsible-cards change)
