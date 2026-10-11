export const OrganizationStatus = {
  Active: "active",
  Inactive: "inactive",
};

/** 与后端 organization_links.type 的取值保持一致。 */
export const OrganizationLinkType = {
  Website: "website",
  Twitter: "twitter",
  Weibo: "weibo",
  QQGroup: "qq_group",
  Bilibili: "bilibili",
  Rednote: "rednote",
  Wikifur: "wikifur",
  Facebook: "facebook",
  Plurk: "plurk",
} as const;
