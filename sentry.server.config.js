// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const GLOBAL_SENTRY_DSN =
  "https://1ed2ba43a45f4dee8874d80de24b3e73@o4504660600684544.ingest.sentry.io/4504660602978304";
const NURUPO_DSN =
  "https://d896357b2d18496aa9de8499bf7fd0db@sentry.abo.network/6";
const SENTRY_DSN = NURUPO_DSN;

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: SENTRY_DSN,
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1.0,
    // ...
    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps
  });
}
