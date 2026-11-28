import type { EventItem } from "@/types/event";
import clsx from "clsx";
import { useTranslation } from "next-i18next/pages";
import { useCallback, useEffect, useRef, useState } from "react";

export type EventImageAnchor = {
  id: string;
  index: number;
  title: string;
  description: string | null;
};

type EventMediaImage = NonNullable<NonNullable<EventItem["media"]>["images"]>[number];

const ACTIVE_OFFSET_PX = 140;
const SCROLL_SETTLE_MS = 150;
const SCROLL_LOCK_MAX_MS = 900;

export function getEventImageAnchorId(index: number) {
  return `event-image-${index + 1}`;
}

export function getEventImageAnchors(images?: EventMediaImage[]): EventImageAnchor[] {
  if (!images?.length) return [];

  return images.reduce<EventImageAnchor[]>((acc, image, index) => {
    const title = image.title?.trim();
    if (title) {
      acc.push({
        id: getEventImageAnchorId(index),
        index,
        title,
        description: image.description?.trim() || null,
      });
    }
    return acc;
  }, []);
}

function useActiveAnchor(anchors: EventImageAnchor[]) {
  const [activeId, setActiveId] = useState<string>(() => anchors[0]?.id ?? "");
  const anchorIdsKey = anchors.map((anchor) => anchor.id).join(",");
  const isLockedRef = useRef(false);
  const settleTimerRef = useRef<number | null>(null);

  const clearSettleTimer = useCallback(() => {
    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
  }, []);

  const unlock = useCallback(() => {
    clearSettleTimer();
    isLockedRef.current = false;
  }, [clearSettleTimer]);

  const selectAnchor = useCallback(
    (id: string) => {
      setActiveId(id);
      isLockedRef.current = true;
      clearSettleTimer();
      settleTimerRef.current = window.setTimeout(unlock, SCROLL_LOCK_MAX_MS);
    },
    [clearSettleTimer, unlock],
  );

  useEffect(() => {
    if (!anchorIdsKey) {
      return;
    }

    const ids = anchorIdsKey.split(",");
    let rafId: number | null = null;

    const updateActiveByScroll = () => {
      rafId = null;
      if (isLockedRef.current) return;

      const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
      if (elements.length === 0) return;

      let nextId = elements[0].id;
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= ACTIVE_OFFSET_PX) {
          nextId = el.id;
        } else {
          break;
        }
      }

      setActiveId((prev) => (prev === nextId ? prev : nextId));
    };

    const handleScroll = () => {
      if (isLockedRef.current) {
        clearSettleTimer();
        settleTimerRef.current = window.setTimeout(unlock, SCROLL_SETTLE_MS);
        return;
      }

      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateActiveByScroll);
      }
    };

    const handleScrollEnd = () => {
      if (isLockedRef.current) {
        unlock();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("scrollend", handleScrollEnd, { passive: true });
    window.addEventListener("wheel", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });

    return () => {
      clearSettleTimer();
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scrollend", handleScrollEnd);
      window.removeEventListener("wheel", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [anchorIdsKey, clearSettleTimer, unlock]);

  return { activeId, selectAnchor };
}

export default function EventImageAnchors({
  anchors,
  variant,
  className,
}: {
  anchors: EventImageAnchor[];
  variant: "sidebar" | "bar";
  className?: string;
}) {
  const { t } = useTranslation();
  const { activeId, selectAnchor } = useActiveAnchor(anchors);

  if (anchors.length === 0) {
    return null;
  }

  const activeIndex = Math.max(
    0,
    anchors.findIndex((anchor) => anchor.id === activeId),
  );

  if (variant === "bar") {
    return (
      <nav
        aria-label={t("event.imageNav.aria")}
        className={clsx(
          "sticky top-14 z-20 -mx-2.5 px-2.5 py-2 mb-2 bg-white/95 backdrop-blur-sm border-b border-gray-100",
          className,
        )}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          {anchors.map((anchor, order) => {
            const isActive = activeId === anchor.id;
            return (
              <a
                key={anchor.id}
                href={`#${anchor.id}`}
                onClick={() => selectAnchor(anchor.id)}
                aria-current={isActive ? "location" : undefined}
                className={clsx(
                  "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs whitespace-nowrap shrink-0 transition-colors",
                  isActive
                    ? "bg-red-50 text-red-400 font-bold"
                    : "bg-[#f5f5f7] text-slate-600 active:bg-gray-200/70 font-medium",
                )}
              >
                <span className="text-[10px] opacity-60 tabular-nums">{String(order + 1).padStart(2, "0")}</span>
                <span>{anchor.title}</span>
              </a>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav aria-label={t("event.imageNav.aria")} className={clsx("bg-white shadow-sm rounded-xl p-4", className)}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-sm font-bold text-slate-800">{t("event.imageNav.title")}</h3>
        <span className="text-xs text-gray-400 tabular-nums">
          {activeIndex + 1} / {anchors.length}
        </span>
      </div>

      <ol className="border-l-2 border-gray-100 ml-1 space-y-0.5">
        {anchors.map((anchor, order) => {
          const isActive = activeId === anchor.id;
          return (
            <li key={anchor.id}>
              <a
                href={`#${anchor.id}`}
                onClick={() => selectAnchor(anchor.id)}
                aria-current={isActive ? "location" : undefined}
                className={clsx(
                  "group -ml-[2px] flex items-baseline gap-2 border-l-2 pl-3.5 py-1.5 text-sm transition-colors",
                  isActive
                    ? "border-red-400 text-red-400 font-semibold"
                    : "border-transparent text-slate-600 hover:border-gray-300 hover:text-slate-900",
                )}
              >
                <span
                  className={clsx(
                    "text-xs tabular-nums shrink-0 transition-colors",
                    isActive ? "text-red-400/80" : "text-gray-400 group-hover:text-gray-500",
                  )}
                >
                  {String(order + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{anchor.title}</span>
                  {anchor.description && (
                    <span className="block text-xs font-normal text-gray-400 truncate mt-0.5">
                      {anchor.description}
                    </span>
                  )}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
