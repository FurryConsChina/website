import EventCard from "@/components/EventCard";
import {
  BiliButton,
  EmailButton,
  FacebookButton,
  PlurkButton,
  QQGroupButton,
  RednoteButton,
  TwitterButton,
  WebsiteButton,
  WeiboButton,
  WikifurButton,
} from "@/components/OrganizationLinkButton";
import OrganizationStatus, { getOranizationStatusConfig } from "@/components/OrganizationStatus";
import styles from "@/styles/Organization.module.css";
import clsx from "clsx";
import Image from "@/components/Image";
import PageviewTag from "@/components/PageviewHeatTag";
import { GetServerSidePropsContext } from "next/types";
import { useMemo, useState } from "react";
import Pagination from "@/components/Pagination";
import type { ListResponse } from "@/types/api";
import toast from "react-hot-toast";
import { FaPaw, FaQq, FaTwitter, FaWeibo } from "react-icons/fa";
import { GrStatusGoodSmall } from "react-icons/gr";
import { MdOutlineContentCopy } from "react-icons/md";
import { SiBilibili, SiXiaohongshu } from "react-icons/si";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";
import "dayjs/locale/zh-tw";
import { getLayoutProps } from "@/utils/layoutProps";
import { useTranslation } from "next-i18next/pages";
import { OrganizationsAPI } from "@/api/organizations";
import { InfraAPI } from "@/api/infra";
import * as z from "zod/v4";
import type { EventCardItem } from "@/types/event";
import type { Organization } from "@/types/organization";
import { OrganizationLinkType } from "@/constants/organization";
import { getEventOrganizations } from "@/utils/event";
import { getOrganizationLink } from "@/utils/organization";
import { keywordGenerator, organizationDetailDescriptionGenerator, OrganizationPageMeta } from "@/utils/meta";
import { getOrganizationDetailUrl } from "@/utils/url";
import { breadcrumbGenerator } from "@/utils/structuredData";
import { formatLocale, getDayjsLocale } from "@/utils/locale";
import axios from "axios";
// import {
//   WebsiteButton,
//   QQGroupButton,
//   BiliButton,
//   WeiboButton,
//   TwitterButton,
//   EmailButton,
//   WikifurButton,
// } from "@/components/OrganizationLinkButton";

dayjs.extend(relativeTime);

