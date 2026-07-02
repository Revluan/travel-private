## ADDED Requirements

### Requirement: 行程卡片画廊网格布局

系统 SHALL 在 `/trips` 页面以自适应多列卡片网格展示行程列表，使用 CSS Grid `auto-fill` + `minmax` 实现列数自适应。

#### Scenario: 桌面端多列展示

- **WHEN** 用户在大屏幕（宽度 ≥ 1024px）访问 `/trips`
- **THEN** 行程卡片以 3 列网格展示
- **AND** 每张卡片最小宽度为 300px

#### Scenario: 平板端两列展示

- **WHEN** 用户在中等屏幕（宽度 640px ~ 1023px）访问 `/trips`
- **THEN** 行程卡片以 2 列展示

#### Scenario: 手机端单列展示

- **WHEN** 用户在手机屏幕（宽度 < 640px）访问 `/trips`
- **THEN** 行程卡片以单列展示

#### Scenario: 空列表状态

- **WHEN** 用户没有行程记录
- **THEN** 页面居中显示空状态提示和"创建第一个行程"引导链接

### Requirement: 美拉德色系卡片背景

系统 SHALL 为每张行程卡片提供基于行程模式的美拉德（Maillard）色系渐变背景，五种模式各对应不同的暖色调渐变。

#### Scenario: 特种兵打卡模式卡片

- **WHEN** 行程模式为"特种兵打卡"
- **THEN** 卡片背景使用马鞍棕色系渐变

#### Scenario: 休闲模式卡片

- **WHEN** 行程模式为"休闲模式"
- **THEN** 卡片背景使用焦糖至原木色系渐变

#### Scenario: 度假模式卡片

- **WHEN** 行程模式为"度假模式"
- **THEN** 卡片背景使用暗金至金菊色系渐变

#### Scenario: 美食之旅模式卡片

- **WHEN** 行程模式为"美食之旅"
- **THEN** 卡片背景使用赭色至秘鲁色系渐变

#### Scenario: 文化探索模式卡片

- **WHEN** 行程模式为"文化探索"
- **THEN** 卡片背景使用深棕至咖啡色系渐变

### Requirement: 卡片标签系统

系统 SHALL 在每张行程卡片上展示标签，包括行程模式、天数、人数和生成状态。

#### Scenario: 卡片展示多个标签

- **WHEN** 用户访问 `/trips` 且存在行程
- **THEN** 每张卡片显示行程模式标签（彩色）、天数标签、人数标签
- **AND** 已生成的行程显示"AI 生成"状态标签，已保存的行程显示"已保存"状态标签

#### Scenario: 标签响应式排列

- **WHEN** 标签总宽度超过卡片宽度
- **THEN** 标签自动换行（`flex-wrap`）

### Requirement: 卡片悬停动效

系统 SHALL 为每张行程卡片提供悬停时的过渡动效。

#### Scenario: 用户悬停卡片

- **WHEN** 用户将鼠标悬停在行程卡片上
- **THEN** 卡片向上浮动 4px
- **AND** 卡片边框变为琥珀色
- **AND** 卡片阴影增强带琥珀色光晕
- **AND** 过渡动画在 200ms 内完成

### Requirement: 卡片圆角

系统 SHALL 使用 `rounded-2xl`（16px）圆角渲染行程卡片。

#### Scenario: 卡片圆角展示

- **WHEN** 用户访问 `/trips`
- **THEN** 所有行程卡片的圆角半径为 16px

### Requirement: shadcn/ui 全量组件安装

系统 SHALL 通过 `npx shadcn@latest add -a` 安装全部 shadcn/ui 组件到 `components/ui/` 目录。

#### Scenario: 组件可导入

- **WHEN** 安装完成后
- **THEN** `components/ui/` 目录包含全部 shadcn/ui 组件文件
- **AND** Card 和 Badge 组件可直接从 `@/components/ui/card` 和 `@/components/ui/badge` 导入
