// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
const { format } = require("date-fns");
const { zhCN } = require("date-fns/locale");

const { withSentryConfig } = require("@sentry/nextjs");
const { GitRevisionPlugin } = require("git-revision-webpack-plugin");
const { StatsWriterPlugin } = require("webpack-stats-plugin");

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.NEXT_PUBLIC_ENABLE_ANALYZE === "true",
});

const { i18n } = require("./next-i18next.config");

const isProd = process.env.NODE_ENV === "production";
const IS_CN_REGION = process.env.NEXT_PUBLIC_REGION === "CN";
const STATIC_CDN_URL = process.env.NEXT_PUBLIC_STATIC_CDN_URL;

const gitRevisionPlugin = new GitRevisionPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    unoptimized: false,
    loader: "custom",
    loaderFile: "./src/utils/imageLoader.ts",
  },
  assetPrefix: isProd && STATIC_CDN_URL ? STATIC_CDN_URL : undefined,
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
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(gitRevisionPlugin.version()),
        COMMITHASH: JSON.stringify(gitRevisionPlugin.commithash().slice(0, 7)),
        BRANCH: JSON.stringify(gitRevisionPlugin.branch()),
        // LASTCOMMITDATETIME: JSON.stringify(
        //   gitRevisionPlugin.lastcommitdatetime()
        // ),
        LASTCOMMITDATETIME: JSON.stringify(
          format(Date.now(), "yyyy/MM/dd", { locale: zhCN })
        ),
        __SENTRY_DEBUG__: false,
      })
    );

    if (!dev && !isServer) {
      config.plugins.push(
        new StatsWriterPlugin({
          filename: "../webpack-stats.json",
          stats: {
            assets: true,
            chunks: true,
            modules: true,
          },
        })
      );
    }

    return config;
  },
  i18n,
};

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  org: true ? "kemono-games" : "jipai",
  project: true ? "fec-web" : "furryeventchina",

  widenClientFileUpload: true,
  silent: true, // Suppresses all logs
  disableLogger: true,
  deleteSourceMapsAfterUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },

  errorHandler: (error) => {
    console.warn("Sentry build error occurred:", error);
  },

  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

module.exports = withSentryConfig(
  withBundleAnalyzer(nextConfig),
  sentryWebpackPluginOptions
);
