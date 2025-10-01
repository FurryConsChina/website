// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const GLOBAL_SENTRY_DSN =
  "https://1ed2ba43a45f4dee8874d80de24b3e73@o4504660600684544.ingest.sentry.io/4504660602978304";
const NURUPO_DSN =
  "https://d896357b2d18496aa9de8499bf7fd0db@sentry.abo.network/6";

const DSN = NURUPO_DSN;

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: DSN,

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  });
}
