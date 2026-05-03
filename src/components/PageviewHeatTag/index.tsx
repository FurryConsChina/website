import clsx from "clsx";
import { useTranslation } from "next-i18next/pages";
import { FaFire } from "react-icons/fa6";

function formatCount(count: number, locale: string): string {
  const intlLocale = locale === "en" ? "en-US" : locale === "zh-Hant" ? "zh-Hant" : "zh-Hans";
  return new Intl.NumberFormat(intlLocale, {
    notation: count >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(count);
}

export default function PageviewTag({ className, count }: { className?: string; count: number | null }) {
  const { t, i18n } = useTranslation();

  if (count == null) return null;

  return (
    <span className={clsx("inline-flex items-center", className)} aria-label={t("pageview.aria", { count })}>
      <FaFire className="text-sm shrink-0" aria-hidden />
      <span className="tabular-nums leading-none ml-1">{formatCount(count, i18n.language)}</span>
    </span>
  );
}
