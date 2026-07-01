## ADDED Requirements

### Requirement: 用户可通过 Clerk 完成注册

系统 SHALL 在 `/sign-up` 路由提供 Clerk 托管的注册界面，用户提交有效信息后创建 Clerk 账户并建立会话。

#### Scenario: 访客打开注册页
- **WHEN** 未登录访客访问 `/sign-up`
- **THEN** 页面返回 200 并渲染 Clerk `<SignUp />` 组件
- **AND** 不重定向到其他页面

#### Scenario: 提交有效注册信息
- **WHEN** 访客在注册页提交有效邮箱与密码
- **THEN** Clerk 创建账户并建立会话
- **AND** 浏览器重定向到 `/app`

### Requirement: 用户可通过 Clerk 完成登录

系统 SHALL 在 `/sign-in` 路由提供 Clerk 托管的登录界面，已注册用户提交有效凭据后建立会话。

#### Scenario: 访客打开登录页
- **WHEN** 未登录访客访问 `/sign-in`
- **THEN** 页面返回 200 并渲染 Clerk `<SignIn />` 组件

#### Scenario: 提交有效凭据
- **WHEN** 已注册用户提交有效邮箱与密码
- **THEN** Clerk 建立会话
- **AND** 浏览器重定向到 `/app`

#### Scenario: 提交无效凭据
- **WHEN** 用户提交不匹配的邮箱密码组合
- **THEN** Clerk 在界面上显示错误提示
- **AND** 不建立会话，不重定向到 `/app`

### Requirement: 受保护路由强制登录

系统 SHALL 通过 `middleware.ts` 中的 `clerkMiddleware` 保护 `/app` 路径及其子路径，未登录访问时重定向到 `/sign-in`。

#### Scenario: 未登录访问受保护页
- **WHEN** 未登录用户访问 `/app` 或其子路径
- **THEN** 中间件重定向到 `/sign-in`
- **AND** 登录成功后重定向回 `/app`

#### Scenario: 已登录访问受保护页
- **WHEN** 已登录用户访问 `/app`
- **THEN** 页面返回 200 并渲染受保护内容
- **AND** 不触发重定向

### Requirement: 已登录用户可在界面登出

系统 SHALL 在受保护页面的布局中渲染 Clerk `<UserButton />` 组件，用户可通过该组件主动登出。

#### Scenario: 用户登出
- **WHEN** 已登录用户点击 `<UserButton />` 并选择登出
- **THEN** Clerk 销毁会话
- **AND** 浏览器重定向到首页 `/`

### Requirement: 受保护页可获取当前用户身份

系统 SHALL 在受保护路由的服务端组件中通过 `auth()` 或 `currentUser()` 获取当前登录用户的 Clerk `userId`，未登录时返回 null。

#### Scenario: 已登录用户的服务端取身份
- **WHEN** 已登录用户访问 `/app` 的服务端组件
- **THEN** `auth()` 返回的对象包含非空 `userId`
- **AND** `userId` 为 Clerk 用户唯一标识字符串

#### Scenario: 未登录状态下服务端取身份
- **WHEN** 中间件未拦截的公开页面上调用 `auth()`
- **THEN** 返回的对象 `userId` 为 null
- **AND** 不抛出异常
