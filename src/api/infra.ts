import API from "@/api";

type GetPageviewResponse = {
  success: boolean;
  pageCount?: {
    pageviews?: number | { value?: number } | null;
  } | null;
};

export class InfraAPI {
  static async getPageview(path: string): Promise<number | null> {
    const response = await API.get<GetPageviewResponse>("cms/infra/pageview", {
      params: { path },
    });

    const pageviews = response.data.pageCount?.pageviews;
    const count = typeof pageviews === "number" ? pageviews : pageviews?.value;

    return typeof count === "number" && Number.isFinite(count) ? count : null;
  }
}
