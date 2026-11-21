import type { NextApiRequest, NextApiResponse } from "next";

import { EventsAPI } from "@/api/events";
import { OrganizationsAPI } from "@/api/organizations";
import { RegionAPI } from "@/api/region";
import { EventStatus } from "@/constants/event";
import { RegionType } from "@/constants/region";
import { getEventOrganizations } from "@/utils/event";

export type SearchOrganizationHit = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  eventCount: number;
};

export type SearchRegionHit = {
  id: string;
  slug: string;
  name: string;
  parentName: string | null;
  eventCount: number;
};

export type SearchEventHit = {
  id: string;
  urlKey: string;
  name: string;
  startAt: string | null;
  endAt: string | null;
  regionName: string | null;
  organizationName: string | null;
  placeName: string | null;
  placeAddress: string | null;
  features: string[];
  thumbnail: string | null;
  media: { images?: { url: string }[] } | null;
};

export type SearchAPIResponse = {
  total: number;
  totalEvents: number;
  organizations: SearchOrganizationHit[];
  regions: SearchRegionHit[];
  events: SearchEventHit[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchAPIResponse | { message: string }>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed." });
  }

  const rawQuery = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
  const keyword = typeof rawQuery === "string" ? rawQuery.trim().slice(0, 128) : "";

  if (!keyword) {
    return res.status(200).json({ total: 0, totalEvents: 0, organizations: [], regions: [], events: [] });
  }

  try {
    const [organizationData, regionData, eventData] = await Promise.all([
      OrganizationsAPI.getOrganizationList({
        current: "1",
        pageSize: "5",
        sortBy: "eventCount",
        keyword,
      }),
      RegionAPI.getRegionList({
        current: 1,
        pageSize: 12,
        search: keyword,
        withEvents: false,
      }),
      EventsAPI.getEventList({
        current: "1",
        pageSize: "10",
        keyword,
        eventStatus: [EventStatus.EventScheduled, EventStatus.EventRescheduled, EventStatus.EventMovedOnline],
        orderByStartAt: "desc",
      }),
    ]);

    const organizations: SearchOrganizationHit[] = organizationData.records.map((org) => ({
      id: org.id,
      slug: org.slug,
      name: org.name,
      logoUrl: org.logoUrl,
      eventCount: org.eventCount,
    }));

    const regions: SearchRegionHit[] = regionData.records
      .filter((region) => region.kind !== RegionType.COUNTRY && region.eventCount > 0)
      .slice(0, 5)
      .map((region) => ({
        id: region.id,
        slug: region.slug,
        name: region.name,
        parentName: region.parent && region.parent.kind !== RegionType.COUNTRY ? region.parent.name : null,
        eventCount: region.eventCount,
      }));

    const events: SearchEventHit[] = eventData.records.map((event) => {
      const { primary } = getEventOrganizations(event);
      return {
        id: event.id,
        urlKey: event.urlKey,
        name: event.name,
        startAt: event.startAt,
        endAt: event.endAt,
        regionName: event.region?.localName ?? event.region?.name ?? null,
        organizationName: primary?.name ?? null,
        placeName: event.place?.name ?? null,
        placeAddress: event.place?.address ?? null,
        features: event.features.map((feature) => feature.name),
        thumbnail: event.thumbnail,
        media: event.media?.images ? { images: event.media.images.slice(0, 1).map((img) => ({ url: img.url })) } : null,
      };
    });

    res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");

    return res.status(200).json({
      total: organizationData.total + regions.length + eventData.total,
      totalEvents: eventData.total,
      organizations,
      regions,
      events,
    });
  } catch (error) {
    console.error("[api/search]", error);
    return res.status(500).json({ message: "Search failed." });
  }
}
