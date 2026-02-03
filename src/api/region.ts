import API from "@/api";
import { ListResponse } from "@/types/api";
import { Region } from "@/types/region";

export class RegionAPI {
  static async getRegionList(params: { current: number; pageSize: number; code?: string; withEvents?: boolean }) {
    const response = await API.get<ListResponse<Region>>("internal/website/region", { params });
    return response.data;
  }

  static async getRegionDetail(code: string) {
    const response = await API.get<Region>(`internal/website/region/detail`, {
      params: {
        code,
      },
    });
    return response.data;
  }
}
