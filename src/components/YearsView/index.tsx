import clsx from "clsx";
import Link from "next/link";
import { useTranslation } from "next-i18next/pages";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

import SimpleEventCard from "@/components/SimpleEventCard";
import type { SimpleEventItem } from "@/types/event";
import { eventGroupByMonth } from "@/utils/event";
import { monthNumberFormatter } from "@/utils/locale";

export type YearSummaryItem = {
  year: number | null;
  count: number;
};

export type YearsPageProps = {
  selectedYear: number | "unknown";
  defaultYear: number | "unknown";
  totalAmount: number;
  citiesCovered: number;
  years: YearSummaryItem[];
  events: SimpleEventItem[];
};

function getYearHref(year: number | null, defaultYear: number | "unknown") {
  const key = year === null ? "unknown" : year;
  if (key === defaultYear) return "/years";
  return `/years/${key}`;
}

export default function YearsView({
  selectedYear,
  defaultYear,
  totalAmount,
  citiesCovered,
  years,
  events,
}: YearsPageProps) {
  const { t, i18n } = useTranslation();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeBarRef = useRef<HTMLAnchorElement>(null);
  const hasAutoScrolledRef = useRef(false);
  const [scrollEdges, setScrollEdges] = useState({ left: false, right: false });

  // 柱状图按年份从早到晚排列，直观呈现历年增长趋势
  const numberedYearsAsc = useMemo(
    () =>
      years
        .filter((item): item is { year: number; count: number } => item.year !== null)
        .sort((a, b) => a.year - b.year),
    [years],
  );
  const unknownYear = useMemo(() => years.find((item) => item.year === null) ?? null, [years]);
  const maxYearCount = useMemo(() => Math.max(1, ...numberedYearsAsc.map((item) => item.count)), [numberedYearsAsc]);

  const monthGroups = useMemo(() => eventGroupByMonth(events, "asc"), [events]);

  const selectedIndex = years.findIndex((item) => (item.year === null ? "unknown" : item.year) === selectedYear);
  const newerYear = selectedIndex > 0 ? years[selectedIndex - 1] : null;
  const olderYear = selectedIndex >= 0 && selectedIndex < years.length - 1 ? years[selectedIndex + 1] : null;

  const formatYearLabel = (year: number | null | "unknown") =>
    year === null || year === "unknown" ? t("years.unknown") : t("years.known", { year });

  const syncScrollEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const left = el.scrollLeft > 4;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
    setScrollEdges((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(syncScrollEdges);
    observer.observe(el);
    return () => observer.disconnect();
  }, [syncScrollEdges, numberedYearsAsc.length]);

  // 首次进入直接定位到当前年份（移动端默认直接看到今年及近几年），后续切换平滑居中
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const frameId = window.requestAnimationFrame(() => {
      if (scroller.scrollWidth <= scroller.clientWidth) {
        syncScrollEdges();
        return;
      }

      const bar = activeBarRef.current;
      let targetLeft = scroller.scrollWidth - scroller.clientWidth;
      if (bar) {
        const scrollerRect = scroller.getBoundingClientRect();
        const barRect = bar.getBoundingClientRect();
        const barLeftInContent = barRect.left - scrollerRect.left + scroller.scrollLeft;
        targetLeft = Math.max(0, barLeftInContent - scroller.clientWidth / 2 + barRect.width / 2);
      }

      if (!hasAutoScrolledRef.current) {
        hasAutoScrolledRef.current = true;
        scroller.scrollLeft = targetLeft;
        syncScrollEdges();
      } else {
        scroller.scrollTo({ left: targetLeft, behavior: "smooth" });
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [selectedYear, syncScrollEdges]);

  const scrollChartBy = (direction: -1 | 1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({
      left: direction * Math.max(180, Math.round(scroller.clientWidth * 0.6)),
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-4">
      {/* 顶部总览 + 可交互历年柱状图选择器 */}
      <div className="shadow-sm rounded-xl p-4 sm:p-6 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2.5">
          <div>
            <h1 className="font-bold text-red-400 text-xl sm:text-2xl">{t("years.title")}</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">
              {t("years.des", {
                totalYear: numberedYearsAsc.length,
                totalAmount,
              })}
            </p>
          </div>

          {unknownYear && (
            <Link
              href={getYearHref(null, defaultYear)}
              aria-current={selectedYear === "unknown" ? "page" : undefined}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:text-sm shrink-0 self-start transition-colors",
                selectedYear === "unknown"
                  ? "bg-red-400 text-white font-bold shadow-sm"
                  : "bg-gray-100 text-slate-600 font-medium hover:bg-gray-200/70",
              )}
            >
              <span>{t("years.unknown")}</span>
              <span
                className={clsx(
                  "rounded-full px-1.5 py-0.5 text-xs tabular-nums leading-none",
                  selectedYear === "unknown" ? "bg-white/20 text-white font-bold" : "text-gray-400",
                )}
              >
                {unknownYear.count}
              </span>
            </Link>
          )}
        </div>

        {numberedYearsAsc.length > 0 && (
          <div className="relative mt-5">
            {/* 左侧溢出渐隐与滚动按钮 */}
            {scrollEdges.left && (
              <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center bg-gradient-to-r from-white via-white/85 to-transparent pr-5">
                <button
                  type="button"
                  aria-label={t("pagination.previousPage")}
                  onClick={() => scrollChartBy(-1)}
                  className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-md ring-1 ring-black/5 hover:text-red-400 active:scale-95 transition"
                >
                  <IoChevronBack className="text-sm" />
                </button>
              </div>
            )}

            {/* 右侧溢出渐隐与滚动按钮 */}
            {scrollEdges.right && (
              <div className="pointer-events-none absolute inset-y-0 right-0 z-20 flex items-center justify-end bg-gradient-to-l from-white via-white/85 to-transparent pl-5">
                <button
                  type="button"
                  aria-label={t("pagination.nextPage")}
                  onClick={() => scrollChartBy(1)}
                  className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-md ring-1 ring-black/5 hover:text-red-400 active:scale-95 transition"
                >
                  <IoChevronForward className="text-sm" />
                </button>
              </div>
            )}

            <nav aria-label={t("header.nav.years")}>
              <div ref={scrollerRef} onScroll={syncScrollEdges} className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                <div className="relative flex items-end gap-1 sm:gap-2 min-w-full w-max pt-2">
                  {/* 背景参考虚线（随内容宽度完整延展） */}
                  <div
                    className="pointer-events-none absolute inset-x-0 top-6 bottom-9 flex flex-col justify-between"
                    aria-hidden
                  >
                    <div className="border-t border-dashed border-gray-100" />
                    <div className="border-t border-dashed border-gray-100" />
                    <div className="border-t border-gray-100" />
                  </div>

                  {numberedYearsAsc.map((item) => {
                    const isActive = item.year === selectedYear;
                    const heightPercent = Math.max(8, Math.round((item.count / maxYearCount) * 100));

                    return (
                      <Link
                        key={item.year}
                        ref={isActive ? activeBarRef : undefined}
                        href={getYearHref(item.year, defaultYear)}
                        aria-current={isActive ? "page" : undefined}
                        aria-label={`${formatYearLabel(item.year)} (${item.count})`}
                        className="group relative z-10 flex-1 min-w-[46px] sm:min-w-[52px] flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 rounded-xl"
                      >
                        <div className="h-32 sm:h-40 w-full flex flex-col items-center justify-end gap-1 px-1 sm:px-1.5">
                          <span
                            className={clsx(
                              "text-[11px] sm:text-xs tabular-nums leading-none transition-colors",
                              isActive
                                ? "font-bold text-red-400"
                                : "font-medium text-gray-400 group-hover:text-red-400",
                            )}
                          >
                            {item.count}
                          </span>
                          <div className="w-full h-24 sm:h-32 flex items-end justify-center">
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className={clsx(
                                "w-full max-w-[34px] sm:max-w-[40px] rounded-t-lg transition-all duration-300",
                                isActive
                                  ? "bg-red-400 shadow-sm"
                                  : "bg-gray-200/90 group-hover:bg-red-300/80 group-active:bg-red-400/80",
                              )}
                            />
                          </div>
                        </div>

                        <span
                          className={clsx(
                            "mt-2 rounded-md px-1.5 py-0.5 text-xs sm:text-sm tabular-nums transition-colors",
                            isActive
                              ? "bg-red-50 font-bold text-red-400"
                              : "font-medium text-gray-500 group-hover:text-slate-800",
                          )}
                        >
                          {item.year}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* 当前选中年份的月度活动表 */}
      <section className="shadow-sm rounded-xl p-4 sm:p-6 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-5 pb-3.5 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <h2 className="font-bold text-red-400 text-xl sm:text-2xl">{formatYearLabel(selectedYear)}</h2>
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs sm:text-sm font-medium text-gray-600 tabular-nums">
              <span>{t("city.eventCountShort", { count: events.length })}</span>
              {citiesCovered > 0 && (
                <>
                  <span className="h-3 w-px bg-gray-300" aria-hidden />
                  <span>{t("years.citiesCovered", { count: citiesCovered })}</span>
                </>
              )}
            </span>
          </div>

          {(olderYear || newerYear) && (
            <div className="flex items-center gap-2 shrink-0">
              {olderYear && (
                <Link
                  href={getYearHref(olderYear.year, defaultYear)}
                  className="inline-flex items-center gap-1 rounded-xl bg-gray-100 hover:bg-gray-200/70 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 transition-colors"
                >
                  <IoChevronBack className="text-sm shrink-0" aria-hidden />
                  <span>{formatYearLabel(olderYear.year)}</span>
                </Link>
              )}
              {newerYear && (
                <Link
                  href={getYearHref(newerYear.year, defaultYear)}
                  className="inline-flex items-center gap-1 rounded-xl bg-gray-100 hover:bg-gray-200/70 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 transition-colors"
                >
                  <span>{formatYearLabel(newerYear.year)}</span>
                  <IoChevronForward className="text-sm shrink-0" aria-hidden />
                </Link>
              )}
            </div>
          )}
        </div>

        {selectedYear === "unknown" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {events.map((event) => (
              <SimpleEventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {monthGroups.map((monthGroup) => (
              <div key={`${selectedYear}-${monthGroup.month}`} className="rounded-xl bg-gray-100 p-2.5 sm:p-3">
                <div className="flex items-baseline gap-1.5 mb-2">
                  <h3 className="text-red-400 text-lg sm:text-xl font-bold">
                    {monthGroup.month === "no-date"
                      ? t("years.unknown")
                      : t("years.month", {
                          month: monthNumberFormatter(monthGroup.month, i18n.language),
                        })}
                  </h3>
                  <span className="text-xs font-medium text-gray-400 tabular-nums">
                    {t("city.eventCountShort", { count: monthGroup.events.length })}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {monthGroup.events.map((event) => (
                    <SimpleEventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
