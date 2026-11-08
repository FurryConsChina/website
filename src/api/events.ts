import { EventListItemSchema, EventSchema } from "@/types/event";
import type { EventItem, EventListItem } from "@/types/event";
import { ListResponse } from "@/types/api";
import API from "@/api";

export class EventsAPI {
  static async getEventDetail(urlKey: string): Promise<EventItem> {
    const response = await API.get(`website/event/url-key/${encodeURIComponent(urlKey)}`);

    return EventSchema.parse(response.data);
  }

  static async getLegacyEventDetail(params: { slug: string; organization: string }): Promise<EventItem> {
    const response = await API.get("website/event/detail", { params });

    return EventSchema.parse(response.data);
  }

  static async getEventList({
    current,
    pageSize,
    eventStartAt,
    eventEndAt,
    eventStatus,
    eventRegionCode,
    organizationSlug,
  }: {
    current: string;
    pageSize: string;
    eventStartAt?: string;
    eventEndAt?: string;
    eventStatus?: string[];
    eventRegionCode?: string[];
    organizationSlug?: string[];
  }) {
    const response = await API.post<ListResponse<EventListItem>>("/website/event/list", {
      current,
      pageSize,
      eventStartAt,
      eventEndAt,
      eventStatus,
      eventRegionCode,
      organizationSlug,
    });

    return {
      ...response.data,
      records: response.data.records.map((event) => EventListItemSchema.parse(event)),
    };
  }
}
