import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import clsx from "clsx";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next/pages";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IoBusinessOutline, IoClose, IoLocationOutline, IoSearch, IoTimeOutline } from "react-icons/io5";
import { VscLoading } from "react-icons/vsc";

import Image from "@/components/Image";
import type { SearchAPIResponse, SearchEventHit, SearchOrganizationHit, SearchRegionHit } from "@/pages/api/search";
import { getEventCoverImgPath } from "@/utils/imageLoader";
import { sendTrack } from "@/utils/track";
import { getEventDetailUrl } from "@/utils/url";

const RECENT_STORAGE_KEY = "fec_recent_searches";
const MAX_RECENT_SEARCHES = 5;

const EMPTY_RESULTS: SearchAPIResponse = {
  total: 0,
  totalEvents: 0,
  organizations: [],
  regions: [],
  events: [],
};

function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(keyword: string): string[] {
  const trimmed = keyword.trim();
  if (!trimmed || typeof window === "undefined") return readRecentSearches();
  const next = [trimmed, ...readRecentSearches().filter((item) => item !== trimmed)].slice(0, MAX_RECENT_SEARCHES);
  try {
    window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage quota / privacy mode errors
  }
  return next;
}

function removeRecentSearch(keyword: string): string[] {
  const next = readRecentSearches().filter((item) => item !== keyword);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  }
  return next;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchesAnyToken(text: string | null | undefined, tokens: string[]) {
  if (!text || tokens.length === 0) return false;
  const lower = text.toLowerCase();
  return tokens.some((token) => lower.includes(token.toLowerCase()));
}

