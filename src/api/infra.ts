import API from "@/api";

type PageviewMetrics = {
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
};

type PageviewReport = PageviewMetrics & {
  comparison: PageviewMetrics;
};

type GetPageviewResponse = {
  success: boolean;
  pageCount?: PageviewReport;
};

export class InfraAPI {
  static async getPageview(path: string) {
    const response = await API.get<GetPageviewResponse>("internal/infra/pageview", {
      params: { path },
    });

    return response.data;
  }
}
