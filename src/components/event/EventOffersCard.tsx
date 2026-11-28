import type { EventOffer } from "@/types/event";
import { formatOfferPrice } from "@/utils/event";
import clsx from "clsx";
import dayjs from "dayjs";
import type { TFunction } from "i18next";
import { useTranslation } from "next-i18next/pages";
import { Fragment, useMemo } from "react";
import { IoCheckmark } from "react-icons/io5";

type OfferBenefit = EventOffer["benefits"][number];

const AVAILABILITY_TEXT_CLASS: Record<EventOffer["availability"], string> = {
  onSale: "text-emerald-600/80",
  upcoming: "text-amber-600/80",
  soldOut: "text-gray-400",
  ended: "text-gray-400",
};

function isMutedAvailability(availability: EventOffer["availability"]) {
  return availability === "soldOut" || availability === "ended";
}

function formatAdmissionDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? dayjs(date).format("MM/DD") : date;
}

function formatSaleWindow(saleStartAt: string | null, saleEndAt: string | null, t: TFunction): string | null {
  if (saleStartAt && saleEndAt) {
    const start = dayjs(saleStartAt);
    const end = dayjs(saleEndAt);
    const endFormat = start.year() === end.year() ? "MM/DD HH:mm" : "YYYY/MM/DD HH:mm";
    return `${start.format("YYYY/MM/DD HH:mm")} - ${end.format(endFormat)}`;
  }
  if (saleStartAt) {
    return t("event.offers.saleStart", { time: dayjs(saleStartAt).format("YYYY/MM/DD HH:mm") });
  }
  if (saleEndAt) {
    return t("event.offers.saleEnd", { time: dayjs(saleEndAt).format("YYYY/MM/DD HH:mm") });
  }
  return null;
}

