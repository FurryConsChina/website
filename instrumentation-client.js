// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
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
    // Replay may only be enabled for the client-side
    integrations: [],
    sendDefaultPii: true,

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,

    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // ...
    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
