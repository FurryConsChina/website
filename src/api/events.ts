import { EventItem, EventSchema } from "@/types/event";
import { ListResponse } from "@/types/api";
import API from "@/api";

export class EventsAPI {
  static async getEventDetail(slug: string, organization: string): Promise<EventItem> {
    const response = await API.get("internal/website/event/detail", {
      params: { slug, organization },
    });

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
    const response = await API.post<ListResponse<EventItem>>("/internal/website/event/list", {
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
