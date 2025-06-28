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

[中文版本](./README.zh.md)

[兽展日历](https://www.furrycons.com) is a website that collects and displays furry conventions hosting within mainland China. This is the source code repository of this site.

## Start Developing

### Env config

Copy `.env.example` and paste it, `FEC_API_TOKEN` needs to be obtained by registering in our console, the rest like Sentry do not need configuration.

```bash
nvm use

corepack enable

yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contribute

If you would like to contribute to this project, there are many tasks waiting to be claimed on our board. Choose one that interests you and then open a PR!

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy

Simply create a PR and push the commit to the remote repository, Github action will automatically compile and deploy the code to Firebase. After merging into the main branch, it will also be automatically compiled and deployed.

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## Contact

If you have any questions or suggestions, please directly open a issue.

## Analytics

![Alt](https://repobeats.axiom.co/api/embed/74dada94f2baca768cdc3fac988db14a5c941997.svg "Repobeats analytics image")
