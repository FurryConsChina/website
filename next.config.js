/* eslint-disable @typescript-eslint/no-require-imports */
const { withSentryConfig } = require("@sentry/nextjs");
const { GitRevisionPlugin } = require("git-revision-webpack-plugin");
const { StatsWriterPlugin } = require("webpack-stats-plugin");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const { i18n } = require("./next-i18next.config");

const gitRevisionPlugin = new GitRevisionPlugin();

const nextConfig = {
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
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(gitRevisionPlugin.version()),
        COMMITHASH: JSON.stringify(gitRevisionPlugin.commithash().slice(0, 7)),
        BRANCH: JSON.stringify(gitRevisionPlugin.branch()),
      }),
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
        }),
      );
    }

    return config;
  },
  // turboPack setting.
  // compiler: {
  //   define: {
  //     VERSION: gitRevisionPlugin.version() || "UNKNOWN",
  //     COMMITHASH: gitRevisionPlugin.commithash()?.slice(0, 7) || "UNKNOWN",
  //     BRANCH: gitRevisionPlugin.branch() || "UNKNOWN",
  //     __SENTRY_DEBUG__: "false",
  //   },
  // },
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
  deleteSourceMapsAfterUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  errorHandler: (error) => {
    console.warn("Sentry build error occurred:", error);
  },

  webpack: {
    reactComponentAnnotation: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
};

module.exports = withSentryConfig(withBundleAnalyzer(nextConfig), sentryOptions);
