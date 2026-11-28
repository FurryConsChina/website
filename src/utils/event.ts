import { DurationType } from "@/types/list";
import type { EventOffer } from "@/types/event";
import { groupBy } from "es-toolkit/compat";
import dayjs from "dayjs";

const CURRENCY_SYMBOL_MAP: Record<string, string> = {
  CNY: "¥",
  RMB: "¥",
  USD: "$",
  HKD: "HK$",
  MOP: "MOP$",
  TWD: "NT$",
  JPY: "JP¥",
  KRW: "₩",
  EUR: "€",
  GBP: "£",
  SGD: "S$",
  AUD: "A$",
  CAD: "CA$",
};

/** 规范化后端返回的 PG decimal 字符串（如 "328.0000" -> "328"，"99.5000" -> "99.5"）。 */
export function normalizeOfferPrice(price: string | null): string | null {
  if (price === null) return null;
  const trimmed = price.trim();
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return null;

  const [intPart, rawDec = ""] = trimmed.split(".");
  const decPart = rawDec.replace(/0+$/, "");
  const normalizedInt = intPart.replace(/^(-?)0+(?=\d)/, "$1");
  return decPart ? `${normalizedInt}.${decPart}` : normalizedInt;
}

export function formatOfferPrice(price: string | null, currency: string) {
  const normalized = normalizeOfferPrice(price);
  if (normalized === null) return null;

  const numeric = Number(normalized);
  if (!Number.isFinite(numeric)) return null;

  const [intPart, decPart] = normalized.split(".");
  const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const formattedDec = decPart ? (decPart.length === 1 ? `${decPart}0` : decPart) : "";
  const amount = formattedDec ? `${groupedInt}.${formattedDec}` : groupedInt;

  const upperCurrency = currency.toUpperCase();
  const symbol = CURRENCY_SYMBOL_MAP[upperCurrency] ?? `${upperCurrency} `;

  return {
    symbol,
    amount,
    text: `${symbol}${amount}`,
    isFree: numeric === 0,
  };
}

export function getEventOfferPriceSummary(offers: EventOffer[]) {
  if (offers.length === 0) return null;

  const priced = offers
    .map((offer) => {
      const normalized = normalizeOfferPrice(offer.price);
      if (normalized === null) return null;
      const numeric = Number(normalized);
      if (!Number.isFinite(numeric) || numeric < 0) return null;
      return { offer, numeric };
    })
    .filter((item): item is { offer: EventOffer; numeric: number } => item !== null);

  if (priced.length === 0) {
    return { formatted: null, hasRange: false, count: offers.length };
  }

  const currencies = new Set(priced.map((item) => item.offer.currency.toUpperCase()));
  if (currencies.size > 1) {
    return { formatted: null, hasRange: false, count: offers.length };
  }

  priced.sort((a, b) => a.numeric - b.numeric);
  const min = priced[0];
  const max = priced[priced.length - 1];

  return {
    formatted: formatOfferPrice(min.offer.price, min.offer.currency),
    hasRange: max.numeric > min.numeric,
    count: offers.length,
  };
}

/** 从主办关联中拆出显式标记的主办组织（isPrimary）与其余协办组织；未标记时主办为空，不做猜测。 */
export function getEventOrganizations<T>(event: { organizers: { isPrimary: boolean; organization: T }[] }) {
  const primary = event.organizers.find((organizer) => organizer.isPrimary)?.organization ?? null;
  const others = event.organizers
    .map((organizer) => organizer.organization)
    .filter((organization) => organization !== primary);
  return { primary, others };
}
type EventListable = {
  startAt: string | null;
  endAt: string | null;
  scale: string;
};

export function eventGroupByMonth<T extends EventListable>(data: T[], monthOrder: "asc" | "desc") {
  const groupByStartDate = groupBy(data, (e) => (e.startAt ? dayjs(e.startAt).month() + 1 : "no-date"));

  const months = Object.keys(groupByStartDate).sort((a, b) => {
    if (a !== "no-date" && b !== "no-date") {
      if (monthOrder === "desc") {
        return Number(b) - Number(a);
      }
      return Number(a) - Number(b);
    }

    if (a === "no-date") {
      return 1;
    }
    if (b === "no-date") {
      return -1;
    }

    return 0;
  });

  return months.map((month) => ({
    month,
    events: sortEvents(groupByStartDate[month], "asc"),
  }));
}

export function groupByCustomDurationEvent<T extends EventListable>(events: T[], nowTimestamp: number = Date.now()) {
  const now = dayjs(nowTimestamp);

  const durationObject: { [x in DurationType]: T[] } = {
    now: [],
    next: [],
    passed: [],
  };

  events.forEach((event) => {
    const startTime = event.startAt ? dayjs(event.startAt).startOf("day") : null;
    const endTime = event.endAt ? dayjs(event.endAt).endOf("day") : null;

    //next events
    if (startTime === null || endTime === null) {
      return durationObject.next.push(event);
    }

    //Passed events
    if (now.isAfter(endTime)) {
      return durationObject.passed.push(event);
    }

    //Now events
    if (now.isAfter(startTime) && now.isBefore(endTime)) {
      return durationObject.now.push(event);
    }

    return durationObject.next.push(event);
  });

  return durationObject;
}

export function sortEvents<T extends EventListable>(events: T[], order: "asc" | "desc") {
  return [...events].sort((a, b) => {
    if (!a.endAt) {
      return 1;
    }

    if (!b.endAt) {
      return -1;
    }

    if (a.startAt && b.startAt) {
      const aDate = dayjs(a.startAt);
      const bDate = dayjs(b.startAt);
      if (aDate.isSame(bDate)) {
        return 0;
      }
      if (order === "asc") {
        return aDate.isBefore(bDate) ? -1 : 1;
      }
      return aDate.isAfter(bDate) ? -1 : 1;
    }

    return 0;
  });
}
