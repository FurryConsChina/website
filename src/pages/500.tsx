import { sendTrack } from "@/utils/track";
import { GetStaticPropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useEffect } from "react";
import { useTranslation } from "next-i18next";

export default function Custom500() {
  const { t } = useTranslation();

  useEffect(() => {
    sendTrack({
      eventName: "Viewed 500 page",
      eventValue: {
        href: window.location.href,
      },
    });
  }, []);

  return (
    <main className="grid min-h-full place-items-center bg-white rounded-2xl px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-red-400">500</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-red-400 sm:text-5xl">{t("error.500.title")}</h1>
        <p className="mt-6 text-base leading-7 text-gray-600">{t("error.heroLine")}</p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/"
            className="rounded-md bg-red-400 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {t("error.backHome")}
          </Link>
          {/* <a href="#" className="text-sm font-semibold text-gray-900">
            通知管理员 <span aria-hidden="true">&rarr;</span>
          </a> */}
        </div>
      </div>
    </main>
  );
}

export async function getStaticProps(context: GetStaticPropsContext) {
  return {
    props: {
      ...(context.locale ? await serverSideTranslations(context.locale, ["common"]) : {}),
    },
  };
}
