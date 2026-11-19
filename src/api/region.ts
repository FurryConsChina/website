import API from "@/api";
import { ListResponse } from "@/types/api";
import type { RegionEventItem, RegionListItem } from "@/types/region";

export class RegionAPI {
  static async getRegionList(params: { current: number; pageSize: number; code?: string; withEvents?: boolean }) {
    const response = await API.get<ListResponse<RegionListItem>>("website/region", { params });
    return response.data;
  }

  static async getRegionDetail(slug: string) {
    const response = await API.get<{ region: RegionListItem }>(`website/region/${slug}`);
    return response.data.region;
  }

  static async getRegionEvents(
    slug: string,
    params: { current: number; pageSize: number; orderByStartAt?: "asc" | "desc" },
  ) {
    const response = await API.get<ListResponse<RegionEventItem>>(`website/region/${slug}/events`, {
      params,
    });
    return response.data;
  }
}
