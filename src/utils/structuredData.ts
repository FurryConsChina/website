import { EventStatus, EventStatusSchema, OfferAvailabilitySchema } from "@/constants/event";
import type { EventItem } from "@/types/event";
import { PUBLIC_URL } from "@/utils/env";
import { getEventOrganizations, normalizeOfferPrice } from "@/utils/event";
import { getEventCoverImgPath, imageUrl } from "@/utils/imageLoader";
import { currentSupportLocale } from "@/utils/locale";
import { getEventDetailUrl, getOrganizationDetailUrl } from "@/utils/url";

export function generateEventDetailStructuredData({
  event,
  locale,
}: {
  event: EventItem;
  locale: currentSupportLocale;
}) {
  const organizerLabel = locale === "en" ? "Organizers" : "展商";
  const { primary: primaryOrganization } = getEventOrganizations(event);
  // getServerSideProps 的返回值必须可 JSON 序列化，undefined 会报错，可空字段统一回退为 null。
  const organizationListUrl = toAbsoluteUrl(locale === "zh-Hans" ? "/organization" : `/${locale}/organization`) ?? null;
  const organizationUrl = primaryOrganization
    ? getOrganizationDetailUrl({
        organizationSlug: primaryOrganization.slug,
        locale,
        fullUrl: true,
      })
    : null;
  const organizationName = primaryOrganization?.name ?? null;
  const placeAddress = event.location.place?.address ?? null;
  const eventUrl = toAbsoluteUrl(getEventDetailUrl({ urlKey: event.urlKey, locale }));
  const offers = event.offers.map((offer) => {
    const normalizedPrice = normalizeOfferPrice(offer.price);
    return {
      "@type": "Offer",
      name: offer.name,
      ...(normalizedPrice !== null ? { price: normalizedPrice, priceCurrency: offer.currency } : {}),
      availability: OfferAvailabilitySchema[offer.availability],
      ...(eventUrl ? { url: eventUrl } : {}),
      ...(offer.saleStartAt ? { validFrom: offer.saleStartAt } : {}),
      ...(offer.saleEndAt ? { validThrough: offer.saleEndAt } : {}),
      ...(offer.description ? { description: offer.description } : {}),
    };
  });

  return {
    breadcrumb: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: organizerLabel,
          item: organizationListUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: organizationName,
          item: organizationUrl,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: event?.name,
        },
      ],
    },
    event: {
      "@context": "https://schema.org",
      "@type": "Event",
      name: event?.name,
      startDate: event?.startAt,
      endDate: event?.endAt,
      eventStatus: EventStatusSchema[event?.status || EventStatus.EventScheduled],
      eventAttendanceMode:
        event?.status === EventStatus.EventMovedOnline
          ? "https://schema.org/OnlineEventAttendanceMode"
          : "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: event.location.place?.name ?? null,
        address: {
          "@type": "PostalAddress",
          streetAddress: placeAddress,
          addressLocality: event.location.region?.localName ?? null,
          // postalCode: "19019",
          // addressRegion: event?.city,
          addressCountry: "CN",
        },
      },
      image: [imageUrl(getEventCoverImgPath(event))],
      description: event?.detail ?? null,
      ...(offers.length > 0 ? { offers } : {}),
      // performer: {
      //   "@type": "PerformingGroup",
      //   name: "Kira and Morrison",
      // },
      organizer: {
        "@type": "Organization",
        name: organizationName,
        url: organizationUrl,
      },
    },
    imageObject: [...(event?.thumbnail ? [{ url: event.thumbnail }] : []), ...(event?.media?.images || [])].map(
      (image) => ({
        "@context": "https://schema.org/",
        "@type": "ImageObject",
        contentUrl: imageUrl(image.url),
        creditText: organizationName,
        creator: {
          "@type": "Organization",
          name: organizationName,
        },
        copyrightNotice: organizationName,
        license: "https://creativecommons.org/licenses/by-nc/4.0/",
        acquireLicensePage: "https://docs.furrycons.cn/blog/about",
      }),
    ),
  };
}

function toAbsoluteUrl(value?: string | null) {
  if (!value) return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  if (!PUBLIC_URL) return value;
  if (value.startsWith("/")) return `https://${PUBLIC_URL}${value}`;
  return `https://${PUBLIC_URL}/${value}`;
}

export function breadcrumbGenerator({ items }: { items: { name?: string | null; item?: string | null }[] }) {
  return {
    breadcrumb: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => {
        const url = toAbsoluteUrl(item.item);
        return {
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          ...(url ? { item: url } : {}),
        };
      }),
    },
  };
}
