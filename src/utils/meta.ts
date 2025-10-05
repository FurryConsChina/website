import { OrganizationType } from "@/types/organization";
import { format } from "date-fns";

export type currentSupportLocale = "zh-Hans" | "zh-tw" | "en" | "ru";

export const OrganizationPageMeta = {
  "zh-Hans": {
    title: "展商列表",
    description: (organizationCount: number) =>
      `欢迎来到兽展日历！兽展日历共计收录了 ${organizationCount} 个和兽展/兽聚相关的展方，无论他们今天是否还在活跃，我们真挚感谢这些为兽人文化发展做出贡献的团体。`,
  },
  "zh-tw": {
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
   "zh-tw": {
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
  "zh-tw": {
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
    case "zh-tw":
      return ["獸聚", "獸展", "獸聚日曆", "獸展日曆"];
    case "en":
      return ["Furry Convention", "Furry Con", "Furry Convention Calendar"];
  }
};

function generateHomeKeywords(nowYear: number, locale: currentSupportLocale) {
  switch (locale) {
    case "zh-Hans":
    default:
      return [
        `${nowYear}兽展`,
        `${nowYear}兽展时间表`,
        `${nowYear}兽聚`,
        `${nowYear}兽聚时间表`,
      ];
    case "zh-tw":
      return [
        `${nowYear}獸展`,
        `${nowYear}獸展時程表`,
        `${nowYear}獸聚`,
        `${nowYear}獸聚時程表`,
      ];
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
  locale: currentSupportLocale
) {
  const startYear = event?.startDate
    ? format(event.startDate, locale === "en" ? "yyyy" : "yyyy年")
    : null;
  switch (locale) {
    case "zh-Hans":
      return [
        `${event?.name}`,
        `${event?.name}兽聚`,
        `${event?.name}兽展`,
        `${event?.name}举办时间`,
        `${event?.name}时间`,
        ...(event?.city ? [`${event.city}兽聚`, `${event.city}兽展`] : []),
        ...(startYear ? [`${startYear}兽聚`, `${startYear}兽展`] : []),
        ...(startYear && event?.city
          ? [`${startYear}${event.city}兽聚`, `${startYear}${event.city}兽展`]
          : []),
      ];
    case "zh-tw":
    default:
      return [
        `${event?.name}`,
        `${event?.name}獸聚`,
        `${event?.name}獸展`,
        `${event?.name}舉辦時間`,
        `${event?.name}時間`,
        ...(event?.city ? [`${event.city}獸聚`, `${event.city}獸展`] : []),
        ...(startYear ? [`${startYear}獸聚`, `${startYear}獸展`] : []),
        ...(startYear && event?.city
          ? [`${startYear}${event.city}獸聚`, `${startYear}${event.city}獸展`]
          : []),
      ];
    case "en":
      return [
        `${event?.name}`,
        `${event?.name} Furry Gathering`,
        `${event?.name} Furry Convention`,
        `${event?.name} Event Time`,
        `${event?.name} Schedule`,
        ...(event?.city
          ? [`${event.city} Furry Gathering`, `${event.city} Furry Convention`]
          : []),
        ...(startYear
          ? [`${startYear} Furry Gatherings`, `${startYear} Furry Conventions`]
          : []),
        ...(startYear && event?.city
          ? [
              `${startYear} ${event.city} Furry Gathering`,
              `${startYear} ${event.city} Furry Convention`,
            ]
          : []),
      ];
  }
}

function generateOrganizationKeywords(
  organization: { name: string },
  locale: currentSupportLocale
) {
  switch (locale) {
    case "zh-Hans":
    default:
      return [
        `${organization?.name}`,
        `${organization?.name}兽聚`,
        `${organization?.name}兽展`,
      ];
    case "zh-tw":
      return [
        `${organization?.name}`,
        `${organization?.name}獸聚`,
        `${organization?.name}獸展`,
      ];
    case "en":
      return [
        `${organization?.name}`,
        `${organization?.name} Furry Gathering`,
        `${organization?.name} Furry Convention`,
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
      return [
        ...universalKeywords(locale),
        ...generateHomeKeywords(nowYear, locale),
      ].join(",");

    case "event":
      return event
        ? generateEventKeywords(event, locale).join(",")
        : universalKeywords(locale).join(",");

    case "organization":
      return organization
        ? generateOrganizationKeywords(organization, locale).join(",")
        : universalKeywords(locale).join(",");

    default:
      return universalKeywords(locale).join(",");
  }
}

function titleGenerator(locale: currentSupportLocale, title?: string) {
  switch (locale) {
    case "en":
      return title ? `${title}——FurConsCalendar` : "FurConsCalendar";
    case "zh-Hans":
    default:
      return title
        ? `${title}—FEC·兽展日历 | FEC·兽聚日历`
        : "FEC·兽展日历 | FEC·兽聚日历";
  }
}

function descriptionGenerator(locale: currentSupportLocale) {
  switch (locale) {
    case "zh-Hans":
    default:
      return "欢迎来到兽展日历！兽展日历致力于为您提供最新最全的兽展、兽聚等相关资讯整合，来这里寻找感兴趣的展会，叫上朋友一起来玩吧！";
    case "zh-tw":
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
    region?: { localName: string } | null;
    startAt?: string | null;
    endAt?: string | null;
  }
) {
  if (!event) {
    return descriptionGenerator(locale);
  }

  switch (locale) {
    case "zh-Hans":
    default:
      return event.startAt && event.endAt
        ? `欢迎来到兽展日历！兽展日历提供关于“${
            event?.name
          }”的详细信息：这是由“${
            event?.organization?.name
          }”举办的兽展，将于${format(
            event?.startAt!,
            "yyyy年MM月dd日"
          )}至${format(event?.endAt!, "yyyy年MM月dd日")}在“${
            event?.region?.localName
          }${event?.address}”举办，喜欢的朋友记得关注开始售票时间～`
        : `欢迎来到兽展日历！兽展日历提供关于“${event?.name}”的详细信息：这是由“${event?.organization?.name}”举办的兽展，将在“${event?.region?.localName}${event?.address}”举办，喜欢的朋友记得关注开始售票时间～`;
    case "zh-tw":
      return event.startAt && event.endAt
        ? `歡迎來到獸展日曆！獸展日曆提供關於“${
            event?.name
          }”的詳細信息：這是由“${
            event?.organization?.name
          }”舉辦的獸展，將於${format(
            event?.startAt!,
            "yyyy/MM/dd"
          )}至${format(event?.endAt!, "yyyy/MM/dd")}在“${
            event?.region?.localName
          }${event?.address}”舉辦，喜歡的朋友記得關注開票時間～`
        : `歡迎來到獸展日曆！獸展日曆提供關於“${event?.name}”的詳細信息：這是由“${event?.organization?.name}”舉辦的獸展，將在“${event?.region?.localName}${event?.address}”舉辦，喜歡的朋友記得關注開票時間～`;
    case "en":
      return event.startAt && event.endAt
        ? `Details about "${
            event?.name
          }": This furry convention is organized by "${
            event?.organization?.name
          }" and will be held from ${format(
            event?.startAt!,
            "MMMM dd, yyyy"
          )} to ${format(event?.endAt!, "MMMM dd, yyyy")} at "${
            event?.region?.localName
          }${event?.address}". Stay tuned for ticket sales!`
        : `Welcome to FurConsCalendar! FCC provides detailed information about "${event?.name}": This furry convention is organized by "${event?.organization?.name}" and will be held at "${event?.region?.localName}${event?.address}". Stay tuned for ticket sales!`;
  }
}

function organizationDetailDescriptionGenerator(
  locale: currentSupportLocale,
  organization: OrganizationType,
  eventCount: number,
  eventStartAt?: string | null
) {
  switch (locale) {
    case "zh-Hans":
    default:
      return `欢迎来到兽展日历！兽展日历提供关于 ${
        organization?.name
      } 的有关信息，这家展商已累计举办 ${eventCount} 场兽展，最近的一场在${
        eventStartAt ? format(eventStartAt, "yyyy年MM月dd日") : "未知时间线"
      }，${
        organization?.description
          ? `他们是这样介绍自己的：“${organization?.description}”。`
          : "不过他们没怎么介绍自己。"
      }`;
    case "zh-tw":
      return `歡迎來到獸展日曆！ 獸展日曆提供關於 ${
        organization?.name
      } 的相關信息，這家展商已累計舉辦 ${eventCount} 場獸展，最近的一場在${
        eventStartAt ? format(eventStartAt, "yyyy/MM/dd") : "未知時間線"
      }，${
        organization?.description
          ? `他們是這樣介紹自己的：“${organization?.description}”。`
          : "不過他們沒怎麼介紹自己。"
      }`;
    case "en":
      return `Welcome to FurConsCalendar! FCC provides detailed information about "${
        organization?.name
      }": This organizer has hosted a total of ${eventCount} furry conventions, with the most recent one held on ${
        eventStartAt ? format(eventStartAt, "MMMM dd, yyyy") : "unknown date"
      }. ${
        organization?.description
          ? `Here's how they describe themselves: "${organization?.description}".`
          : "However, they haven't provided much information about themselves."
      }`;
  }
}

export {
  universalKeywords,
  keywordGenerator,
  titleGenerator,
  descriptionGenerator,
  eventDescriptionGenerator,
  organizationDetailDescriptionGenerator,
};
