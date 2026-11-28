export const IS_CN_REGION = process.env.NEXT_PUBLIC_REGION === "CN";
export const PUBLIC_URL = process.env.NEXT_PUBLIC_WEBSITE_URL;
export const PUBLIC_API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://api.furrycons.cn").replace(/\/+$/, "");
export const CAP_API_ENDPOINT = process.env.NEXT_PUBLIC_CAP_API_ENDPOINT || "https://cap.furrycons.cn/5ddbdcfd4c/";
