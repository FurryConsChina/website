import { PUBLIC_URL } from "@/utils/env";
import { currentSupportLocale } from "@/utils/locale";

export function getOrganizationDetailUrl({
  organizationSlug,
  locale,
  fullUrl = false,
}: {
  organizationSlug: string;
  locale: currentSupportLocale;
  fullUrl?: boolean;
}) {
  let path = `/${organizationSlug}`;

  if (locale !== "zh-Hans") {
    path = `/${locale}${path}`;
  }

  if (fullUrl) {
    path = `https://${PUBLIC_URL}${path}`;
  }

  return path;
}

export function getEventDetailUrl({
  urlKey,
  locale = "zh-Hans",
  fullUrl = false,
}: {
  urlKey: string;
  locale?: currentSupportLocale;
  fullUrl?: boolean;
}) {
  let path = `/event/${urlKey}`;

  if (locale !== "zh-Hans") {
    path = `/${locale}${path}`;
  }

  if (fullUrl) {
    path = `https://${PUBLIC_URL}${path}`;
  }

  return path;
}
