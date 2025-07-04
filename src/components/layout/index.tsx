import Head from "next/head";
import React from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import {
  currentSupportLocale,
  descriptionGenerator,
  titleGenerator,
  universalKeywords,
} from "@/utils/meta";
import AnnouncementSlider from "@/components/announcementSlider";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import { useTranslation } from "next-i18next";

const IS_CN_REGION = process.env.NEXT_PUBLIC_REGION === "CN";
const PUBLIC_URL = process.env.NEXT_PUBLIC_WEBSITE_URL;

const getCanonicalUrl = (locale: string | undefined, path: string) => {
  switch (locale) {
    case "en":
      return `https://www.furrycons.cn/en${path}`;
    case "zh-Hans":
      return `https://www.furrycons.cn${path}`;
    default:
      return `https://www.furrycons.cn${path}`;
  }
};

export default function Layout({
  children,
  headMetas,
  structuredData,
}: {
  children: React.ReactNode;
  headMetas?: {
    title?: string;
    des?: string;
    url?: string;
    cover?: string;
    keywords?: string;
  };
  structuredData?: { [key: string]: { [key: string]: string } };
}) {
  const router = useRouter();
  const asPath = router.asPath;
  const locale = router.locale;

  // Remove search parameters from asPath
  const cleanPath = asPath.split('?')[0];
  const Path = cleanPath === "/" ? "" : cleanPath;

  const { i18n } = useTranslation();

  return (
    <div className="sm:max-w-screen-xl mx-auto flex flex-col min-h-screen relative">
      <Head>
        <title>
          {titleGenerator(
            i18n.language as currentSupportLocale,
            headMetas?.title
          )}
        </title>
        <meta
          name="description"
          content={
            headMetas?.des ||
            descriptionGenerator(i18n.language as currentSupportLocale)
          }
          key="description"
        />
        <meta
          name="keywords"
          content={
            headMetas?.keywords
              ? headMetas.keywords
              : universalKeywords(i18n.language as "zh-Hans" | "en").join(",")
          }
          key="keywords"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          property="og:title"
          content={titleGenerator(
            i18n.language as currentSupportLocale,
            headMetas?.title
          )}
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content={
            headMetas?.des ||
            descriptionGenerator(i18n.language as currentSupportLocale)
          }
        />
        <meta
          property="og:url"
          content={
            `https://${PUBLIC_URL}${headMetas?.url}` || `https://${PUBLIC_URL}`
          }
          key="url"
        />
        <meta
          property="og:image"
          content={headMetas?.cover || "https://images.furrycons.cn/banner.png"}
          key="image"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content={`${PUBLIC_URL}`} />
        <meta
          property="twitter:url"
          content={
            `https://${PUBLIC_URL}${headMetas?.url}` || `https://${PUBLIC_URL}`
          }
        />
        <meta
          name="twitter:title"
          content={titleGenerator(
            i18n.language as currentSupportLocale,
            headMetas?.title
          )}
        />
        <meta
          name="twitter:description"
          content={
            headMetas?.des ||
            descriptionGenerator(i18n.language as currentSupportLocale)
          }
        />
        <meta
          name="twitter:image"
          content={headMetas?.cover || "https://images.furrycons.cn/banner.png"}
        />
        <meta name="baidu-site-verification" content={"codeva-GHH5uUsoan"} />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="canonical" href={getCanonicalUrl(locale, Path)} />

        <link
          rel="alternate"
          hrefLang="zh-Hans"
          href={`https://www.furrycons.cn${Path}`}
        />

        <link
          rel="alternate"
          hrefLang="zh-HK"
          href={`https://www.furrycons.cn${Path}`}
        />

        <link
          rel="alternate"
          hrefLang="zh-TW"
          href={`https://www.furrycons.cn${Path}`}
        />

        <link
          rel="alternate"
          hrefLang="en"
          href={`https://www.furrycons.cn/en${Path}`}
        />

        <link
          rel="alternate"
          hrefLang="x-default"
          href={`https://www.furrycons.cn/en${Path}`}
        />

        {structuredData?.event && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData.event),
            }}
          />
        )}
        {structuredData?.breadcrumb && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData.breadcrumb),
            }}
          />
        )}
        {structuredData?.imageObject && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData.imageObject),
            }}
          />
        )}
      </Head>
      <Toaster />
      <Header />
      <AnnouncementSlider />
      <div className="flex-grow mx-1 lg:mx-0">{children}</div>
      <Sidebar />
      <Footer isCNRegion={IS_CN_REGION} />
    </div>
  );
}
