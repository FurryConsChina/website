import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

const isEnableTrack = process.env.ENABLE_TRACK === "true";

export default function Document() {
  return (
    <Html lang="zh-Hans">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Rubik&display=swap"
          as="style"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Rubik&display=swap"
          rel="stylesheet"
        />
      </Head>

      <body>
        <Main />
        <NextScript />
        {isEnableTrack && (
          <Script
            data-website-id="a12ca72b-5704-4910-bb28-9dd09d576e91"
            strategy="lazyOnload"
            src="https://analytics.umami.is/script.js"
          />
        )}
        {isEnableTrack && (
          <Script
            strategy="lazyOnload"
            src="https://www.googletagmanager.com/gtag/js?id=G-RBND7XQ43D"
          />
        )}
        {isEnableTrack && (
          <Script id="google-analytics" strategy="lazyOnload">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-RBND7XQ43D');
        `}
          </Script>
        )}
        {isEnableTrack && (
          <Script
            id="clarity-script"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "gjlb269skt");
          `,
            }}
          >
            {}
          </Script>
        )}
      </body>
    </Html>
  );
}
