import API from "@/api";
import { ListResponse } from "@/types/api";
import { RegionListItem } from "@/types/region";

export class RegionAPI {
  static async getRegionList(params: { current: number; pageSize: number; code?: string; withEvents?: boolean }) {
    const response = await API.get<ListResponse<RegionListItem>>("website/region", { params });
    return response.data;
  }

  static async getRegionDetail(code: string) {
    const response = await API.get<RegionListItem | null>(`website/region/detail`, {
      params: {
        code,
      },
    });
    return response.data;
  }
}
