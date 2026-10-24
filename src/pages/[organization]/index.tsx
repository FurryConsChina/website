import EventCard from "@/components/eventCard";
import OrganizationStatus from "@/components/organizationStatus";
import styles from "@/styles/Organization.module.css";
import clsx from "clsx";
import Image from "@/components/image";
import PageviewTag from "@/components/PageviewHeatTag";
import { GetServerSidePropsContext } from "next/types";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { FaPaw, FaQq, FaTwitter, FaWeibo } from "react-icons/fa";
import { MdOutlineContentCopy } from "react-icons/md";
import { SiBilibili, SiXiaohongshu } from "react-icons/si";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";
import "dayjs/locale/zh-tw";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
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
  events: EventCardItem[];
  organization: Organization;
  pageviewCount: number | null;
}) {
  const { t, i18n } = useTranslation();
  const { organization, events, pageviewCount } = props;
  const dayjsLocale = getDayjsLocale(i18n.language);

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
    const theBeginningEvent = events[events.length - 1];
    if (theBeginningEvent && theBeginningEvent.startAt) {
      const date = new Date(theBeginningEvent.startAt);

      return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
      };
    }

    return null;
  }, [events]);

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

  return (
    <div>
      <div className="border bg-white rounded-xl p-6">
        <div className="flex flex-col md:flex-row">
          {organization.logoUrl && (
            <div className="border rounded flex justify-center p-2 w-full md:w-48 md:h-48 h-48 shrink-0">
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
          <div className="mt-4 md:mt-0 md:ml-4 ">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">{organization.name}</h2>
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
              <span>{t("organization.totalEvent", { amount: events.length })}</span>
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

            <div
              className={clsx(
                "flex items-center flex-wrap first:mr-0 gap-4",
                // styles.links
              )}
            >
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

      {!!events.length && (
        <section className="mt-8 rounded-xl">
          <h2 className="text-xl text-slate-600 mb-4">{t("organization.passedEvent")}</h2>
          <div className="grid gird-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((e) => (
              <EventCard
                key={e.id}
                event={e}
                sizes="(max-width: 750px)750px, (max-width: 1080px) 1080px, (min-width: 1200px) 1200px, 1200px"
                fallbackWidth={1200}
              />
            ))}
          </div>
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

  const reqParamsParseResult = orgParamsSchema.parse({
    organization: context.params?.organization,
  });

  try {
    const locale = formatLocale(context.locale);
    const pageviewPath = getOrganizationDetailUrl({
      organizationSlug: reqParamsParseResult.organization,
      locale,
      fullUrl: false,
    });

    const data = await OrganizationsAPI.getOrganizationDetail(reqParamsParseResult.organization);

    if (!data) {
      return {
        notFound: true,
      };
    }

    // 访问量按实体读取历史本底，需要先取得组织 ID。
    const pv = await InfraAPI.getPageview({
      targetType: "organization",
      targetId: data.organization.id,
      path: pageviewPath,
    }).catch((): null => null);

    const validOrganization = data.organization;
    const validEvents: EventCardItem[] =
      data.events
        ?.map((e) => {
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
            address: e.place?.address ?? null,
            region: e.region ? { localName: e.region.localName } : null,
            organization: primary ? { slug: primary.slug, name: primary.name } : null,
            organizations: others.map((o) => ({ slug: o.slug, name: o.name })),
            features: e.features.map((f) => ({ name: f.name })),
            thumbnail: e.thumbnail ?? null,
            media: null,
          };
        })
        .sort((a, b) => {
          if (a.startAt && b.startAt) {
            return dayjs(a.startAt).isBefore(b.startAt) ? 1 : -1;
          }
          return 0;
        }) || [];

    return {
      props: {
        organization: validOrganization,
        events: validEvents,
        pageviewCount: pv,
        headMetas: {
          title: `${validOrganization?.name}`,
          des: organizationDetailDescriptionGenerator(
            locale,
            validOrganization!,
            validEvents?.length,
            validEvents[0]?.startAt,
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
        ...(context.locale ? await serverSideTranslations(context.locale, ["common"]) : {}),
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
