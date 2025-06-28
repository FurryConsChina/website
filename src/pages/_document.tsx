import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export const isEnableTrack = process.env.NEXT_PUBLIC_ENABLE_TRACK === "true";

export default function Document() {
  return (
    <Html>
      <Head></Head>

      <body>
        <Main />
        <NextScript />
        {isEnableTrack && (
          <Script
            data-website-id={"3a8b1e6a-70fd-49e8-bb58-902caa3124d8"}
            strategy="lazyOnload"
            async
            src={"https://umami.abo.network/script.js"}
          />
        )}
      </body>
    </Html>
  );
}
