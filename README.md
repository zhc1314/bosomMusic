# 知音声乐（声乐课程表）微信小程序

面向声乐老师与学员的课程管理小程序，提供登录、角色选择、课程表、上课记录与预约管理等功能，支持老师与学员的双向协同。

## 功能

- **手机号验证登录**：登录后进入角色选择
- **角色选择**：老师 / 学员两种身份
- **老师端**：课程表管理、上课记录
- **学员端**：课程预约、预约记录查看与取消

## 截图

以下为当前仓库内的示例图片（可替换为实际页面截图）：

- 首页轮播图：`images/banner1.png`、`images/banner2.png`
- 应用 Logo：`images/logo.png`

如果需要展示完整页面截图，请在 `images/` 下新增图片并在此处补充引用。

## 运行方式

1. 安装并打开 **微信开发者工具**。
2. 选择“导入项目”，指向本项目根目录。
3. 选择合适的 AppID（或使用测试号）。
4. 点击编译运行。

建议基础库版本：**>= 3.0.0**（项目启用了 `skyline` 渲染与 `glass-easel` 组件框架）。

## 目录结构

```
.
├── app.js
├── app.json
├── app.wxss
├── components/
│   └── navigation-bar/
├── images/
│   ├── banner1.png
│   ├── banner2.png
│   ├── logo.png
│   └── tabbar/
├── pages/
│   ├── index/
│   ├── login/
│   ├── role/
│   ├── student/
│   │   ├── reservation/
│   │   └── schedule/
│   └── teacher/
│       ├── records/
│       └── schedule/
├── project.config.json
├── project.private.config.json
└── sitemap.json
```