export default function OrganizationDetail(props: {
  events: ListResponse<EventCardItem>;
  organization: Organization;
  firstEventStartAt: string | null;
  pageviewCount: number | null;
  nowTimestamp: number;
}) {
  const { t, i18n } = useTranslation();
  const { organization, events, firstEventStartAt, pageviewCount, nowTimestamp } = props;
  const dayjsLocale = getDayjsLocale(i18n.language);
  const statusConfig = getOranizationStatusConfig(organization.status, t);
  const [flippedStats, setFlippedStats] = useState<Record<string, boolean>>({});

  const website = getOrganizationLink(organization, OrganizationLinkType.Website);
  const bilibili = getOrganizationLink(organization, OrganizationLinkType.Bilibili);
  const weibo = getOrganizationLink(organization, OrganizationLinkType.Weibo);
  const twitter = getOrganizationLink(organization, OrganizationLinkType.Twitter);
  const wikifur = getOrganizationLink(organization, OrganizationLinkType.Wikifur);
  const qqGroup = getOrganizationLink(organization, OrganizationLinkType.QQGroup);
  const plurk = getOrganizationLink(organization, OrganizationLinkType.Plurk);
  const facebook = getOrganizationLink(organization, OrganizationLinkType.Facebook);
  const rednote = getOrganizationLink(organization, OrganizationLinkType.Rednote);

  const formattedFirstEventTime = useMemo(() => {
    if (firstEventStartAt) {
      const date = new Date(firstEventStartAt);

      return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
      };
    }

    return null;
  }, [firstEventStartAt]);

  const formattedCreationTime = useMemo(() => {
    if (organization.foundedOn) {
      const date = new Date(organization.foundedOn);

      return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        createDistance: dayjs(date).locale(dayjsLocale).toNow(true),
      };
    } else {
      return null;
    }
  }, [organization.foundedOn, dayjsLocale]);

  const avgEventsPerYear = useMemo(() => {
    const startSource = firstEventStartAt || organization.foundedOn;
    if (!startSource || events.total <= 0) return null;
    const yearsSpan = Math.max(1, dayjs(nowTimestamp).diff(dayjs(startSource), "year", true));
    return Number((events.total / yearsSpan).toFixed(1));
  }, [events.total, firstEventStartAt, organization.foundedOn, nowTimestamp]);

  const stats = [
    {
      key: "totalEvents",
      label: t("organization.stats.totalEvents"),
      value: String(events.total),
      backLabel: avgEventsPerYear != null ? t("organization.stats.avgPerYearLabel") : null,
      backValue: avgEventsPerYear != null ? t("organization.stats.avgPerYearValue", { count: avgEventsPerYear }) : null,
    },
    ...(formattedCreationTime
      ? [
          {
            key: "founded",
            label: t("organization.stats.founded"),
            value: formattedCreationTime.createDistance,
            backLabel: t("organization.stats.foundedDate"),
            backValue: `${formattedCreationTime.year}.${String(formattedCreationTime.month).padStart(2, "0")}.${String(formattedCreationTime.day).padStart(2, "0")}`,
          },
        ]
      : []),
    ...(formattedFirstEventTime
      ? [
          {
            key: "firstEvent",
            label: t("organization.stats.firstEvent"),
            value: `${formattedFirstEventTime.year}.${String(formattedFirstEventTime.month).padStart(2, "0")}`,
            backLabel: t("organization.stats.firstEventDate"),
            backValue: `${formattedFirstEventTime.year}.${String(formattedFirstEventTime.month).padStart(2, "0")}.${String(formattedFirstEventTime.day).padStart(2, "0")}`,
          },
        ]
      : []),
  ];

  const toggleStatFlip = (key: string) => {
    setFlippedStats((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hasChannels = Boolean(
    website ||
    qqGroup ||
    bilibili ||
    weibo ||
    twitter ||
    organization.contactMail ||
    wikifur ||
    plurk ||
    facebook ||
    rednote,
  );

  return (
    <div>
      {/* Mobile */}
      <div className="md:hidden bg-white shadow-sm rounded-xl overflow-hidden">
        {organization.logoUrl && (
          <div className="relative h-32 sm:h-36 overflow-hidden bg-gray-100">
            <Image
              className="w-full h-full object-cover scale-150 blur-2xl opacity-55 saturate-150"
              containerClassName="w-full h-full block"
              alt=""
              width={200}
              height={200}
              src={organization.logoUrl}
              autoFormat
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/55" />
          </div>
        )}

        <div className="p-4 sm:p-6">
          {organization.logoUrl && (
            <div className="relative z-10 -mt-16 mx-auto rounded-2xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-4 ring-white flex items-center justify-center w-24 h-24 overflow-hidden">
              <Image
                className="object-contain w-full h-full"
                containerClassName="w-full h-full flex items-center justify-center"
                alt={t("organization.logoAlt", { name: organization.name })}
                width={200}
                height={200}
                src={organization.logoUrl}
                autoFormat
              />
            </div>
          )}

          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-gray-800 text-center break-words mb-2">
              {organization.name}
            </div>

            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-2.5 rounded-full bg-white px-4 py-1.5 text-xs font-medium text-gray-700 shadow">
                <span className="inline-flex items-center gap-1.5 leading-none">
                  <GrStatusGoodSmall className={clsx("text-[9px] shrink-0", statusConfig.color)} aria-hidden />
                  <span>{statusConfig.label}</span>
                </span>
                {pageviewCount != null && (
                  <>
                    <span className="h-3 w-px bg-gray-200" aria-hidden />
                    <PageviewTag count={pageviewCount} className="text-red-400" />
                  </>
                )}
              </div>
            </div>

            <dl
              className={clsx(
                "grid gap-2.5",
                stats.length === 1 && "grid-cols-1",
                stats.length === 2 && "grid-cols-2",
                stats.length === 3 && "grid-cols-3",
              )}
            >
              {stats.map((stat) => {
                const canFlip = Boolean(stat.backValue && stat.backLabel);
                const isFlipped = canFlip && Boolean(flippedStats[stat.key]);

                if (!canFlip) {
                  return (
                    <div
                      key={stat.key}
                      className="flex flex-col-reverse items-center justify-center rounded-xl bg-[#f5f5f7] py-3 px-2 text-center"
                    >
                      <dt className="mt-1 text-xs text-gray-400">{stat.label}</dt>
                      <dd className="text-base sm:text-lg font-bold text-gray-800 tabular-nums leading-tight">
                        {stat.value}
                      </dd>
                    </div>
                  );
                }

                return (
                  <button
                    key={stat.key}
                    type="button"
                    aria-pressed={isFlipped}
                    onClick={() => toggleStatFlip(stat.key)}
                    className="w-full text-center cursor-pointer select-none focus:outline-none"
                    style={{ perspective: "600px" }}
                  >
                    <div
                      className="relative w-full transition-transform duration-500"
                      style={{
                        transformStyle: "preserve-3d",
                        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                      }}
                    >
                      <div
                        className="flex flex-col-reverse items-center justify-center rounded-xl bg-[#f5f5f7] py-3 px-2 text-center"
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                        }}
                      >
                        <dt className="mt-1 text-xs text-gray-400">{stat.label}</dt>
                        <dd className="text-base sm:text-lg font-bold text-gray-800 tabular-nums leading-tight">
                          {stat.value}
                        </dd>
                      </div>

                      <div
                        className="absolute inset-0 flex flex-col-reverse items-center justify-center rounded-xl bg-red-400 text-white py-3 px-1.5 text-center"
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                        }}
                      >
                        <span className="mt-1 text-xs text-white/80">{stat.backLabel}</span>
                        <span className="text-sm sm:text-base font-bold tabular-nums leading-tight">
                          {stat.backValue}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </dl>
          </div>

          <div className="border-t border-gray-100 my-5" />

          <div>
            <h2 className="text-base font-bold text-slate-700 mb-2">{t("organization.des")}</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line break-words">
              {organization.description || t("organization.defaultDes")}
            </p>
          </div>

          {hasChannels && (
            <>
              <div className="border-t border-gray-100 my-5" />
              <div>
                <h2 className="text-base font-bold text-slate-700 mb-3">{t("organization.links")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {website && <WebsiteButton t={t} href={website} />}
                  {qqGroup && <QQGroupButton t={t} text={qqGroup} />}
                  {bilibili && <BiliButton t={t} href={bilibili} />}
                  {weibo && <WeiboButton t={t} href={weibo} />}
                  {rednote && <RednoteButton t={t} href={rednote} />}
                  {twitter && <TwitterButton t={t} href={twitter} />}
                  {organization.contactMail && <EmailButton t={t} mail={organization.contactMail} />}
                  {wikifur && <WikifurButton t={t} href={wikifur} />}
                  {plurk && <PlurkButton t={t} href={plurk} />}
                  {facebook && <FacebookButton t={t} href={facebook} />}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Desktop: 保持原有桌面端排版不变 */}
      <div className="hidden md:block bg-white shadow-sm rounded-xl p-6">
        <div className="flex flex-row">
          {organization.logoUrl && (
            <div className="border rounded flex justify-center p-2 w-48 h-48 shrink-0">
              <Image
                className="object-contain h-full"
                containerClassName="h-full"
                alt={t("organization.logoAlt", { name: organization.name })}
                width={200}
                height={200}
                src={organization.logoUrl}
                autoFormat
              />
            </div>
          )}
          <div className="ml-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">{organization.name}</h1>
            </div>

            <div className="flex items-center gap-2 mb-2 text-gray-500">
              <OrganizationStatus status={organization.status} />
              <PageviewTag count={pageviewCount} />
            </div>

            <div className={clsx("mb-2 text-gray-500", styles["intro-bar"])}>
              {formattedCreationTime && (
                <span>
                  {t("organization.createdAt", {
                    distance: formattedCreationTime.createDistance,
                  })}
                </span>
              )}
              <span>{t("organization.totalEvent", { amount: events.total })}</span>
              {formattedFirstEventTime && (
                <span>
                  {t("organization.firstTimeEvent", {
                    year: formattedFirstEventTime?.year,
                    month: formattedFirstEventTime?.month,
                    day: formattedFirstEventTime?.day,
                  })}
                </span>
              )}

              {formattedCreationTime && (
                <span>
                  {t("organization.firstTimeShow", {
                    year: formattedCreationTime?.year,
                    month: formattedCreationTime?.month,
                    day: formattedCreationTime?.day,
                  })}
                </span>
              )}
            </div>

            <div className="flex items-center flex-wrap first:mr-0 gap-4">
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-300 hover:bg-blue-400 transition rounded-xl px-4 py-1 text-white"
                >
                  {t("organization.website")}
                </a>
              )}

              {bilibili && (
                <a
                  href={bilibili}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center bg-sky-400 hover:bg-sky-500 transition rounded-xl px-4 py-1 text-white text-center"
                >
                  <SiBilibili className="mr-2" />
                  {t("organization.bilibili")}
                </a>
              )}
              {weibo && (
                <a
                  href={weibo}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center bg-red-500 hover:bg-red-600 transition rounded-xl px-4 py-1 text-white text-center"
                >
                  <FaWeibo className="mr-2" />
                  {t("organization.weibo")}
                </a>
              )}

              {twitter && (
                <a
                  href={twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 transition rounded-xl px-4 py-1 text-white text-center"
                >
                  <FaTwitter className="mr-2" />
                  {t("organization.twitter")}
                </a>
              )}

              {wikifur && (
                <a
                  href={wikifur}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center bg-blue-800 hover:bg-blue-900 transition rounded-xl px-4 py-1 text-white text-center"
                >
                  <FaPaw className="mr-2" />
                  {t("organization.wikifur")}
                </a>
              )}

              {qqGroup && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(qqGroup).then(() => toast.success(t("organization.qqCopySuccess")));
                  }}
                  className="flex items-center justify-center bg-red-300 hover:bg-red-400 transition rounded-xl px-4 py-1 text-white text-center"
                >
                  <FaQq className="mr-2" />
                  {t("organization.qq", { qq: qqGroup })}
                </button>
              )}

              {organization.contactMail && (
                <div className="flex items-center bg-green-600 hover:bg-green-700 transition rounded-xl px-4 py-1 text-white">
                  <a href={`mailto:${organization.contactMail}`}>
                    {t("organization.mail", {
                      email: organization.contactMail,
                    })}
                  </a>
                  <div
                    onClick={() => {
                      navigator.clipboard
                        .writeText(organization.contactMail!)
                        .then(() => toast.success(t("organization.mailCopySuccess")));
                    }}
                    className="border-l ml-2 pl-2 cursor-pointer"
                  >
                    <MdOutlineContentCopy />
                  </div>
                </div>
              )}

              {plurk && (
                <a
                  href={plurk}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center bg-red-500 hover:bg-red-600 transition rounded-xl px-4 py-1 text-white text-center"
                >
                  <FaPaw className="mr-2" />
                  {t("organization.plurk")}
                </a>
              )}

              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center bg-blue-800 hover:bg-blue-900 transition rounded-xl px-4 py-1 text-white text-center"
                >
                  <FaPaw className="mr-2" />
                  {t("organization.facebook")}
                </a>
              )}

              {rednote && (
                <a
                  href={rednote}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center bg-red-600 hover:bg-red-700 transition rounded-xl px-4 py-1 text-white text-center"
                >
                  <SiXiaohongshu className="mr-2" />
                  {t("organization.rednote")}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t my-8" />
        <h2 className="text-xl text-slate-600 mb-4">{t("organization.des")}</h2>
        <p className="text-slate-700 whitespace-pre-line">{organization.description || t("organization.defaultDes")}</p>
      </div>

      {events.total > 0 && (
        <section className="mt-6 sm:mt-8 rounded-xl">
          <h2 className="text-lg sm:text-xl text-slate-600 mb-3 sm:mb-4 px-0.5">{t("organization.passedEvent")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
            {events.records.map((e, index) => (
              <EventCard
                key={e.id}
                event={e}
                sizes="(max-width: 750px)750px, (max-width: 1080px) 1080px, (min-width: 1200px) 1200px, 1200px"
                fallbackWidth={1200}
                priority={index < 3}
              />
            ))}
          </div>
          <Pagination
            className="mt-6 sm:mt-8"
            current={events.current}
            totalPages={Math.ceil(events.total / events.pageSize)}
            getPageHref={(page) => ({
              pathname: `/${organization.slug}`,
              query: page > 1 ? { page } : {},
            })}
          />
        </section>
      )}
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  context.res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=300");

  const orgParamsSchema = z.object({
    organization: z
      .string()
      .min(1)
      .regex(/^[a-zA-Z0-9-]+$/),
  });

  const reqParamsParseResult = orgParamsSchema.safeParse({
    organization: context.params?.organization,
  });

  if (!reqParamsParseResult.success) {
    return { notFound: true };
  }

  const pageResult = z.coerce
    .number()
    .int()
    .min(1)
    .max(Number.MAX_SAFE_INTEGER)
    .safeParse(context.query.page ?? 1);
  if (!pageResult.success || Array.isArray(context.query.page)) {
    return { notFound: true };
  }
  const current = pageResult.data;

  try {
    const locale = formatLocale(context.locale);
    const slug = reqParamsParseResult.data.organization;
    const pageviewPath = getOrganizationDetailUrl({
      organizationSlug: slug,
      locale,
      fullUrl: false,
    });

    const [data, events] = await Promise.all([
      OrganizationsAPI.getOrganizationDetail(slug),
      OrganizationsAPI.getOrganizationEvents(slug, { current, pageSize: 12, orderByStartAt: "desc" }),
    ]);

    if (!data || current > Math.max(1, Math.ceil(events.total / events.pageSize))) {
      return {
        notFound: true,
      };
    }

    const [pv, layoutProps] = await Promise.all([
      InfraAPI.getPageview({
        targetType: "organization",
        targetId: data.organization.id,
        path: pageviewPath,
      }).catch((): null => null),
      getLayoutProps(context.locale),
    ]);

    const validOrganization = data.organization;
    const validEvents: EventCardItem[] = events.records.map((e) => {
      const { primary, others } = getEventOrganizations(e);
      return {
        id: e.id,
        urlKey: e.urlKey,
        name: e.name,
        startAt: e.startAt,
        endAt: e.endAt,
        scale: e.scale,
        type: e.type,
        locationType: e.locationType,
        placeName: e.place?.name ?? null,
        region: e.region ? { localName: e.region.localName } : null,
        organization: primary ? { slug: primary.slug, name: primary.name } : null,
        organizations: others.map((o) => ({ slug: o.slug, name: o.name })),
        features: e.features.map((f) => ({ name: f.name })),
        thumbnail: e.thumbnail ?? null,
        media: null,
      };
    });

    return {
      props: {
        organization: validOrganization,
        events: { ...events, records: validEvents },
        firstEventStartAt: data.firstEventStartAt,
        pageviewCount: pv,
        nowTimestamp: Date.now(),
        headMetas: {
          title: `${validOrganization?.name}`,
          des: organizationDetailDescriptionGenerator(
            locale,
            validOrganization!,
            events.total,
            data.latestEventStartAt,
          ),
          keywords: keywordGenerator({
            page: "organization",
            locale: locale,
            organization: validOrganization,
          }),
          url: `/${validOrganization?.slug}`,
          cover: validOrganization?.logoUrl,
        },
        structuredData: {
          ...breadcrumbGenerator({
            items: [
              {
                name: OrganizationPageMeta[locale].title,
                item: "/organization",
              },
              {
                name: validOrganization?.name,
              },
            ],
          }),
        },
        ...layoutProps,
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return {
          notFound: true,
        };
      }
    }
    throw error;
  }
}