function HighlightText({ text, tokens }: { text: string; tokens: string[] }) {
  if (!text || tokens.length === 0) return <>{text}</>;
  const pattern = new RegExp(`(${tokens.map(escapeRegExp).join("|")})`, "gi");
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <mark key={index} className="bg-red-50 text-red-500 font-semibold rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

type SelectableTarget =
  | { kind: "organization"; hit: SearchOrganizationHit }
  | { kind: "region"; hit: SearchRegionHit }
  | { kind: "event"; hit: SearchEventHit }
  | { kind: "viewAll"; keyword: string };

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchAPIResponse>(EMPTY_RESULTS);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [prevOpen, setPrevOpen] = useState(open);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  if (open && !prevOpen) {
    setPrevOpen(true);
    setRecentSearches(readRecentSearches());
  } else if (!open && prevOpen) {
    setPrevOpen(false);
  }

  const cancelPendingRequest = useCallback(() => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  useEffect(() => cancelPendingRequest, [cancelPendingRequest]);

  const executeSearch = useCallback(
    (keyword: string) => {
      cancelPendingRequest();
      const trimmed = keyword.trim();

      if (!trimmed) {
        setResults(EMPTY_RESULTS);
        setIsLoading(false);
        setHasSearched(false);
        setActiveIndex(0);
        return;
      }

      setIsLoading(true);
      debounceTimerRef.current = window.setTimeout(async () => {
        const controller = new AbortController();
        abortControllerRef.current = controller;
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
            signal: controller.signal,
          });
          if (!response.ok) throw new Error("Search failed");
          const data = (await response.json()) as SearchAPIResponse;
          setResults(data);
          setHasSearched(true);
          setActiveIndex(0);
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setResults(EMPTY_RESULTS);
          setHasSearched(true);
        } finally {
          if (abortControllerRef.current === controller) {
            setIsLoading(false);
          }
        }
      }, 220);
    },
    [cancelPendingRequest],
  );

  const handleClose = useCallback(() => {
    cancelPendingRequest();
    setIsLoading(false);
    onClose();
  }, [cancelPendingRequest, onClose]);

  const handleQueryChange = (nextValue: string) => {
    setQuery(nextValue);
    executeSearch(nextValue);
  };

  const trimmedQuery = query.trim();
  const queryTokens = useMemo(() => trimmedQuery.split(/\s+/).filter(Boolean).slice(0, 5), [trimmedQuery]);

  const selectableItems = useMemo<SelectableTarget[]>(() => {
    if (!trimmedQuery) return [];
    const items: SelectableTarget[] = [];
    for (const hit of results.organizations) items.push({ kind: "organization", hit });
    for (const hit of results.regions) items.push({ kind: "region", hit });
    for (const hit of results.events) items.push({ kind: "event", hit });
    if (results.totalEvents > 0) {
      items.push({ kind: "viewAll", keyword: trimmedQuery });
    }
    return items;
  }, [trimmedQuery, results]);

  const openTarget = (target: SelectableTarget) => {
    if (trimmedQuery) {
      setRecentSearches(saveRecentSearch(trimmedQuery));
    }
    handleClose();

    if (target.kind === "organization") {
      sendTrack({
        eventName: "click-filter",
        eventValue: { filterName: "search-modal-org", filterValue: target.hit.slug },
      });
      void router.push(`/${target.hit.slug}`);
      return;
    }

    if (target.kind === "region") {
      sendTrack({
        eventName: "click-filter",
        eventValue: { filterName: "search-modal-region", filterValue: target.hit.slug },
      });
      void router.push(`/city/${target.hit.slug}`);
      return;
    }

    if (target.kind === "event") {
      sendTrack({
        eventName: "click-filter",
        eventValue: { filterName: "search-modal-hit", filterValue: target.hit.urlKey },
      });
      void router.push(getEventDetailUrl({ urlKey: target.hit.urlKey }));
      return;
    }

    sendTrack({
      eventName: "click-filter",
      eventValue: { filterName: "keyword", filterValue: target.keyword },
    });
    void router.push({
      pathname: "/",
      query: { q: target.keyword, includePastEvents: "true" },
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!trimmedQuery || selectableItems.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % selectableItems.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + selectableItems.length) % selectableItems.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = selectableItems[activeIndex];
      if (target) openTarget(target);
    }
  };

  const orgOffset = 0;
  const regionOffset = results.organizations.length;
  const eventOffset = regionOffset + results.regions.length;
  const viewAllIndex = eventOffset + results.events.length;
  const hasAnyHit = results.organizations.length > 0 || results.regions.length > 0 || results.events.length > 0;

  return (
    <Dialog open={open} onClose={handleClose} initialFocus={inputRef} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-[2px] transition duration-150 data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 overflow-y-auto px-3 pt-[6vh] pb-8 sm:px-6 sm:pt-[10vh]">
        <DialogPanel
          transition
          className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 transition duration-150 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          {/* 顶部输入栏 */}
          <div className="flex items-center gap-3.5 border-b border-gray-100 px-5 h-16">
            {isLoading ? (
              <VscLoading className="text-red-400 text-2xl shrink-0 animate-spin" aria-hidden />
            ) : (
              <IoSearch className="text-red-400 text-2xl shrink-0" aria-hidden />
            )}
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("event.filter.searchPlaceholder")}
              aria-label={t("event.filter.searchPlaceholder")}
              className="w-full min-w-0 bg-transparent text-base sm:text-lg text-gray-800 placeholder:text-gray-400 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                aria-label={t("event.filter.clearAll")}
                onClick={() => {
                  handleQueryChange("");
                  inputRef.current?.focus();
                }}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 shrink-0 transition-colors"
              >
                <IoClose className="text-xl" />
              </button>
            )}
          </div>

          {/* 内容区：最近搜索 / 分组聚合结果（展商、城市、展会） / 空态 */}
          <div className="max-h-[68vh] overflow-y-auto p-3">
            {!trimmedQuery ? (
              recentSearches.length > 0 ? (
                <div className="p-1">
                  <div className="px-3 pb-2 text-xs font-bold tracking-wide text-gray-400">
                    {t("searchModal.recent")}
                  </div>
                  <ul className="space-y-1">
                    {recentSearches.map((item) => (
                      <li
                        key={item}
                        className="group flex items-center justify-between rounded-xl px-3.5 py-2.5 hover:bg-[#f5f5f7] transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => handleQueryChange(item)}
                          className="flex flex-1 items-center gap-3 text-left text-sm sm:text-base text-gray-700 min-w-0"
                        >
                          <IoTimeOutline className="text-gray-400 text-lg shrink-0" aria-hidden />
                          <span className="truncate">{item}</span>
                        </button>
                        <button
                          type="button"
                          aria-label={t("event.filter.clearAll")}
                          onClick={() => setRecentSearches(removeRecentSearch(item))}
                          className="p-1 rounded-full text-gray-300 hover:text-gray-600 transition-colors shrink-0"
                        >
                          <IoClose className="text-base" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="py-12 px-4 text-center text-sm sm:text-base text-gray-400">
                  {t("searchModal.emptyTip")}
                </div>
              )
            ) : hasSearched && !isLoading && !hasAnyHit ? (
              <div className="py-12 px-4 text-center text-sm sm:text-base text-gray-400">
                {t("searchModal.noResult", { keyword: trimmedQuery })}
              </div>
            ) : (
              <div className="space-y-3">
                {/* 展商分组 */}
                {results.organizations.length > 0 && (
                  <div>
                    <div className="px-3.5 pt-1.5 pb-1.5 text-xs font-bold tracking-wide text-gray-400">
                      {t("searchModal.groupOrganizations")}
                    </div>
                    <div className="space-y-1">
                      {results.organizations.map((org, idx) => {
                        const itemIndex = orgOffset + idx;
                        const isActive = activeIndex === itemIndex;
                        return (
                          <button
                            key={org.id}
                            type="button"
                            onMouseEnter={() => setActiveIndex(itemIndex)}
                            onClick={() => openTarget({ kind: "organization", hit: org })}
                            className={clsx(
                              "w-full flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-left transition-colors",
                              isActive ? "bg-[#f5f5f7]" : "hover:bg-[#f5f5f7]/70",
                            )}
                          >
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                              {org.logoUrl ? (
                                <Image
                                  src={org.logoUrl}
                                  alt={org.name}
                                  width={96}
                                  height={96}
                                  fallbackWidth={96}
                                  fallbackHeight={96}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <IoBusinessOutline className="text-xl" aria-hidden />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div
                                className={clsx(
                                  "text-sm sm:text-base font-bold truncate transition-colors",
                                  isActive ? "text-red-400" : "text-gray-800",
                                )}
                              >
                                <HighlightText text={org.name} tokens={queryTokens} />
                              </div>
                              <div className="mt-0.5 text-xs sm:text-sm text-gray-500">
                                {t("searchModal.eventCount", { count: org.eventCount })}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 城市分组 */}
                {results.regions.length > 0 && (
                  <div>
                    <div className="px-3.5 pt-1.5 pb-1.5 text-xs font-bold tracking-wide text-gray-400">
                      {t("searchModal.groupRegions")}
                    </div>
                    <div className="space-y-1">
                      {results.regions.map((region, idx) => {
                        const itemIndex = regionOffset + idx;
                        const isActive = activeIndex === itemIndex;
                        const subtitle = [region.parentName, t("searchModal.eventCount", { count: region.eventCount })]
                          .filter(Boolean)
                          .join(" · ");
                        return (
                          <button
                            key={region.id}
                            type="button"
                            onMouseEnter={() => setActiveIndex(itemIndex)}
                            onClick={() => openTarget({ kind: "region", hit: region })}
                            className={clsx(
                              "w-full flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-left transition-colors",
                              isActive ? "bg-[#f5f5f7]" : "hover:bg-[#f5f5f7]/70",
                            )}
                          >
                            <div className="h-12 w-12 shrink-0 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                              <IoLocationOutline className="text-xl" aria-hidden />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div
                                className={clsx(
                                  "text-sm sm:text-base font-bold truncate transition-colors",
                                  isActive ? "text-red-400" : "text-gray-800",
                                )}
                              >
                                <HighlightText text={region.name} tokens={queryTokens} />
                              </div>
                              <div className="mt-0.5 text-xs sm:text-sm text-gray-500 truncate">
                                <HighlightText text={subtitle} tokens={queryTokens} />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 展会分组 */}
                {results.events.length > 0 && (
                  <div>
                    <div className="px-3.5 pt-1.5 pb-1.5 text-xs font-bold tracking-wide text-gray-400">
                      {t("searchModal.groupEvents")}
                    </div>
                    <div className="space-y-1">
                      {results.events.map((hit, idx) => {
                        const itemIndex = eventOffset + idx;
                        const isActive = activeIndex === itemIndex;
                        const coverSrc = getEventCoverImgPath(hit);
                        const dateText = hit.startAt ? dayjs(hit.startAt).format("YYYY/MM/DD") : null;
                        const meta = [dateText, hit.regionName, hit.organizationName].filter(Boolean).join(" · ");
                        const addressMatched =
                          Boolean(hit.placeAddress) &&
                          hit.placeAddress !== hit.placeName &&
                          matchesAnyToken(hit.placeAddress, queryTokens);
                        const locationLine = addressMatched
                          ? [hit.placeName, hit.placeAddress].filter(Boolean).join(" · ")
                          : hit.placeName;
                        const matchedFeatures = hit.features
                          .filter((feature) => matchesAnyToken(feature, queryTokens))
                          .slice(0, 3);

                        return (
                          <button
                            key={hit.id}
                            type="button"
                            onMouseEnter={() => setActiveIndex(itemIndex)}
                            onClick={() => openTarget({ kind: "event", hit })}
                            className={clsx(
                              "w-full flex items-center gap-4 rounded-xl px-3.5 py-3 text-left transition-colors",
                              isActive ? "bg-[#f5f5f7]" : "hover:bg-[#f5f5f7]/70",
                            )}
                          >
                            <div className="relative h-14 w-24 sm:h-16 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                              <Image
                                src={coverSrc}
                                alt={hit.name}
                                width={224}
                                height={128}
                                fallbackWidth={224}
                                fallbackHeight={128}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div
                                className={clsx(
                                  "text-sm sm:text-base font-bold truncate transition-colors",
                                  isActive ? "text-red-400" : "text-gray-800",
                                )}
                              >
                                <HighlightText text={hit.name} tokens={queryTokens} />
                              </div>
                              {meta && (
                                <div className="mt-0.5 text-xs sm:text-sm text-gray-500 truncate">
                                  <HighlightText text={meta} tokens={queryTokens} />
                                </div>
                              )}
                              {locationLine && (
                                <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-400 truncate">
                                  <IoLocationOutline className="shrink-0 text-xs" aria-hidden />
                                  <span className="truncate">
                                    <HighlightText text={locationLine} tokens={queryTokens} />
                                  </span>
                                </div>
                              )}
                              {matchedFeatures.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {matchedFeatures.map((feature) => (
                                    <span
                                      key={feature}
                                      className="inline-flex items-center rounded-md bg-red-50 px-1.5 py-0.5 text-[11px] font-medium text-red-500"
                                    >
                                      #{feature}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {results.totalEvents > 0 && (
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(viewAllIndex)}
                    onClick={() => openTarget({ kind: "viewAll", keyword: trimmedQuery })}
                    className={clsx(
                      "w-full flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-left text-sm sm:text-base transition-colors",
                      activeIndex === viewAllIndex ? "bg-[#f5f5f7] text-red-400 font-bold" : "text-gray-600",
                    )}
                  >
                    <IoSearch className="text-lg shrink-0 text-red-400" aria-hidden />
                    <span className="truncate">{t("searchModal.viewAll", { keyword: trimmedQuery })}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {trimmedQuery && hasSearched && hasAnyHit && (
            <div className="flex items-center justify-end border-t border-gray-100 bg-gray-50/70 px-5 py-2.5 text-xs text-gray-400">
              <span>{t("searchModal.totalResults", { count: results.total })}</span>
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
