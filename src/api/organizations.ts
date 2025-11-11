import { z } from "zod";
import { OrganizationSchema } from "@/types/organization";
import API from "@/api";

// 组织详情响应 schema
const OrganizationDetailResponseSchema = z.object({
  organization: OrganizationSchema,
  events: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      address: z.string().nullable(),
      region: z
        .object({
          name: z.string(),
          code: z.string(),
          type: z.string(),
          level: z.number(),
          localName: z.string(),
          sortOrder: z.number(),
        })
        .nullable(),
      thumbnail: z.string().nullable(),
      startAt: z.string().datetime().nullable(),
      endAt: z.string().datetime().nullable(),
      slug: z.string(),
      features: z.object({ self: z.array(z.string()).nullish() }).nullish(),
      commonFeatures: z.array(z.any()).nullish(),
    })
  ),
});

// 站点地图组织 schema
const SitemapOrganizationSchema = z.object({
  name: z.string(),
  logoUrl: z.string().nullable(),
  slug: z.string(),
  status: z.string(),
  id: z.string(),
});

// 定义返回类型
type OrganizationDetailType = z.infer<typeof OrganizationDetailResponseSchema>;
type SitemapOrganizationType = z.infer<typeof SitemapOrganizationSchema>;

// API 函数
export const organizationsAPI = {
  // 获取组织详情
  async getOrganizationDetail(slug: string): Promise<OrganizationDetailType> {
    const response = await API.get("internal/website/organization/detail", {
      params: { slug },
    });

    const validResult = OrganizationDetailResponseSchema.parse(response.data);

    return validResult;
  },

  // 获取所有组织列表（用于站点地图）
  async getAllOrganizations(): Promise<SitemapOrganizationType[]> {
    const response = await API.get("internal/website/organization/all");
    const validOrganizations = z
      .array(SitemapOrganizationSchema)
      .parse(response.data);
    return validOrganizations;
  },
};
