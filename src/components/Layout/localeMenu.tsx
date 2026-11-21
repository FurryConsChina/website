import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";
import { FaLanguage } from "react-icons/fa6";
import { IoCheckmark, IoChevronDown } from "react-icons/io5";
import { useTranslation } from "next-i18next/pages";

export const SupportedLocales = [
  { code: "zh-Hans", labelKey: "locale.zhHans" },
  { code: "zh-Hant", label: "繁體中文" },
  { code: "en", labelKey: "locale.en" },
  // { code: "ru", label: "Русский" },
] as const;

export default function LocaleMenu() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = router.locale || "zh-Hans";

  return (
    <div className="relative flex justify-center">
      <button type="button" className="text-2xl text-gray-600" onClick={() => setOpen(!open)}>
        <FaLanguage className="align-middle" size={24} />
      </button>
      {open && (
        <div className="absolute top-10 right-0 w-fit bg-white shadow rounded-md px-2 py-2">
          <ul className="flex flex-col gap-1">
            {SupportedLocales.map((item) => {
              const isActive = currentLocale === item.code;
              return (
                <li key={item.code}>
                  <Link
                    href={pathname}
                    locale={item.code}
                    className={clsx(
                      "px-4 py-2 block text-center whitespace-nowrap rounded-md transition-colors",
                      isActive ? "text-red-400 font-bold bg-red-50/60" : "hover:bg-gray-100",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {"labelKey" in item ? t(item.labelKey) : item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export function MobileLocaleSelector({ onSelect }: { onSelect?: () => void }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = router.locale || "zh-Hans";

  const currentItem = SupportedLocales.find((item) => item.code === currentLocale) ?? SupportedLocales[0];
  const currentLabel = "labelKey" in currentItem ? t(currentItem.labelKey) : currentItem.label;

  return (
    <div className="mt-2.5 pt-2.5 border-t border-gray-200/80">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white text-slate-700 shadow-sm active:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <FaLanguage size={20} className="text-gray-500 shrink-0" />
          <span className="font-bold text-slate-700">{currentLabel}</span>
        </span>
        <IoChevronDown className={clsx("text-gray-400 transition-transform duration-200", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <ul className="mt-1.5 bg-white rounded-xl p-1.5 shadow-sm grid grid-cols-1 gap-1 max-h-48 overflow-y-auto">
          {SupportedLocales.map((item) => {
            const isActive = currentLocale === item.code;
            const label = "labelKey" in item ? t(item.labelKey) : item.label;
            return (
              <li key={item.code}>
                <Link
                  href={pathname}
                  locale={item.code}
                  className={clsx(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-red-50 text-red-500 font-bold" : "text-slate-600 active:bg-gray-100",
                  )}
                  onClick={() => {
                    setExpanded(false);
                    onSelect?.();
                  }}
                >
                  <span>{label}</span>
                  {isActive && <IoCheckmark className="text-base shrink-0" />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
