import { Organization } from "@/types/organization";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import "dayjs/locale/zh-tw";
import { currentSupportLocale, getDayjsLocale } from "@/utils/locale";

export const OrganizationPageMeta = {
  "zh-Hans": {
    title: "展商列表",
    description: (organizationCount: number) =>
      `欢迎来到兽展日历！兽展日历共计收录了 ${organizationCount} 个和兽展/兽聚相关的展方，无论他们今天是否还在活跃，我们真挚感谢这些为兽人文化发展做出贡献的团体。`,
  },
  "zh-Hant": {
    title: "展商名單",
    description: (organizationCount: number) =>
      `歡迎來到獸展日曆！獸展日曆共計收錄了 ${organizationCount} 個和獸展/獸聚相關的展方，無論他們今天是否還在活躍，我們真摯感謝這些為獸人文化發展做出貢獻的團體。`,
  },
  en: {
    title: "Organizers",
    description: (organizationCount: number) =>
      `Welcome to the FurConsCalendar! The calendar has recorded a total of ${organizationCount} organizers related to furry conventions and gatherings. Whether they are still active today or not, we sincerely thank these groups for their contributions to the development of furry culture.`,
  },
};

export const CityPageMeta = {
  "zh-Hans": {
    title: "兽展城市列表",
    description: (cities: number) =>
      `欢迎来到兽展日历！兽展日历共收录 ${cities} 个城市举办过的兽展(兽聚)活动信息，快来看看这些城市有没有你所在的地方吧！`,
  },
  "zh-Hant": {
    title: "獸展城市列表",
    description: (cities: number) =>
      `歡迎來到獸展日曆！獸展日曆共收錄 ${cities} 個城市舉辦過的獸展（獸聚）活動資訊，快來看看這些城市有沒有你所在的地方吧！`,
  },
  en: {
    title: "Cities",
    description: (cities: number) =>
      `Welcome to the FurConsCalendar! The calendar has recorded a total of ${cities} cities related to furry conventions and gatherings. Whether they are still active today or not, we sincerely thank these groups for their contributions to the development of furry culture.`,
  },
};

export const YearPageMeta = {
  "zh-Hans": {
    title: "年度时间轴",
    description: (yearCount: number, eventCount: number) =>
      `欢迎来到兽展日历！兽展日历共计收录了 ${yearCount} 年间共计 ${eventCount} 场活动，你去过哪些呢？希望他们对你来说是最美好的回忆！`,
  },
  "zh-Hant": {
    title: "年度時間軸",
    description: (yearCount: number, eventCount: number) =>
      `歡迎來到獸展日曆！獸展日曆共計收錄了 ${yearCount} 年間共計 ${eventCount} 場活動，你去過哪些呢？ 希望他們對你來說是最美好的回憶！`,
  },
  en: {
    title: "Timeline",
    description: (yearCount: number, eventCount: number) =>
      `Welcome to the FurConsCalendar! Over the past ${yearCount} years, the calendar has recorded a total of ${eventCount} events. Which ones have you attended? We hope they were some of your best memories!`,
  },
};

const universalKeywords = (locale: currentSupportLocale) => {
  switch (locale) {
    case "zh-Hans":
    default:
      return ["兽聚", "兽展", "兽聚日历", "兽展日历"];
    case "zh-Hant":
      return ["獸聚", "獸展", "獸聚日曆", "獸展日曆"];
    case "en":
      return ["Furry Convention", "Furry Con", "Furry Convention Calendar"];
  }
};

function generateHomeKeywords(nowYear: number, locale: currentSupportLocale) {
  switch (locale) {
    case "zh-Hans":
    default:
      return [`${nowYear}兽展`, `${nowYear}兽展时间表`, `${nowYear}兽聚`, `${nowYear}兽聚时间表`];
    case "zh-Hant":
      return [`${nowYear}獸展`, `${nowYear}獸展時程表`, `${nowYear}獸聚`, `${nowYear}獸聚時程表`];
    case "en":
      return [
        `${nowYear} Furry Conventions`,
        `${nowYear} Furry Convention Schedule`,
        `${nowYear} Furry Gatherings`,
        `${nowYear} Furry Gathering Schedule`,
      ];
  }
}

