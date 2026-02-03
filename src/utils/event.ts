import { DurationType, SelectedFilterType } from "@/types/list";
import { groupBy } from "es-toolkit/compat";
import dayjs from "dayjs";
type EventListable = {
  startAt: string | null;
  endAt: string | null;
  scale: string;
};

export function eventGroupByYear<T extends EventListable>(data: T[], order: "asc" | "desc") {
  const groupByStartDate = groupBy(data, (e) => (e.startAt ? dayjs(e.startAt).year() : "no-date"));

  const years = Object.keys(groupByStartDate).sort((a, b) => {
    if (a !== "no-date" && b !== "no-date") {
      return Number(b) - Number(a);
    }
    if (a === "no-date") {
      return -1;
    }
    if (b === "no-date") {
      return 1;
    }
    return 0;
  });

  return years.map((year) => ({
    year,
    events: sortEvents(groupByStartDate[year], order),
  }));
}

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

export function filteringEvents<T extends EventListable>(events: T[], selectedFilter: SelectedFilterType) {
  return events.filter((event) => {
    const now = Date.now();
    const endTime = event.endAt ? new Date(new Date(event.endAt).setHours(23, 59, 59, 999)).getTime() : null;
    if (selectedFilter.onlyAvailable) {
      // for now, if event is cancelled, the data willn't include it at all.
      // if (event.status === EventStatus.EventCancelled) {
      //   return false;
      // }
      if (endTime && now > endTime) {
        return false;
      }
    }

    if (selectedFilter.eventScale[0] !== "all" && !selectedFilter.eventScale.includes(event.scale)) {
      return false;
    }
    return true;
  });
}

function isDateBelongNextYear(testDate: string) {
  return dayjs(testDate).year() > dayjs().year();
}

function getDateMonth(testDate: string) {
  const isNextYear = isDateBelongNextYear(testDate);
  const dateBelongMonth = dayjs(testDate).month() + 1;
  return isNextYear ? dateBelongMonth + 12 : dateBelongMonth;
}

export function groupByCustomDurationEvent<T extends EventListable>(events: T[]) {
  const now = dayjs();

  const durationObject: { [x in DurationType]: T[] } = {
    now: [],
    next: [],
    passed: [],
  };

  events.forEach((event) => {
    const startTime = event.startAt ? dayjs(event.startAt).startOf("day") : null;
    const endTime = event.endAt ? dayjs(event.endAt).endOf("day") : null;

    const startMonth = event.startAt ? getDateMonth(event.startAt.toString()) : null;
    const endMonth = event.endAt ? getDateMonth(event.endAt.toString()) : null;

    //next events
    if (startTime === null || endTime === null || startMonth === null || endMonth === null) {
      return durationObject.next.push(event);
    }

    //Passed events
    if (endTime && now.isAfter(endTime)) {
      return durationObject.passed.push(event);
    }

    //Now events
    if (startTime && endTime && now.isAfter(startTime) && now.isBefore(endTime)) {
      return durationObject.now.push(event);
    }

    return durationObject.next.push(event);
  });

  return durationObject;
}

export function sortEvents<T extends EventListable>(events: T[], order: "asc" | "desc") {
  return events.sort((a, b) => {
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
