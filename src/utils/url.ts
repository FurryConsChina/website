import { currentSupportLocale } from "@/utils/meta";

const PUBLIC_URL = process.env.NEXT_PUBLIC_WEBSITE_URL;

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
  eventSlug,
  organizationSlug,
  locale,
  fullUrl = false,
}: {
  eventSlug: string;
  organizationSlug: string;
  locale: currentSupportLocale;
  fullUrl?: boolean;
}) {
  let path = `/${organizationSlug}/${eventSlug}`;

  if (locale !== "zh-Hans") {
    path = `/${locale}${path}`;
  }

  if (fullUrl) {
    path = `https://${PUBLIC_URL}${path}`;
  }

  return path;
}