function generateEventKeywords(
  event: { name?: string; city?: string; startDate?: string | Date | null },
  locale: currentSupportLocale,
) {
  const startYear = dayjs(event.startDate).year();
  switch (locale) {
    case "zh-Hans":
    default:
      return [
        `${event?.name}`,
        `${event?.name}兽聚`,
        `${event?.name}兽展`,
        `${event?.name}举办时间`,
        `${event?.name}时间`,
        ...(event?.city ? [`${event.city}兽聚`, `${event.city}兽展`] : []),
        ...(startYear ? [`${startYear}兽聚`, `${startYear}兽展`] : []),
        ...(startYear && event?.city ? [`${startYear}${event.city}兽聚`, `${startYear}${event.city}兽展`] : []),
      ];
    case "zh-Hant":
      return [
        `${event?.name}`,
        `${event?.name}獸聚`,
        `${event?.name}獸展`,
        `${event?.name}舉辦時間`,
        `${event?.name}時間`,
        ...(event?.city ? [`${event.city}獸聚`, `${event.city}獸展`] : []),
        ...(startYear ? [`${startYear}獸聚`, `${startYear}獸展`] : []),
        ...(startYear && event?.city ? [`${startYear}${event.city}獸聚`, `${startYear}${event.city}獸展`] : []),
      ];
    case "en":
      return [
        `${event?.name}`,
        `${event?.name} Furry Gathering`,
        `${event?.name} Furry Convention`,
        `${event?.name} Event Time`,
        `${event?.name} Schedule`,
        ...(event?.city ? [`${event.city} Furry Gathering`, `${event.city} Furry Convention`] : []),
        ...(startYear ? [`${startYear} Furry Gatherings`, `${startYear} Furry Conventions`] : []),
        ...(startYear && event?.city
          ? [`${startYear} ${event.city} Furry Gathering`, `${startYear} ${event.city} Furry Convention`]
          : []),
      ];
  }
}

function generateOrganizationKeywords(organization: { name: string }, locale: currentSupportLocale) {
  switch (locale) {
    case "zh-Hans":
    default:
      return [`${organization?.name}`, `${organization?.name}兽聚`, `${organization?.name}兽展`];
    case "zh-Hant":
      return [`${organization?.name}`, `${organization?.name}獸聚`, `${organization?.name}獸展`];
    case "en":
      return [
        `${organization?.name}`,
        `${organization?.name} Furry Gathering`,
        `${organization?.name} Furry Convention`,
      ];
  }
}

function generateCityDetailKeywords(city: { name: string }, locale: currentSupportLocale) {
  switch (locale) {
    case "zh-Hans":
    default:
      return [
        `${city.name}`,
        `${city.name}兽展`,
        `${city.name}兽聚`,
        `${city.name}兽展时间`,
        `${city.name}兽展日历`,
      ];
    case "zh-Hant":
      return [
        `${city.name}`,
        `${city.name}獸展`,
        `${city.name}獸聚`,
        `${city.name}獸展時間`,
        `${city.name}獸展日曆`,
      ];
    case "en":
      return [
        `${city.name}`,
        `${city.name} Furry Convention`,
        `${city.name} Furry Gathering`,
        `${city.name} Furry Convention Schedule`,
        `${city.name} Furry Event Calendar`,
      ];
  }
}

function keywordGenerator({
  page,
  locale,
  event,
  organization,
}: {
  page: "home" | "event" | "organization";
  locale: currentSupportLocale;
  event?: {
    name?: string;
    city?: string;
    startDate?: string | Date | null;
  };
  organization?: {
    name: string;
  };
}) {
  const nowYear = new Date().getFullYear();

  switch (page) {
    case "home":
      return [...universalKeywords(locale), ...generateHomeKeywords(nowYear, locale)].join(",");

    case "event":
      return event ? generateEventKeywords(event, locale).join(",") : universalKeywords(locale).join(",");

    case "organization":
      return organization
        ? generateOrganizationKeywords(organization, locale).join(",")
        : universalKeywords(locale).join(",");

    default:
      return universalKeywords(locale).join(",");
  }
}

function formatDate(value: string | Date | null | undefined, formatPattern: string, locale: currentSupportLocale) {
  if (!value) return "";
  return dayjs(value).locale(getDayjsLocale(locale)).format(formatPattern);
}

function titleGenerator(locale: currentSupportLocale, title?: string) {
  switch (locale) {
    case "en":
      return title ? `${title}——FurConsCalendar` : "FurConsCalendar";
    case "zh-Hant":
      return title ? `${title}—獸展日曆` : "獸展日曆";
    case "zh-Hans":
    default:
      return title ? `${title}—FEC·兽展日历 | FEC·兽聚日历` : "FEC·兽展日历 | FEC·兽聚日历";
  }
}

function defaultDescriptionGenerator(locale: currentSupportLocale) {
  switch (locale) {
    case "zh-Hans":
    default:
      return "欢迎来到兽展日历！兽展日历致力于为您提供最新最全的兽展、兽聚等相关资讯整合，来这里寻找感兴趣的展会，叫上朋友一起来玩吧！";
    case "zh-Hant":
      return "歡迎來到獸展日曆！ 獸展日曆致力於為您提供最新最全的獸展、獸聚等相關資訊整合，來這裡尋找感興趣的展會，叫上朋友一起來玩吧！";
    case "en":
      return "FurConsCalendar is dedicated to providing the latest and most comprehensive information on furry conventions and gatherings. Come here to find interesting events and invite your friends to join the fun!";
  }
}

