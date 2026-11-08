import type { Organization, OrganizationEventItem } from "@/types/organization";
import API from "@/api";
import { ListResponse } from "@/types/api";

export class OrganizationsAPI {
  static async getOrganizationList(params: { current: string; pageSize: string; sortBy?: string }) {
    const response = await API.get<ListResponse<Omit<Organization, "links"> & { eventCount: number }>>(
      "website/organization",
      {
        params,
      },
    );

    return response.data;
  }

  static async getOrganizationDetail(slug: string) {
    const response = await API.get<{
      organization: Organization;
      firstEventStartAt: string | null;
      latestEventStartAt: string | null;
    }>(`website/organization/${slug}`);

    return response.data;
  }

  static async getOrganizationEvents(
    slug: string,
    params: { current: number; pageSize: number; orderByStartAt?: "asc" | "desc" },
  ) {
    const response = await API.get<ListResponse<OrganizationEventItem>>(`website/organization/${slug}/events`, {
      params,
    });

    return response.data;
  }
}
