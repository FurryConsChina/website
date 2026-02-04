# <div align="center">FurryCons.cn</div>

<div align="center">

[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v1/monitor/vz4h.svg)](https://uptime.betterstack.com/?utm_source=status_badge)
[![Build CN Image](https://github.com/FurryConsChina/website/actions/workflows/build-cn-image.yml/badge.svg)](https://github.com/FurryConsChina/website/actions/workflows/build-cn-image.yml)
[![RelativeCI](https://badges.relative-ci.com/badges/tUU1QJHvaWj6oY0ysuih?branch=main&style=flat)](https://app.relative-ci.com/projects/tUU1QJHvaWj6oY0ysuih)

</div>

<div align="center">

![](https://img.shields.io/badge/Next.js-black.svg?logo=next.js)
![](https://img.shields.io/badge/React-blue.svg?logo=react)
![](https://img.shields.io/badge/Sentry-purple.svg?logo=sentry)
![](https://img.shields.io/badge/Umami-orange.svg?logo=umami)
![](https://img.shields.io/badge/Google%20Analytics%205-blue.svg?logo=google-analytics)
![](https://img.shields.io/badge/Cloudflare%20R2-blue.svg?logo=cloudflare)
![](https://img.shields.io/badge/Cloudflare%20Worker-blue.svg?logo=cloudflare)
![](https://img.shields.io/badge/CloudFront-orange.svg?logo=amazon-aws)

</div>

[English](./README.md)

[兽展日历](https://www.furrycons.cn) 是一个收集并展示中国大陆与兽迷相关的展览活动的网站。这是它的源代码仓库。

## 开始开发

### 配置环境变量

复制 `.env.example`并粘贴，`FEC_API_TOKEN`需在我们的控制台注册获取，其余如 Sentry 等无需配置。

```bash
nvm use

corepack enable

yarn install
yarn dev
```

使用浏览器打开 http://localhost:3000 查看结果。

## Docker 测试

如果你想用 Docker 快速验证构建产物，可在项目根目录执行：

```bash
docker build --no-cache -t furrycons:local .
docker run --rm -p 3000:3000 --env-file .env furrycons:local
```

然后访问 http://localhost:3000。

## 贡献

如果您想为本项目做贡献，我们的看板上有很多任务等待领取，挑选一个您满意的，然后打开一个 PR！

## 了解更多

要了解有关 Next.js 的更多信息，请参阅以下资源：

- [Next.js Documentation](https://nextjs.org/docs) - 了解 Next.js 的功能和 API.
- [Learn Next.js](https://nextjs.org/learn) - 一个交互式的 Next.js 教程。

## 部署

只需创建一个 PR 并将提交推送到远程仓库，Github Action 将自动编译并将代码部署到 Firebase。合并到主分支后，也会自动编译并部署。

## 使用库

- [Microsoft Teams Emoji(Flutter Emoji)](https://emojipedia.org/microsoft-teams)
- [iconify](https://icon-sets.iconify.design/?query=steaming-bowl)

## 许可证

本项目采用 GPL-3.0 许可证授权 - 有关详细信息，请参阅 [LICENSE](LICENSE) 文件。

## 联系方式

如果您有任何问题或建议，请直接打开一个 issue。

## 分析

![Alt](https://repobeats.axiom.co/api/embed/74dada94f2baca768cdc3fac988db14a5c941997.svg "Repobeats analytics image")