function eventDescriptionGenerator(
  locale: currentSupportLocale,
  event: {
    name?: string;
    organization?: { name: string };
    address?: string | null;
    region?: { localName?: string | null } | null;
    startAt?: string | null;
    endAt?: string | null;
  },
) {
  if (!event) {
    return defaultDescriptionGenerator(locale);
  }

  switch (locale) {
    case "zh-Hans":
    default:
      return event.startAt && event.endAt
        ? `“${event?.name}”是由“${event?.organization?.name}”举办的兽展，展会定于${formatDate(
            event?.startAt,
            "YYYY年MM月DD日",
            locale,
          )}至${formatDate(event?.endAt, "YYYY年MM月DD日", locale)}在“${event?.region?.localName}${event?.address}”举办`
        : `“${event?.name}”是由“${event?.organization?.name}”举办的兽展，展会的举办时间还没有公布，预计将在“${event?.region?.localName}${event?.address || ""}”举办`;
    case "zh-Hant":
      return event.startAt && event.endAt
        ? `“${event?.name}”是由“${event?.organization?.name}”舉辦的獸展，展會定於${formatDate(
            event?.startAt,
            "YYYY年MM月DD日",
            locale,
          )}至${formatDate(event?.endAt, "YYYY年MM月DD日", locale)}在“${event?.region?.localName}${event?.address}”舉辦`
        : `“${event?.name}”是由“${event?.organization?.name}”舉辦的獸展，展會的舉辦時間還沒有公佈，預計將在“${event?.region?.localName}${event?.address || ""}”舉辦`;
    case "en":
      return event.startAt && event.endAt
        ? `"${event?.name}" is a furry convention organized by "${
            event?.organization?.name
          }". The event is scheduled to be held from ${formatDate(
            event?.startAt,
            "MMMM DD, YYYY",
            locale,
          )} to ${formatDate(event?.endAt, "MMMM DD, YYYY", locale)} at "${event?.region?.localName}${event?.address}".`
        : `"${event?.name}" is a furry convention organized by "${
            event?.organization?.name
          }". The event date has not been announced yet and is expected to be held at "${event?.region?.localName}${event?.address || ""}".`;
  }
}

function organizationDetailDescriptionGenerator(
  locale: currentSupportLocale,
  organization: Organization,
  eventCount: number,
  eventStartAt?: string | null,
) {
  switch (locale) {
    case "zh-Hans":
    default:
      return `欢迎来到兽展日历！兽展日历提供关于 ${
        organization?.name
      } 的有关信息，这家展商已累计举办 ${eventCount} 场兽展，最近的一场在${
        eventStartAt ? formatDate(eventStartAt, "YYYY年MM月DD日", locale) : "未知时间线"
      }，${
        organization?.description
          ? `他们是这样介绍自己的：“${organization?.description}”。`
          : "不过他们没怎么介绍自己。"
      }`;
    case "zh-Hant":
      return `歡迎來到獸展日曆！ 獸展日曆提供關於 ${
        organization?.name
      } 的相關信息，這家展商已累計舉辦 ${eventCount} 場獸展，最近的一場在${
        eventStartAt ? formatDate(eventStartAt, "YYYY/MM/DD", locale) : "未知時間線"
      }，${
        organization?.description
          ? `他們是這樣介紹自己的：“${organization?.description}”。`
          : "不過他們沒怎麼介紹自己。"
      }`;
    case "en":
      return `Welcome to FurConsCalendar! FCC provides detailed information about "${
        organization?.name
      }": This organizer has hosted a total of ${eventCount} furry conventions, with the most recent one held on ${
        eventStartAt ? formatDate(eventStartAt, "MMMM DD, YYYY", locale) : "unknown date"
      }. ${
        organization?.description
          ? `Here's how they describe themselves: "${organization?.description}".`
          : "However, they haven't provided much information about themselves."
      }`;
  }
}

function cityDetailDescriptionGenerator(
  locale: currentSupportLocale,
  cityName: string,
  eventCount: number,
) {
  switch (locale) {
    case "zh-Hans":
    default:
      return `这里是 ${cityName} 的兽展活动列表，累计收录了 ${eventCount} 场兽展（兽聚）活动。`;
    case "zh-Hant":
      return `這裡是 ${cityName} 的獸展時間軸，累計收錄了 ${eventCount} 場獸展（獸聚）活動。`;
    case "en":
      return `This is the furry event timeline for ${cityName}, with a total of ${eventCount} recorded furry conventions and gatherings.`;
  }
}

function cityDetailKeywordGenerator(locale: currentSupportLocale, city: { name: string }) {
  return generateCityDetailKeywords(city, locale).join(",");
}

export {
  universalKeywords,
  keywordGenerator,
  cityDetailKeywordGenerator,
  titleGenerator,
  defaultDescriptionGenerator as descriptionGenerator,
  eventDescriptionGenerator,
  cityDetailDescriptionGenerator,
  organizationDetailDescriptionGenerator,
};
