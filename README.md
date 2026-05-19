# 科研奖励获奖信息查询系统

一款功能完善的微信小程序，用于查询和管理科研奖励获奖信息。

## 功能特性

### 1. 搜索功能
- 支持姓名、单位、成果名称、奖项名称的模糊查询
- 支持按奖项等级、年份筛选
- 搜索结果分页展示

### 2. 数据管理
- 支持从 Excel 和 TXT 文件批量导入获奖信息
- 支持单条数据录入
- 支持数据编辑和删除
- 管理员权限控制

### 3. 统计分析
- 概览统计：总获奖数、各等级奖项分布
- 趋势分析：奖项随时间变化趋势
- 个人统计：查询个人获奖情况
- 单位统计：查询单位获奖情况

### 4. 图表展示
- 饼图：各等级奖项占比
- 柱状图：获奖趋势
- 排行榜：Top 10 获奖次数

### 5. 用户系统
- 微信登录
- 用户收藏功能
- 数据加密存储
- 查询次数限制

## 技术栈

### 前端
- 微信小程序原生开发
- TypeScript
- WXSS 样式

### 后端
- Supabase (PostgreSQL + Auth)
- Supabase JavaScript SDK

### 数据安全
- 本地存储 AES 加密
- 数据库 RLS 策略
- 查询频率限制

## 项目结构

```
/workspace
├── app.ts                   # 应用入口
├── app.json                 # 小程序配置
├── sitemap.json            # 站点地图
├── project.config.json     # 项目配置
├── package.json            # 依赖配置
├── utils/
│   └── crypto.ts          # 加密工具
├── database/
│   └── init.sql           # 数据库初始化脚本
├── pages/
│   ├── index/             # 首页
│   ├── search/            # 搜索页
│   ├── detail/            # 详情页
│   ├── admin/             # 管理页
│   ├── statistics/        # 统计页
│   ├── login/             # 登录页
│   └── favorites/         # 收藏页
└── assets/
    └── icons/             # 图标资源
```

## 快速开始

### 1. 配置 Supabase

在 `app.ts` 中配置您的 Supabase 项目：

```typescript
const SUPABASE_URL = 'https://your-project.supabase.co'
const SUPABASE_KEY = 'your-anon-key'
```

### 2. 初始化数据库

在 Supabase SQL Editor 中执行 `database/init.sql` 脚本。

### 3. 安装依赖

```bash
npm install
```

### 4. 在微信开发者工具中打开项目

使用微信开发者工具打开项目目录，填入您的 AppID。

## 数据库设计

### awards 表（奖项表）
- id: 主键
- name: 成果名称
- award_name: 奖项名称
- category: 奖项类别
- level: 奖项等级（国家级/省级/市级/校级）
- year: 获奖年份
- session: 届数
- recipients: 获奖人
- organization: 获奖单位
- department: 获奖部门
- description: 成果描述

### users 表（用户表）
- id: 用户 ID
- openid: 微信 OpenID
- nickname: 昵称
- avatar_url: 头像
- is_admin: 是否管理员

### favorites 表（收藏表）
- id: 收藏 ID
- user_id: 用户 ID
- award_id: 奖项 ID

## 安全配置

### 查询限制
- 默认每小时 100 次查询
- 可在 `app.ts` 中调整 `QUERY_LIMIT`

### 数据加密
- 使用简单的 XOR + Base64 加密本地存储
- 生产环境建议使用更安全的加密方式

### RLS 策略
- 启用行级安全策略
- 普通用户只能读取数据
- 管理员可以修改数据

## 开发说明

### 目录结构
- 每个页面包含 `.wxml`（结构）、`.wxss`（样式）、`.ts`（逻辑）三个文件
- `utils/` 目录存放工具函数
- `database/` 存放数据库相关文件

### 代码规范
- 使用 TypeScript 类型定义
- 遵循微信小程序开发规范
- 保持代码注释完整

## 注意事项

1. 小程序大小控制在 3MB 以内
2. 分包大小控制在 3MB 以内
3. 数据存储需加密
4. 查询次数需限制
5. 生产环境需要配置正式的 AppID 和服务器

## License

MIT
