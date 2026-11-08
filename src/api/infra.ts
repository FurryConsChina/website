import API from "@/api";

type GetPageviewResponse = {
  success: true;
  pageCount: {
    pageviews: number;
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

    const count = response.data.pageCount?.pageviews;

    return typeof count === "number" && Number.isFinite(count) ? count : null;
  }
}
