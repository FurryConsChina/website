import { EventStatus, EventStatusSchema, EventItem } from "@/types/event";
import { getEventCoverImgPath, imageUrl } from "@/utils/imageLoader";
import { currentSupportLocale } from "@/utils/meta";
import { getOrganizationDetailUrl } from "@/utils/url";

export function 
generateEventDetailStructuredData({
  event,
  locale,
}: {
  event: EventItem;
  locale: currentSupportLocale;
}) {
  return {
    breadcrumb: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "展商",
          item: getOrganizationDetailUrl({
            organizationSlug: event.organization.slug,
            locale,
            fullUrl: true,
          }),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: event?.organization?.name,
          item: getOrganizationDetailUrl({
            organizationSlug: event.organization.slug,
            locale,
            fullUrl: true,
          }),
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
      eventStatus:
        EventStatusSchema[event?.status || EventStatus.EventScheduled],
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: event?.address,
        address: {
          "@type": "PostalAddress",
          streetAddress: event?.address,
          addressLocality: event.region?.localName,
          // postalCode: "19019",
          // addressRegion: event?.city,
          addressCountry: "CN",
        },
      },
      image: [imageUrl(getEventCoverImgPath(event))],
      description: event?.detail,
      // offers: {
      //   "@type": "Offer",
      //   url: "https://www.example.com/event_offer/12345_201803180430",
      //   price: "30",
      //   priceCurrency: "USD",
      //   availability: "https://schema.org/InStock",
      //   validFrom: "2024-05-21T12:00",
      // },
      // performer: {
      //   "@type": "PerformingGroup",
      //   name: "Kira and Morrison",
      // },
      organizer: {
        "@type": "Organization",
        name: event?.organization?.name,
        url: getOrganizationDetailUrl({
          organizationSlug: event.organization.slug,
          locale,
          fullUrl: true,
        }),
      },
    },
    imageObject: [
      ...(event?.thumbnail ? [{ url: event.thumbnail }] : []),
      ...(event?.media?.images || []),
    ].map((image) => ({
      "@context": "https://schema.org/",
      "@type": "ImageObject",
      contentUrl: imageUrl(image.url),
      creditText: event?.organization?.name,
      creator: {
        "@type": "Organization",
        name: event?.organization?.name,
      },
      copyrightNotice: event?.organization?.name,
      license: "https://creativecommons.org/licenses/by-nc/4.0/",
      acquireLicensePage: "https://docs.furrycons.cn/blog/about",
    })),
  };
}
