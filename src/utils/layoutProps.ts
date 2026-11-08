import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { SiteSettingsAPI } from "@/api/siteSettings";
import { formatLocale } from "@/utils/locale";

export async function getLayoutProps(locale: string | undefined) {
  const [translations, slogan] = await Promise.all([
    locale ? serverSideTranslations(locale, ["common"]) : Promise.resolve({}),
    SiteSettingsAPI.getSlogan().catch(() => null),
  ]);

  return {
    ...translations,
    slogan: slogan?.[formatLocale(locale)] || null,
  };
}
