# Province-airport-data spec

## Purpose

提供中国省份→城市→机场的静态映射数据，供机票搜索功能使用。

## ADDED Requirements

### Requirement: 省份到机场的映射数据

系统 SHALL 在 `lib/flights/data/airports.json` 中提供全国省份到机场的静态映射。

#### Scenario: 查询湖南省机场

- **WHEN** 代码导入 airprots 数据并查询"湖南省"
- **THEN** 返回省内所有民用机场列表
- **AND** 每条记录包含：城市名、机场代码（IATA）、机场名称

#### Scenario: 查询直辖市

- **WHEN** 代码查询"上海市"
- **THEN** 返回上海市内机场列表（浦东 PVG、虹桥 SHA）

#### Scenario: 省份数据完整性

- **WHEN** 读取 airports.json
- **THEN** 包含中国大陆所有省份、自治区、直辖市的民用运输机场
- **AND** 不含港澳台机场

### Requirement: 数据包含航线连接信息

系统 SHALL 在机场数据中附带高频航线连接信息，用于甩尾航班延程城市候选。

#### Scenario: 查询某机场的高频连接

- **WHEN** 代码查询长沙 CSX 机场的 `commonConnections`
- **THEN** 返回从该机场出发的高频国内航线列表（城市名 + IATA 代码）
- **AND** 列表按航线频率降序排列

### Requirement: 城市到机场代码的转换

系统 SHALL 提供城市名 → 机场代码的查找函数。

#### Scenario: 城市到机场多值

- **WHEN** 代码查询"上海"的机场代码
- **THEN** 返回 `["SHA", "PVG"]`
- **AND** SHA（虹桥）在前，PVG（浦东）在后

#### Scenario: 单机场城市

- **WHEN** 代码查询"长沙"的机场代码
- **THEN** 返回 `["CSX"]`

### Requirement: 机场代码到城市的反向查找

系统 SHALL 提供 IATA 代码 → 城市名的反向查找。

#### Scenario: 代码反查

- **WHEN** 代码查询 IATA 代码 "CSX"
- **THEN** 返回城市名"长沙"和所在省份"湖南省"

### Requirement: 数据格式可程序化消费

系统 SHALL 确保 airports.json 是合法的 JSON 数组，可直接用 `import` 或 `readFileSync` 加载，无需运行时转换。

#### Scenario: 直接导入使用

- **WHEN** 业务代码 `import airports from './data/airports.json'`
- **THEN** 得到类型正确的对象，可直接访问 `.provinces`、`.airports` 等属性
- **AND** 无需额外运行时解析步骤
