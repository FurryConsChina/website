import API from "@/api";

type GetPageviewResponse = {
  success: boolean;
  pageCount?: {
    pageviews?: number | { value?: number } | null;
  } | null;
};

type GetPageviewParams = {
  targetType: "event" | "organization" | "profile";
  targetId: string;
  path: string;
};

export class InfraAPI {
  static async getPageview({ targetType, targetId, path }: GetPageviewParams): Promise<number | null> {
    const response = await API.get<GetPageviewResponse>("cms/infra/pageview", {
      params: { targetType, targetId, path },
    });

    const pageviews = response.data.pageCount?.pageviews;
    const count = typeof pageviews === "number" ? pageviews : pageviews?.value;

    return typeof count === "number" && Number.isFinite(count) ? count : null;
  }
}
