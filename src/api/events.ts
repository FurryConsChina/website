import { EventSchema } from "@/types/event";
import type { EventItem } from "@/types/event";
import { ListResponse } from "@/types/api";
import API from "@/api";

export class EventsAPI {
  static async getEventDetail(
    params:
      | { "url-key": string; "full-slug"?: never; slug?: never; organization?: never }
      | { "full-slug": string; "url-key"?: never; slug?: never; organization?: never }
      | { slug: string; organization: string; "url-key"?: never; "full-slug"?: never },
  ): Promise<EventItem> {
    const response = await API.get("website/event/detail", { params });

    const validEvent = EventSchema.parse(response.data);

    return validEvent;
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
    const response = await API.post<ListResponse<EventItem>>("/website/event/list", {
      current,
      pageSize,
      eventStartAt,
      eventEndAt,
      eventStatus,
      eventRegionCode,
      organizationSlug,
    });

    return response.data;
  }
}
