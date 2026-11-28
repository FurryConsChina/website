export const FEEDBACK_CATEGORIES = ["incorrect_info", "missing_info", "broken_page", "suggestion", "other"] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export type FeedbackTargetType = "event" | "organization" | "profile";

export type FeedbackTarget = {
  type: FeedbackTargetType;
  id: string;
};

export type CreateFeedbackPayload = {
  category: FeedbackCategory;
  content: string;
  contactEmail?: string | null;
  page: {
    path: string;
    title?: string | null;
  };
  target?: FeedbackTarget;
  captchaToken: string;
};

export type CreateFeedbackResponse = {
  id: string;
  status: "new";
};
