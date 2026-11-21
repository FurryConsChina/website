import { DurationType } from "@/types/list";
import { groupBy } from "es-toolkit/compat";
import dayjs from "dayjs";

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
