# 快速开始指南

## 第一步：准备开发环境

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 注册 [Supabase 账号](https://supabase.com/) 并创建新项目

## 第二步：配置 Supabase

1. 在 Supabase 项目中，进入 Settings → API
2. 复制 Project URL 和 anon/public key
3. 打开 [app.ts](file:///workspace/app.ts#L3-L4)，替换：
   ```typescript
   const SUPABASE_URL = 'https://your-project.supabase.co' // 替换为您的 URL
   const SUPABASE_KEY = 'your-anon-key' // 替换为您的 Key
   ```

## 第三步：初始化数据库

1. 在 Supabase 中进入 SQL Editor
2. 复制 [database/init.sql](file:///workspace/database/init.sql) 中的内容并执行
3. 执行成功后，会创建所需的表和示例数据

## 第四步：配置小程序

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择项目目录：`/workspace`
4. 填入 AppID（可以先使用测试号）
5. 点击"导入"

## 第五步：开始开发

项目现在应该可以在微信开发者工具中运行了！

## 主要功能演示

### 1. 首页
- 查看统计数据
- 快速搜索获奖信息
- 查看热门奖项

### 2. 搜索
- 输入关键词搜索
- 使用筛选条件
- 点击查看详情

### 3. 统计
- 查看概览统计
- 分析获奖趋势
- 查询个人/单位获奖情况

### 4. 管理（需要管理员权限）
- 导入数据（支持 TXT 文件）
- 添加/编辑/删除获奖信息
- 管理数据库

### 5. 收藏
- 登录后使用
- 收藏感兴趣的奖项
- 在收藏页查看

## 管理员设置

默认创建了一个管理员用户，如需使用：
1. 修改数据库中 users 表中的 openid 为实际用户的 ID
2. 或将 is_admin 字段设为 TRUE

## 注意事项

1. **大小限制**：保持小程序主包大小在 3MB 以内
2. **分包加载**：如功能增多，考虑使用分包
3. **数据安全**：生产环境请使用更安全的加密方式
4. **查询限制**：默认每小时 100 次查询，可在 app.ts 中调整
5. **真实数据**：请替换示例数据为真实数据

## 常见问题

### Q: Supabase 连接失败
A: 检查 URL 和 Key 是否正确，确保项目正常运行

### Q: 无法登录
A: 需要在微信公众平台配置服务器域名白名单

### Q: 数据无法显示
A: 检查 RLS 策略是否正确配置

## 下一步

1. 准备项目图标资源
2. 在微信公众平台注册小程序
3. 配置服务器域名
4. 提交审核发布

祝您开发顺利！
