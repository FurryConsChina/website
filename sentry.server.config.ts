// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const NURUPO_DSN = "https://d896357b2d18496aa9de8499bf7fd0db@sentry.abo.network/6";

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
