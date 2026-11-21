import { Field, Label, Switch } from "@headlessui/react";
import clsx from "clsx";
import { useTranslation } from "next-i18next/pages";
import { useCallback, useMemo, useState } from "react";
import { IoChevronDown, IoClose } from "react-icons/io5";

import RegionCascaderPanel, { type FilterRegionOption } from "@/components/EventFilterBar/RegionCascader";
import { EventLocationType, EventScale, EventTypeMap } from "@/constants/event";
import { sendTrack } from "@/utils/track";

export type { FilterRegionOption };

export type FilterFeatureOption = {
  name: string;
  category: string | null;
};

export type HomeFilterState = {
  q: string;
  includePastEvents: boolean;
  region: string[];
  scale: string[];
  type: string[];
  locationType: string[];
  feature: string[];
};

type FilterTabKey = "region" | "type" | "scale" | "locationType" | "feature";

const ScaleOptions = [EventScale.Cosy, EventScale.Small, EventScale.Medium, EventScale.Large, EventScale.XLarge];

const EventTypeOptions = [
  EventTypeMap.AllInCon,
  EventTypeMap.ComicMarket,
  EventTypeMap.SuitOnlyCon,
  EventTypeMap.TravelCon,
  EventTypeMap.FandomMeetup,
];

const LocationTypeOptions = [EventLocationType.Hotel, EventLocationType.Venue, EventLocationType.Online];

const FeatureCategoryOrder: Record<string, number> = {
  event: 0,
  ability: 1,
  facility: 2,
};

export const EMPTY_FILTERS: HomeFilterState = {
  q: "",
  includePastEvents: false,
  region: [],
  scale: [],
  type: [],
  locationType: [],
  feature: [],
};

function toggleArrayValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export default function EventFilterBar({
  filters,
  regions,
  features,
  onChange,
}: {
  filters: HomeFilterState;
  regions: FilterRegionOption[];
  features: FilterFeatureOption[];
  onChange: (next: HomeFilterState) => void;
}) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<FilterTabKey | null>(null);
  const [lastOpenedTab, setLastOpenedTab] = useState<FilterTabKey>("region");

  const regionNameMap = useMemo(() => new Map(regions.map((item) => [item.slug, item.name])), [regions]);

  const updateField = useCallback(
    <K extends keyof HomeFilterState>(key: K, value: HomeFilterState[K]) => {
      sendTrack({
        eventName: "click-filter",
        eventValue: { filterName: key, filterValue: value },
      });
      onChange({ ...filters, [key]: value });
    },
    [filters, onChange],
  );

  const handleToggleTab = (tab: FilterTabKey) => {
    if (activeTab === tab) {
      setActiveTab(null);
      return;
    }
    setLastOpenedTab(tab);
    setActiveTab(tab);
  };

  const tabs = useMemo(() => {
    const items: Array<{ key: FilterTabKey; label: string; count: number }> = [];
    if (regions.length > 0) {
      items.push({ key: "region", label: t("event.filter.city"), count: filters.region.length });
    }
    items.push({ key: "type", label: t("event.filter.type"), count: filters.type.length });
    items.push({ key: "scale", label: t("event.filter.scale"), count: filters.scale.length });
    items.push({ key: "locationType", label: t("event.filter.locationType"), count: filters.locationType.length });
    if (features.length > 0) {
      items.push({ key: "feature", label: t("event.filter.feature"), count: filters.feature.length });
    }
    return items;
  }, [regions.length, features.length, filters, t]);

  const featureGroups = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const item of features) {
      const key = item.category?.trim() || "";
      const list = map.get(key) ?? [];
      list.push(item.name);
      map.set(key, list);
    }
    const entries = Array.from(map.entries());
    entries.sort(([a], [b]) => {
      if (!a && b) return 1;
      if (a && !b) return -1;
      return (FeatureCategoryOrder[a] ?? 99) - (FeatureCategoryOrder[b] ?? 99);
    });
    return entries.map(([category, names]) => ({ category, names }));
  }, [features]);

  const hasMultipleFeatureCategories =
    featureGroups.length > 1 || (featureGroups.length === 1 && Boolean(featureGroups[0].category));

  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];

    if (filters.q) {
      chips.push({
        key: "q",
        label: t("event.filter.keywordPrefix", { keyword: filters.q }),
        onRemove: () => updateField("q", ""),
      });
    }

    filters.region.forEach((slug) => {
      chips.push({
        key: `region:${slug}`,
        label: regionNameMap.get(slug) ?? slug,
        onRemove: () =>
          updateField(
            "region",
            filters.region.filter((item) => item !== slug),
          ),
      });
    });

    filters.type.forEach((type) => {
      chips.push({
        key: `type:${type}`,
        label: t(`event.type.${type}`),
        onRemove: () =>
          updateField(
            "type",
            filters.type.filter((item) => item !== type),
          ),
      });
    });

    filters.scale.forEach((scale) => {
      chips.push({
        key: `scale:${scale}`,
        label: t(`event.filter.${scale}`),
        onRemove: () =>
          updateField(
            "scale",
            filters.scale.filter((item) => item !== scale),
          ),
      });
    });

    filters.locationType.forEach((loc) => {
      chips.push({
        key: `locationType:${loc}`,
        label: t(`event.locationType.${loc}`),
        onRemove: () =>
          updateField(
            "locationType",
            filters.locationType.filter((item) => item !== loc),
          ),
      });
    });

    filters.feature.forEach((feature) => {
      chips.push({
        key: `feature:${feature}`,
        label: feature,
        onRemove: () =>
          updateField(
            "feature",
            filters.feature.filter((item) => item !== feature),
          ),
      });
    });

    return chips;
  }, [filters, regionNameMap, t, updateField]);

  const displayedTab = activeTab ?? lastOpenedTab;

  const upcomingSwitch = (
    <Field className="min-w-0">
      <div className="flex items-center gap-2.5">
        <Switch
          checked={!filters.includePastEvents}
          onChange={(checked) => updateField("includePastEvents", !checked)}
          className={clsx(
            !filters.includePastEvents ? "bg-red-400" : "bg-gray-200",
            "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          )}
        >
          <span className="sr-only">{t("event.filter.onlyAvailable")}</span>
          <span
            className={clsx(
              !filters.includePastEvents ? "translate-x-6" : "translate-x-1",
              "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition",
            )}
          />
        </Switch>
        <Label className="text-sm text-gray-600 font-medium truncate cursor-pointer select-none">
          {t("event.filter.onlyAvailable")}
        </Label>
      </div>
    </Field>
  );

  return (
    <div className="bg-white shadow-sm rounded-xl overflow-hidden">
      {/* 顶栏：类别切换按钮在最前，点击即在下方丝滑展开对应类别的筛选抽屉 */}
      <div className="px-3.5 sm:px-5 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 md:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isOpen = activeTab === tab.key;
            const hasSelection = tab.count > 0;
            return (
              <button
                key={tab.key}
                type="button"
                aria-expanded={isOpen}
                onClick={() => handleToggleTab(tab.key)}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs sm:text-sm shrink-0 transition-colors",
                  isOpen
                    ? "bg-red-50/80 text-red-400 font-bold"
                    : hasSelection
                      ? "bg-red-400 text-white font-bold shadow-sm"
                      : "text-slate-600 font-medium hover:bg-gray-100 hover:text-slate-900",
                )}
              >
                <span>{tab.label}</span>
                {hasSelection && (
                  <span
                    className={clsx(
                      "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold tabular-nums leading-none",
                      isOpen ? "bg-red-400 text-white" : "bg-white/25 text-white",
                    )}
                  >
                    {tab.count}
                  </span>
                )}
                <IoChevronDown
                  className={clsx(
                    "text-xs shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180",
                    isOpen ? "text-red-400" : hasSelection ? "text-white/90" : "text-gray-400",
                  )}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3 pt-2 border-t border-gray-100 md:pt-0 md:border-t-0 md:pl-4 md:border-l md:border-gray-200 shrink-0">
          {upcomingSwitch}
        </div>
      </div>

      {/* 对应类别的丝滑展开筛选抽屉 */}
      <div
        className={clsx(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          activeTab ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-gray-100 px-3.5 sm:px-5 py-4">
            {displayedTab === "region" && regions.length > 0 && (
              <RegionCascaderPanel
                regions={regions}
                values={filters.region}
                onChange={(next) => updateField("region", next)}
              />
            )}

            {displayedTab === "type" && (
              <div className="flex flex-wrap items-center gap-1.5">
                <FacetOption
                  label={t("event.filter.allOption")}
                  active={filters.type.length === 0}
                  onClick={() => updateField("type", [])}
                />
                {EventTypeOptions.map((type) => (
                  <FacetOption
                    key={type}
                    label={t(`event.type.${type}`)}
                    active={filters.type.includes(type)}
                    onClick={() => updateField("type", toggleArrayValue(filters.type, type))}
                  />
                ))}
              </div>
            )}

            {displayedTab === "scale" && (
              <div className="flex flex-wrap items-center gap-1.5">
                <FacetOption
                  label={t("event.filter.allOption")}
                  active={filters.scale.length === 0}
                  onClick={() => updateField("scale", [])}
                />
                {ScaleOptions.map((scale) => (
                  <FacetOption
                    key={scale}
                    label={t(`event.filter.${scale}`)}
                    active={filters.scale.includes(scale)}
                    onClick={() => updateField("scale", toggleArrayValue(filters.scale, scale))}
                  />
                ))}
              </div>
            )}

            {displayedTab === "locationType" && (
              <div className="flex flex-wrap items-center gap-1.5">
                <FacetOption
                  label={t("event.filter.allOption")}
                  active={filters.locationType.length === 0}
                  onClick={() => updateField("locationType", [])}
                />
                {LocationTypeOptions.map((loc) => (
                  <FacetOption
                    key={loc}
                    label={t(`event.locationType.${loc}`)}
                    active={filters.locationType.includes(loc)}
                    onClick={() => updateField("locationType", toggleArrayValue(filters.locationType, loc))}
                  />
                ))}
              </div>
            )}

            {displayedTab === "feature" && features.length > 0 && (
              <div className="space-y-3">
                {hasMultipleFeatureCategories ? (
                  featureGroups.map((group) => (
                    <div
                      key={group.category || "__uncategorized__"}
                      className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-3"
                    >
                      <span className="sm:w-20 shrink-0 sm:py-1.5 text-xs sm:text-sm leading-5 font-bold text-gray-400 truncate">
                        {group.category
                          ? t(`event.featureCategory.${group.category}`, { defaultValue: group.category })
                          : t("event.filter.otherCategory")}
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                        {group.names.map((name) => (
                          <FacetOption
                            key={name}
                            label={name}
                            active={filters.feature.includes(name)}
                            onClick={() => updateField("feature", toggleArrayValue(filters.feature, name))}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <FacetOption
                      label={t("event.filter.allOption")}
                      active={filters.feature.length === 0}
                      onClick={() => updateField("feature", [])}
                    />
                    {features.map((item) => (
                      <FacetOption
                        key={item.name}
                        label={item.name}
                        active={filters.feature.includes(item.name)}
                        onClick={() => updateField("feature", toggleArrayValue(filters.feature, item.name))}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 已选条件标签条（跨类别汇总，支持单条移除与一键清空） */}
      {activeChips.length > 0 && (
        <div className="border-t border-gray-100 px-3.5 sm:px-5 py-2.5 flex flex-wrap items-center gap-1.5">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-gray-200/70 active:bg-gray-200 transition-colors"
            >
              <span>{chip.label}</span>
              <IoClose className="text-gray-400 text-sm shrink-0" aria-hidden />
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setActiveTab(null);
              onChange(EMPTY_FILTERS);
            }}
            className="px-2 py-1 text-xs font-medium text-red-400 hover:text-red-500 transition-colors"
          >
            {t("event.filter.clearAll")}
          </button>
        </div>
      )}
    </div>
  );
}

function FacetOption({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={clsx(
        "px-3 py-1.5 rounded-lg text-xs sm:text-sm leading-5 transition-colors shrink-0",
        active
          ? "bg-red-400 text-white font-bold shadow-sm"
          : "text-slate-600 font-medium hover:text-red-400 hover:bg-gray-100 active:bg-gray-100",
      )}
    >
      {label}
    </button>
  );
}
