import type { Organization, OrganizationEventItem } from "@/types/organization";
import API from "@/api";
import { ListResponse } from "@/types/api";

export class OrganizationsAPI {
  static async getOrganizationList(params: { current: string; pageSize: string; sortBy?: string }) {
    const response = await API.get<ListResponse<Organization & { eventCount: number }>>(
      "website/organization",
      { params },
    );

    return response.data;
  }

  static async getOrganizationDetail(slug: string) {
    const response = await API.get<{
      organization: Organization;
      events: OrganizationEventItem[];
    }>("website/organization/detail", {
      params: { slug },
    });

    return response.data;
  }
}
