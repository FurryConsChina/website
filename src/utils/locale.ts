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
