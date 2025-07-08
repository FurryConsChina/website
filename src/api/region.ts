import API from "@/api";
import { ListResponse } from "@/types/api";
import { Region } from "@/types/region";

export async function getRegionList({
  current,
  pageSize,
  code,
  withEvents,
}: {
  current: number;
  pageSize: number;
  code?: string;
  withEvents?: boolean;
}) {
  const response = await API.get<ListResponse<Region>>("internal/cms/region", {
    params: {
      current,
      pageSize,
      code,
      withEvents,
    },
  });
  return response.data;
}

export async function getRegionDetail(code: string) {
  const response = await API.get<Region>(`internal/cms/region/detail`, {
    params: {
      code,
    },
  });
  return response.data;
}
