## Context

当前 `PlannedActivity` 有 `description` 字段用于描述活动内容，但缺少对地点本身亮点的结构化描述。用户希望在行程预览和详情页看到每个地点的特点、关键词标签和推荐语。

两个 LLM 生成路径（Agent SSE 和非 Agent）共享 `plannedActivitySchema` zod schema，改一处即可同时对两条路径生效。展示层只有一个组件 `AgentStepCard`，预览和详情页都复用它。

## Goals / Non-Goals

**Goals:**
- LLM 生成的每个 activity 包含 `highlights`、`tags`、`recommendation` 三个可选字段
- 预览页和详情页的 `AgentStepCard` 展示标签和推荐语
- 所有新字段 optional，旧数据正常展示不报错

**Non-Goals:**
- 不修改 DB schema（activities 存 jsonb，无需 migration）
- 不修改活动编辑功能（详情页当前只读）
- 不在行程列表卡片中展示地点级元数据（卡片只展示概览）
- 不改变高德地理编码或路径规划逻辑

## Decisions

### 1. 新字段挂在 `PlannedActivity` 而非 `GeneratedDay`

每个地点有自己的特点，不是每天统一。字段放在 activity 级别是正确的粒度。

### 2. 新字段均为 optional

**理由**: jsonb 数据库列兼容旧数据；LLM 输出不稳定时不会导致解析失败；用户手动创建的 activity 不需要强制填写。

### 3. Tags 用 `string[]` 而非逗号分隔字符串

zod `z.array(z.string())` 能精确校验结构，前端直接 `.map()` 渲染，避免手动 split。

### 4. `recommendation` 在 prompt 中限制 ≤20 字

前端的展示空间有限（一行），由 prompt 约束而非 zod 校验长度（zod 不做字数计数校验）。

### 5. UI 设计：标签用紧凑的 badge 组，推荐语用引号样式

```
┌────────────────────────────────────────────┐
│ 📍 09:00  外滩                              │
│     黄浦区中山东一路                          │
│     上海地标性建筑，黄浦江畔的百年风华         │  ← highlights 替换原 description
│     [地标] [夜景] [历史]                      │  ← tags as badges
│     "必打卡的魔都夜景圣地"                    │  ← recommendation 引号+图标
│     🚗 驾车 · 15分钟 · 2.3公里               │  ← transportTo (已有)
└────────────────────────────────────────────┘
```

`highlights` 替换原有 `description` 的展示位置（`description` 原本用于活动描述，现在 description 留作活动说明，highlights 作为地点特点展示）。

实际上需要区分：当前 `description` 字段在 prompt 中定义为"活动描述"，已在前端展示。新增 `highlights` 是独立的"地点特点描述"。两个字段同时展示——`description` 维持原位置，`highlights` 作为补充行展示在下方。

更正后的展示：

```
📌 title · time
   location
   description          ← 活动描述（原有，"15字以内"）
   特点：highlights       ← 地点特点（新增）
   [tag1] [tag2] [tag3]  ← 标签（新增）
   💬 "recommendation"   ← 推荐语（新增，引号+图标）
   🚗 transportTo        ← 交通（原有）
```

## Risks / Trade-offs

- **LLM 可能不输出新字段** → zod schema 设为 optional，缺失时前端不渲染对应行，不影响整体展示
- **LLM 可能输出超长推荐语** → prompt 限制 ≤20 字，但无硬校验；前端可用 `truncate` 做防御性截断
- **Prompt token 增加** → 三个新字段增加约 100-150 token 的 prompt 描述，对 8000 maxOutputTokens 的影响可忽略
