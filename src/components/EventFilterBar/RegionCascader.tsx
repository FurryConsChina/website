import clsx from "clsx";
import { useTranslation } from "next-i18next/pages";
import { useMemo, useState } from "react";
import { IoCheckmark, IoChevronForward, IoClose, IoSearch } from "react-icons/io5";

export type FilterRegionOption = {
  id: string;
  slug: string;
  name: string;
  localName: string | null;
  parentId: string | null;
  displayOrder: number;
  eventCount: number;
};

type RegionNode = FilterRegionOption & {
  children: RegionNode[];
  pathNames: string[];
};

function compareNodes(a: RegionNode, b: RegionNode) {
  if (a.displayOrder !== b.displayOrder) return b.displayOrder - a.displayOrder;
  if (a.eventCount !== b.eventCount) return b.eventCount - a.eventCount;
  return a.name.localeCompare(b.name, "zh-CN");
}

function buildRegionGraph(regions: FilterRegionOption[]) {
  const nodeById = new Map<string, RegionNode>();
  const nodeBySlug = new Map<string, RegionNode>();

  for (const region of regions) {
    const node: RegionNode = { ...region, children: [], pathNames: [] };
    nodeById.set(region.id, node);
    nodeBySlug.set(region.slug, node);
  }

  const roots: RegionNode[] = [];
  for (const node of nodeById.values()) {
    const parent = node.parentId ? nodeById.get(node.parentId) : undefined;
    if (parent && parent.id !== node.id) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const flatNodes: RegionNode[] = [];
  const finalize = (nodes: RegionNode[], ancestors: string[]) => {
    nodes.sort(compareNodes);
    for (const node of nodes) {
      node.pathNames = [...ancestors, node.name];
      flatNodes.push(node);
      if (node.children.length > 0) {
        finalize(node.children, node.pathNames);
      }
    }
  };
  finalize(roots, []);

  return { roots, flatNodes, nodeById, nodeBySlug };
}

function collectDescendantSlugs(node: RegionNode, acc = new Set<string>()) {
  for (const child of node.children) {
    acc.add(child.slug);
    collectDescendantSlugs(child, acc);
  }
  return acc;
}

function collectAncestorIds(slug: string, nodeBySlug: Map<string, RegionNode>, nodeById: Map<string, RegionNode>) {
  const ids: string[] = [];
  const seen = new Set<string>();
  let current = nodeBySlug.get(slug);
  while (current?.parentId && !seen.has(current.parentId)) {
    seen.add(current.parentId);
    ids.push(current.parentId);
    current = nodeById.get(current.parentId);
  }
  return ids;
}

export default function RegionCascaderPanel({
  regions,
  values,
  onChange,
}: {
  regions: FilterRegionOption[];
  values: string[];
  onChange: (next: string[]) => void;
}) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const { roots, flatNodes, nodeById, nodeBySlug } = useMemo(() => buildRegionGraph(regions), [regions]);

  const hasNestedRegions = useMemo(() => roots.some((node) => node.children.length > 0), [roots]);

  const [desktopPathIds, setDesktopPathIds] = useState<string[]>(() => {
    const firstExpandable = roots.find((node) => node.children.length > 0);
    return firstExpandable ? [firstExpandable.id] : [];
  });
  const [mobilePathIds, setMobilePathIds] = useState<string[]>([]);

  const selectedSet = useMemo(() => new Set(values), [values]);

  const branchSelectedIds = useMemo(() => {
    const set = new Set<string>();
    for (const slug of values) {
      const node = nodeBySlug.get(slug);
      if (node) set.add(node.id);
      for (const id of collectAncestorIds(slug, nodeBySlug, nodeById)) {
        set.add(id);
      }
    }
    return set;
  }, [values, nodeBySlug, nodeById]);

  const toggleSelectNode = (node: RegionNode) => {
    if (selectedSet.has(node.slug)) {
      onChange(values.filter((slug) => slug !== node.slug));
      return;
    }

    const ancestorSlugs = new Set(
      collectAncestorIds(node.slug, nodeBySlug, nodeById)
        .map((id) => nodeById.get(id)?.slug)
        .filter((slug): slug is string => Boolean(slug)),
    );
    const descendants = collectDescendantSlugs(node);
    onChange([...values.filter((slug) => !ancestorSlugs.has(slug) && !descendants.has(slug)), node.slug]);
  };

  const desktopColumns = useMemo(() => {
    const cols: Array<{ parent: RegionNode | null; items: RegionNode[]; activeId: string | null }> = [
      { parent: null, items: roots, activeId: desktopPathIds[0] ?? null },
    ];
    let currentList = roots;
    for (let i = 0; i < desktopPathIds.length; i++) {
      const activeNode = currentList.find((item) => item.id === desktopPathIds[i]);
      if (!activeNode || activeNode.children.length === 0) break;
      cols.push({
        parent: activeNode,
        items: activeNode.children,
        activeId: desktopPathIds[i + 1] ?? null,
      });
      currentList = activeNode.children;
    }
    return cols;
  }, [roots, desktopPathIds]);

  const mobileLevel = useMemo(() => {
    const trail: RegionNode[] = [];
    let items = roots;
    for (const id of mobilePathIds) {
      const found = items.find((item) => item.id === id);
      if (!found || found.children.length === 0) break;
      trail.push(found);
      items = found.children;
    }
    return { trail, currentParent: trail[trail.length - 1] ?? null, items };
  }, [roots, mobilePathIds]);

  const trimmedSearch = search.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!trimmedSearch) return [];
    return flatNodes.filter(
      (node) =>
        node.name.toLowerCase().includes(trimmedSearch) ||
        (node.localName?.toLowerCase().includes(trimmedSearch) ?? false) ||
        node.slug.toLowerCase().includes(trimmedSearch),
    );
  }, [flatNodes, trimmedSearch]);

  return (
    <div className="space-y-3">
      {/* 顶部行：快速搜索 + 全部地区 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-1.5 w-full sm:max-w-xs">
          <IoSearch className="text-gray-400 text-sm shrink-0" aria-hidden />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("event.filter.regionSearchPlaceholder")}
            className="w-full min-w-0 bg-transparent text-xs sm:text-sm text-slate-700 placeholder:text-gray-400 focus:outline-none"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 shrink-0">
              <IoClose className="text-sm" />
            </button>
          )}
        </div>

        {values.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="px-2.5 py-1.5 rounded-lg text-xs sm:text-sm leading-5 font-medium text-red-400 hover:text-red-500 hover:bg-red-50/60 transition-colors"
          >
            {t("event.filter.clearRegion")}
          </button>
        )}
      </div>

      {trimmedSearch ? (
        searchResults.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-400">
            {t("searchModal.noResult", { keyword: search.trim() })}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto">
            {searchResults.map((node) => {
              const selected = selectedSet.has(node.slug);
              const parentPath = node.pathNames.slice(0, -1).join(" / ");
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => toggleSelectNode(node)}
                  className={clsx(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm leading-5 transition-colors",
                    selected
                      ? "bg-red-400 text-white font-bold shadow-sm"
                      : "text-slate-600 font-medium hover:text-red-400 hover:bg-gray-100",
                  )}
                >
                  <span>{node.name}</span>
                  {parentPath && (
                    <span className={clsx("text-xs", selected ? "text-white/80 font-normal" : "text-gray-400")}>
                      {parentPath}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )
      ) : !hasNestedRegions ? (
        /* 全部为平级城市时直接舒展平铺，不做多余左右分栏 */
        <div className="flex flex-wrap items-center gap-1.5 max-h-60 overflow-y-auto">
          {roots.map((node) => {
            const selected = selectedSet.has(node.slug);
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => toggleSelectNode(node)}
                className={clsx(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm leading-5 transition-colors",
                  selected
                    ? "bg-red-400 text-white font-bold shadow-sm"
                    : "text-slate-600 font-medium hover:text-red-400 hover:bg-gray-100 active:bg-gray-100",
                )}
              >
                <span>{node.name}</span>
                <span
                  className={clsx("text-[11px] tabular-nums", selected ? "text-white/80 font-normal" : "text-gray-400")}
                >
                  {node.eventCount}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <>
          {/* 桌面端：点击切换的级联面板（取消 hover 自动切换） */}
          <div className="hidden sm:flex divide-x divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
            {desktopColumns.map((col, colIndex) => {
              const isLastColumn = colIndex === desktopColumns.length - 1;
              const allLeaves = isLastColumn && colIndex > 0 && col.items.every((item) => item.children.length === 0);

              if (allLeaves && col.parent) {
                return (
                  <div key={col.parent.id} className="flex-1 min-w-0 max-h-60 overflow-y-auto p-3">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleSelectNode(col.parent!)}
                        className={clsx(
                          "px-3 py-1.5 rounded-lg text-sm leading-5 transition-colors",
                          selectedSet.has(col.parent.slug)
                            ? "bg-red-400 text-white font-bold shadow-sm"
                            : "text-gray-500 font-medium hover:text-red-400 hover:bg-gray-100",
                        )}
                      >
                        {t("event.filter.allInRegion", { name: col.parent.name })}
                      </button>
                      {col.items.map((node) => {
                        const selected = selectedSet.has(node.slug);
                        return (
                          <button
                            key={node.id}
                            type="button"
                            onClick={() => toggleSelectNode(node)}
                            className={clsx(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm leading-5 transition-colors",
                              selected
                                ? "bg-red-400 text-white font-bold shadow-sm"
                                : "text-slate-600 font-medium hover:text-red-400 hover:bg-gray-100",
                            )}
                          >
                            <span>{node.name}</span>
                            <span
                              className={clsx(
                                "text-[11px] tabular-nums",
                                selected ? "text-white/80 font-normal" : "text-gray-400",
                              )}
                            >
                              {node.eventCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={col.parent?.id ?? "root"}
                  className={clsx(
                    "max-h-60 overflow-y-auto p-1.5 space-y-0.5",
                    colIndex === 0 ? "w-44 shrink-0 bg-gray-50/50" : "w-48 shrink-0",
                  )}
                >
                  {col.parent && (
                    <button
                      type="button"
                      onClick={() => toggleSelectNode(col.parent!)}
                      className={clsx(
                        "w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm leading-5 text-left transition-colors",
                        selectedSet.has(col.parent.slug)
                          ? "bg-red-50/80 text-red-400 font-bold"
                          : "text-gray-500 hover:bg-gray-100 font-medium",
                      )}
                    >
                      <span className="truncate">{t("event.filter.allInRegion", { name: col.parent.name })}</span>
                      {selectedSet.has(col.parent.slug) && (
                        <IoCheckmark className="text-red-400 text-base shrink-0" aria-hidden />
                      )}
                    </button>
                  )}

                  {col.items.map((node) => {
                    const hasChildren = node.children.length > 0;
                    const isColumnActive = col.activeId === node.id;
                    const isSelected = selectedSet.has(node.slug);
                    const hasBranchSelection = branchSelectedIds.has(node.id);

                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => {
                          if (hasChildren) {
                            setDesktopPathIds([...desktopPathIds.slice(0, colIndex), node.id]);
                          } else {
                            toggleSelectNode(node);
                          }
                        }}
                        className={clsx(
                          "w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm leading-5 text-left transition-colors",
                          isSelected
                            ? "bg-red-50/80 text-red-400 font-bold"
                            : isColumnActive
                              ? "bg-gray-100 text-slate-900 font-semibold"
                              : hasBranchSelection
                                ? "text-red-400 font-medium hover:bg-gray-100"
                                : "text-slate-700 hover:bg-gray-100",
                        )}
                      >
                        <span className="truncate">{node.name}</span>
                        {hasChildren ? (
                          <span className="flex items-center gap-1 shrink-0">
                            {hasBranchSelection && <span className="h-1.5 w-1.5 rounded-full bg-red-400" />}
                            <IoChevronForward className="text-xs text-gray-400" aria-hidden />
                          </span>
                        ) : isSelected ? (
                          <IoCheckmark className="text-red-400 text-base shrink-0" aria-hidden />
                        ) : (
                          <span className="text-xs tabular-nums text-gray-400 shrink-0">{node.eventCount}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* 移动端：面包屑点击下钻平铺 */}
          <div className="sm:hidden space-y-2.5">
            {mobileLevel.trail.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide text-xs text-gray-500">
                <button
                  type="button"
                  onClick={() => setMobilePathIds([])}
                  className="shrink-0 font-medium hover:text-red-400"
                >
                  {t("event.filter.allCities")}
                </button>
                {mobileLevel.trail.map((node, index) => (
                  <span key={node.id} className="inline-flex items-center gap-1 shrink-0">
                    <IoChevronForward className="text-[10px] text-gray-400" aria-hidden />
                    <button
                      type="button"
                      onClick={() => setMobilePathIds(mobilePathIds.slice(0, index + 1))}
                      className={clsx(
                        "font-medium",
                        index === mobileLevel.trail.length - 1 ? "text-red-400 font-bold" : "hover:text-red-400",
                      )}
                    >
                      {node.name}
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto">
              {mobileLevel.currentParent && (
                <button
                  type="button"
                  onClick={() => toggleSelectNode(mobileLevel.currentParent!)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-xs leading-5 font-medium transition-colors",
                    selectedSet.has(mobileLevel.currentParent.slug)
                      ? "bg-red-400 text-white font-bold shadow-sm"
                      : "bg-gray-100 text-gray-600 active:bg-gray-200",
                  )}
                >
                  {t("event.filter.allInRegion", { name: mobileLevel.currentParent.name })}
                </button>
              )}

              {mobileLevel.items.map((node) => {
                const hasChildren = node.children.length > 0;
                const isSelected = selectedSet.has(node.slug);
                const hasBranchSelection = branchSelectedIds.has(node.id);

                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => {
                      if (hasChildren) {
                        setMobilePathIds([...mobileLevel.trail.map((item) => item.id), node.id]);
                      } else {
                        toggleSelectNode(node);
                      }
                    }}
                    className={clsx(
                      "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs leading-5 transition-colors",
                      isSelected
                        ? "bg-red-400 text-white font-bold shadow-sm"
                        : hasBranchSelection
                          ? "bg-red-50 text-red-400 font-bold"
                          : "bg-gray-100 text-slate-700 font-medium active:bg-gray-200",
                    )}
                  >
                    <span>{node.name}</span>
                    {hasChildren && <IoChevronForward className="text-[11px] opacity-60" aria-hidden />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