function buildBenefitTable(offers: EventOffer[]) {
  const uniqueBenefits = new Map<
    string,
    { id: string; name: string; description: string | null; category: string | null; sortOrder: number }
  >();

  const offerBenefitMaps = offers.map((offer) => {
    const map = new Map<string, OfferBenefit>();
    for (const benefit of offer.benefits) {
      map.set(benefit.id, benefit);
      const existing = uniqueBenefits.get(benefit.id);
      if (!existing || benefit.sortOrder < existing.sortOrder) {
        uniqueBenefits.set(benefit.id, {
          id: benefit.id,
          name: benefit.name,
          description: benefit.description,
          category: benefit.category,
          sortOrder: benefit.sortOrder,
        });
      }
    }
    return map;
  });

  const rows = Array.from(uniqueBenefits.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  if (rows.length === 0) {
    return { groupedRows: [] as Array<{ category: string | null; items: typeof rows }>, offerBenefitMaps };
  }

  const hasCategories = rows.some((row) => Boolean(row.category));
  if (!hasCategories) {
    return { groupedRows: [{ category: null, items: rows }], offerBenefitMaps };
  }

  const groupedRows: Array<{ category: string | null; items: typeof rows }> = [];
  const indexByKey = new Map<string, number>();

  for (const row of rows) {
    const key = row.category ?? "__uncategorized__";
    const existingIndex = indexByKey.get(key);
    if (existingIndex !== undefined) {
      groupedRows[existingIndex].items.push(row);
    } else {
      indexByKey.set(key, groupedRows.length);
      groupedRows.push({ category: row.category, items: [row] });
    }
  }

  return { groupedRows, offerBenefitMaps };
}

function OfferHeaderPrice({ offer }: { offer: EventOffer }) {
  const { t } = useTranslation();
  const formatted = formatOfferPrice(offer.price, offer.currency);
  const muted = isMutedAvailability(offer.availability);

  if (!formatted) {
    return <div className="text-sm font-medium text-gray-400">{offer.priceNote || t("event.offers.priceTbd")}</div>;
  }

  return (
    <div>
      <div
        className={clsx(
          "text-base sm:text-lg font-bold tabular-nums tracking-tight leading-none",
          muted ? "text-gray-400 line-through" : "text-slate-900",
        )}
      >
        {formatted.isFree ? (
          t("event.offers.free")
        ) : (
          <>
            <span className="text-xs font-medium text-gray-400 mr-0.5">{formatted.symbol}</span>
            {formatted.amount}
          </>
        )}
      </div>
      {offer.priceNote && (
        <div className="text-[11px] font-normal text-gray-400 mt-1 break-words">{offer.priceNote}</div>
      )}
    </div>
  );
}

export default function EventOffersCard({ offers }: { offers: EventOffer[] }) {
  const { t } = useTranslation();

  const { groupedRows, offerBenefitMaps } = useMemo(() => buildBenefitTable(offers), [offers]);
  const hasBenefits = groupedRows.length > 0;
  const hasDescription = useMemo(() => offers.some((offer) => Boolean(offer.description)), [offers]);
  const hasAdmissionDates = useMemo(
    () => offers.some((offer) => (offer.admissionDates?.filter(Boolean).length ?? 0) > 0),
    [offers],
  );
  const hasSaleWindow = useMemo(() => offers.some((offer) => Boolean(offer.saleStartAt || offer.saleEndAt)), [offers]);
  const hasNonDefaultOrMixedStatus = useMemo(() => {
    const statuses = new Set(offers.map((offer) => offer.availability));
    return statuses.size > 1 || !statuses.has("onSale");
  }, [offers]);

  if (offers.length === 0) {
    return null;
  }

  return (
    <section id="event-offers" className="my-3 sm:my-4 bg-white shadow-sm rounded-xl overflow-hidden scroll-mt-20">
      <div className="flex items-baseline gap-2 px-4 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-3.5">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800">
          {hasBenefits ? t("event.offers.titleWithBenefits") : t("event.offers.title")}
        </h2>
        <span className="text-xs sm:text-sm text-gray-400 tabular-nums">
          {t("event.offers.tierCount", { count: offers.length })}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-t border-b border-gray-100">
              <th
                scope="col"
                className="sticky left-0 z-10 bg-white py-3 pl-4 pr-3 sm:pl-6 sm:pr-4 text-left align-bottom text-xs font-medium text-gray-400 min-w-[116px] sm:min-w-[180px] border-r border-gray-100"
              >
                {hasBenefits ? t("event.offers.benefitColumn") : ""}
              </th>
              {offers.map((offer) => {
                const muted = isMutedAvailability(offer.availability);
                return (
                  <th
                    key={offer.id}
                    scope="col"
                    className="py-3 px-3 sm:px-4 text-center align-top min-w-[108px] sm:min-w-[136px] font-normal"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={clsx(
                          "text-sm sm:text-[15px] font-bold leading-snug",
                          muted ? "text-gray-400" : "text-slate-800",
                        )}
                      >
                        {offer.name}
                      </span>
                      <OfferHeaderPrice offer={offer} />
                      {hasNonDefaultOrMixedStatus && (
                        <span className={clsx("text-[11px] font-medium", AVAILABILITY_TEXT_CLASS[offer.availability])}>
                          {t(`event.offers.availability.${offer.availability}`)}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {(hasDescription || hasAdmissionDates || hasSaleWindow || hasBenefits) && (
            <tbody className="divide-y divide-gray-100">
              {hasDescription && (
                <tr className="group hover:bg-gray-50/70 transition-colors">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 py-2.5 pl-4 pr-3 sm:pl-6 sm:pr-4 text-left text-xs sm:text-sm font-medium text-gray-500 align-top border-r border-gray-100 transition-colors"
                  >
                    {t("event.offers.descriptionLabel")}
                  </th>
                  {offers.map((offer) => (
                    <td
                      key={offer.id}
                      className="py-2.5 px-3 sm:px-4 text-center align-top text-xs text-gray-500 leading-relaxed whitespace-pre-line break-words"
                    >
                      {offer.description || <span className="text-gray-300 select-none">—</span>}
                    </td>
                  ))}
                </tr>
              )}

              {hasAdmissionDates && (
                <tr className="group hover:bg-gray-50/70 transition-colors">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 py-2.5 pl-4 pr-3 sm:pl-6 sm:pr-4 text-left text-xs sm:text-sm font-medium text-gray-500 align-middle border-r border-gray-100 transition-colors"
                  >
                    {t("event.offers.admissionDates")}
                  </th>
                  {offers.map((offer) => {
                    const dates = offer.admissionDates?.filter(Boolean) ?? [];
                    return (
                      <td
                        key={offer.id}
                        className="py-2.5 px-3 sm:px-4 text-center align-middle text-xs text-slate-600 tabular-nums"
                      >
                        {dates.length > 0 ? (
                          dates.map(formatAdmissionDate).join("、")
                        ) : (
                          <span className="text-gray-300 select-none">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              )}

              {hasSaleWindow && (
                <tr className="group hover:bg-gray-50/70 transition-colors">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 py-2.5 pl-4 pr-3 sm:pl-6 sm:pr-4 text-left text-xs sm:text-sm font-medium text-gray-500 align-middle border-r border-gray-100 transition-colors"
                  >
                    {t("event.offers.saleTimeLabel")}
                  </th>
                  {offers.map((offer) => {
                    const windowText = formatSaleWindow(offer.saleStartAt, offer.saleEndAt, t);
                    return (
                      <td
                        key={offer.id}
                        className="py-2.5 px-3 sm:px-4 text-center align-middle text-xs text-gray-500 tabular-nums"
                      >
                        {windowText ? (
                          <span suppressHydrationWarning>{windowText}</span>
                        ) : (
                          <span className="text-gray-300 select-none">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              )}

              {groupedRows.map((group) => (
                <Fragment key={group.category ?? "__default__"}>
                  {group.category && (
                    <tr className="bg-[#edf1f7]">
                      <th
                        scope="colgroup"
                        className="sticky left-0 z-10 bg-[#edf1f7] py-1.5 pl-4 pr-3 sm:pl-6 sm:pr-4 text-left text-xs font-semibold text-slate-600"
                      >
                        {group.category}
                      </th>
                      <td colSpan={offers.length} className="bg-[#edf1f7]" />
                    </tr>
                  )}

                  {group.items.map((row) => {
                    const hasVariedQuantity = offerBenefitMaps.some((map) => {
                      const q = map.get(row.id)?.quantity;
                      return q != null && q > 1;
                    });

                    return (
                      <tr key={row.id} className="group hover:bg-gray-50/70 transition-colors">
                        <th
                          scope="row"
                          className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 py-2.5 pl-4 pr-3 sm:pl-6 sm:pr-4 text-left font-normal align-middle border-r border-gray-100 transition-colors"
                        >
                          <div className="text-xs sm:text-sm text-slate-700 font-medium">{row.name}</div>
                          {row.description && (
                            <div className="text-[11px] sm:text-xs text-gray-400 mt-0.5 leading-snug">
                              {row.description}
                            </div>
                          )}
                        </th>

                        {offers.map((offer, offerIndex) => {
                          const matched = offerBenefitMaps[offerIndex].get(row.id);
                          const muted = isMutedAvailability(offer.availability);

                          if (!matched) {
                            return (
                              <td
                                key={offer.id}
                                className="py-2.5 px-3 sm:px-4 text-center align-middle text-gray-300 select-none"
                                aria-label={t("event.offers.notIncluded")}
                              >
                                —
                              </td>
                            );
                          }

                          const showQuantity = matched.quantity != null && (matched.quantity > 1 || hasVariedQuantity);

                          return (
                            <td key={offer.id} className="py-2.5 px-3 sm:px-4 text-center align-middle">
                              <div className="inline-flex flex-col items-center">
                                <span className="inline-flex items-center gap-0.5">
                                  <IoCheckmark
                                    className={clsx("text-base", muted ? "text-gray-400" : "text-red-400")}
                                    aria-label={t("event.offers.included")}
                                  />
                                  {showQuantity && (
                                    <span
                                      className={clsx(
                                        "text-xs font-semibold tabular-nums",
                                        muted ? "text-gray-400" : "text-slate-700",
                                      )}
                                    >
                                      ×{matched.quantity}
                                    </span>
                                  )}
                                </span>
                                {matched.note && (
                                  <span className="text-[11px] text-gray-400 mt-0.5 max-w-[140px] leading-snug break-words">
                                    {matched.note}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </section>
  );
}
