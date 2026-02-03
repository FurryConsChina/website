export function monthNumberFormatter(month: string, locale: string): string {
  if (locale === "en") {
    return new Date(Date.parse(month + " 1, 2012"))
      .toLocaleString(locale, {
        month: "short",
      })
      .toString();
  }

  return month;
}

export function getDayjsLocale(locale: string): "zh-cn" | "zh-tw" | "en" {
  switch (locale) {
    case "zh-Hans":
      return "zh-cn";
    case "zh-Hant":
      return "zh-tw";
    default:
      return "en";
  }
}
