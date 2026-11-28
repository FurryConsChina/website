import axios from "axios";

import type { CreateFeedbackPayload, CreateFeedbackResponse } from "@/types/feedback";
import { PUBLIC_API_URL } from "@/utils/env";

const publicFeedbackClient = axios.create({
  baseURL: PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export class FeedbackAPI {
  static async submit(payload: CreateFeedbackPayload, locale?: string): Promise<CreateFeedbackResponse> {
    const response = await publicFeedbackClient.post<CreateFeedbackResponse>("/website/feedback", payload, {
      headers: locale ? { "Accept-Language": locale } : undefined,
    });
    return response.data;
  }
}
