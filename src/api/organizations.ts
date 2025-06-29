import { API } from "./index";
import { z } from "zod";
import { OrganizationType, OrganizationSchema } from "@/types/organization";

// 组织详情响应 schema
const OrganizationDetailResponseSchema = z.object({
  organization: OrganizationSchema,
  events: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      address: z.string().nullable(),
      addressExtra: z.object({ city: z.string().nullable() }).nullable(),
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
    const response = await API.get("open/v1/organization/detail", {
      searchParams: { slug },
    }).json();
    
    const validResult = OrganizationDetailResponseSchema.safeParse(response);
    
    if (!validResult.success) {
      throw new Error(`Invalid organization detail response: ${validResult.error}`);
    }
    
    return validResult.data;
  },

  // 获取所有组织列表（用于站点地图）
  async getAllOrganizations(): Promise<SitemapOrganizationType[]> {
    const response = await API.get("internal/cms/organization/all").json();
    const validOrganizations = z.array(SitemapOrganizationSchema).safeParse(response);
    return validOrganizations.data || [];
  },
}; 