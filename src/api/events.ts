import { EventListItemSchema, EventSchema } from "@/types/event";
import type { EventItem, EventListItem } from "@/types/event";
import { PublicFeatureSchema } from "@/types/feature";
import { ListResponse } from "@/types/api";
import API from "@/api";

export class EventsAPI {
  static async getEventDetail(urlKey: string): Promise<EventItem> {
    const response = await API.get(`website/event/url-key/${urlKey}`);

    return EventSchema.parse(response.data);
  }

  static async getLegacyEventDetail(params: { slug: string; organization: string }): Promise<EventItem> {
    const response = await API.get("website/event/detail", { params });

    return EventSchema.parse(response.data);
  }

  static async getEventList({
    current,
    pageSize,
    keyword,
    eventStartAt,
    eventEndAt,
    eventEndAfter,
    eventYear,
    eventStatus,
    eventType,
    eventScale,
    eventLocationType,
    eventFeature,
    regionSlug,
    eventRegionCode,
    organizationSlug,
    orderByStartAt,
  }: {
    current: string;
    pageSize: string;
    keyword?: string;
    eventStartAt?: string;
    eventEndAt?: string;
    eventEndAfter?: string;
    eventYear?: number | "unknown";
    eventStatus?: string[];
    eventType?: string[];
    eventScale?: string[];
    eventLocationType?: string[];
    eventFeature?: string[];
    regionSlug?: string[];
    eventRegionCode?: string[];
    organizationSlug?: string[];
    orderByStartAt?: "asc" | "desc";
  }) {
    const body: Record<string, unknown> = {
      current,
      pageSize,
      eventStartAt,
      eventEndAt,
      eventEndAfter,
      eventStatus,
      eventRegionCode,
      organizationSlug,
      orderByStartAt,
    };

    if (keyword) body.keyword = keyword;
    if (eventYear !== undefined) body.eventYear = eventYear;
    if (eventType?.length) body.eventType = eventType;
    if (eventScale?.length) body.eventScale = eventScale;
    if (eventLocationType?.length) body.eventLocationType = eventLocationType;
    if (eventFeature?.length) body.eventFeature = eventFeature;
    if (regionSlug?.length) body.regionSlug = regionSlug;

    const response = await API.post<ListResponse<EventListItem>>("/website/event/list", body);

    return {
      ...response.data,
      records: response.data.records.map((event) => EventListItemSchema.parse(event)),
    };
  }

  static async getFeatureList() {
    const response = await API.get<ListResponse<unknown>>("website/event/feature", {
      params: {
        current: 1,
        pageSize: 100,
      },
    });

    return {
      ...response.data,
      records: response.data.records.map((feature) => PublicFeatureSchema.parse(feature)),
    };
  }

  static async getEventYears(): Promise<{
    total: number;
    years: Array<{ year: number | null; count: number }>;
  }> {
    const response = await API.get<{
      total: number;
      years: Array<{ year: number | null; count: number }>;
    }>("website/event/years");

    return response.data;
  }
}
