import type { NextConfig } from "next";

import { withSentryConfig } from "@sentry/nextjs";
import { GitRevisionPlugin } from "git-revision-webpack-plugin";

import { i18n } from "./next-i18next.config";

const gitRevisionPlugin = new GitRevisionPlugin();

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    unoptimized: false,
    loader: "custom",
    loaderFile: "./src/utils/imageLoader.ts",
  },
  rewrites: async () => {
    return [
      {
        source: "/sitemap/:path*",
        destination: "https://static.furrycons.cn/sitemap/:path*",
      },
    ];
  },
  redirects: async () => {
    return [
      {
        source: "/%E5%BE%BD%E5%85%BD%E6%B1%87",
        destination: "/huishouhui",
        permanent: true,
      },
      {
        source: "/%E5%BE%BD%E5%85%BD%E6%B1%87/july-fur-con-2023",
        destination: "/huishouhui/july-fur-con-2023",
        permanent: true,
      },
    ];
  },
  compiler: {
    define: {
      VERSION: gitRevisionPlugin.version() || "UNKNOWN",
      COMMITHASH: gitRevisionPlugin.commithash()?.slice(0, 7) || "UNKNOWN",
      BRANCH: gitRevisionPlugin.branch() || "UNKNOWN",
      __SENTRY_DEBUG__: "false",
    },
  },
  i18n,
};

const sentryOptions = {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
  // https://github.com/getsentry/sentry-webpack-plugin#options.

  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,
  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
  deleteSourceMapsAfterUpload: true,

  // turboPack not support yet.
  // reactComponentAnnotation: {
  //   enabled: true,
  // },

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  errorHandler: (error: unknown) => {
    console.warn("Sentry build error occurred:", error);
  },
};

module.exports = withSentryConfig(nextConfig, sentryOptions);
