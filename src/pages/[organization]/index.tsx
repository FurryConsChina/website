import EventCard from "@/components/eventCard";
import OrganizationStatus from "@/components/organizationStatus";
import styles from "@/styles/Organization.module.css";
import clsx from "clsx";
import Image from "@/components/image";
import { GetServerSidePropsContext } from "next/types";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { FaPaw, FaQq, FaTwitter, FaWeibo } from "react-icons/fa";
import { MdOutlineContentCopy } from "react-icons/md";
import { SiBilibili, SiXiaohongshu } from "react-icons/si";
import { formatDistanceToNowStrict, isBefore } from "date-fns";
import { zhCN } from "date-fns/locale";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { organizationsAPI } from "@/api/organizations";
import { z } from "zod";
import { format } from "date-fns";
import { EventType } from "@/types/event";
import { OrganizationSchema, OrganizationType } from "@/types/organization";
import { FeatureSchema } from "@/types/feature";
import {
  currentSupportLocale,
  keywordGenerator,
  organizationDetailDescriptionGenerator,
} from "@/utils/meta";
import { HTTPError } from "ky";
// import {
//   WebsiteButton,
//   QQGroupButton,
//   BiliButton,
//   WeiboButton,
//   TwitterButton,
//   EmailButton,
//   WikifurButton,
// } from "@/components/OrganizationLinkButton";

export default function OrganizationDetail(props: {
  events: EventType[];
  organization: OrganizationType;
}) {
  const { t } = useTranslation();
  const { organization, events } = props;

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
    if (organization.creationTime) {
      const date = new Date(organization.creationTime);

      return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        createDistance: formatDistanceToNowStrict(date, { locale: zhCN }),
      };
    } else {
      return null;
    }
  }, [organization.creationTime]);

  return (
    <div>
      <div className="border bg-white rounded-xl p-6">
        <div className="flex flex-col md:flex-row">
          {organization.logoUrl && (
            <div className="border rounded flex justify-center p-2 w-full md:w-48 md:h-48 h-48 shrink-0">
              <Image
                className="object-contain h-full"
                containerClassName="h-full"
                alt={`${organization.name}的展会徽标`}
                width={200}
                height={200}
                src={organization.logoUrl}
                autoFormat
              />
            </div>
          )}
          <div className="mt-4 md:mt-0 md:ml-4 ">
            <h2 className="text-2xl font-bold mb-2">{organization.name}</h2>

            <div className="flex items-center mb-2 text-gray-500">
              <OrganizationStatus status={organization.status} />
            </div>

            <div className={clsx("mb-2 text-gray-500", styles["intro-bar"])}>
              {formattedCreationTime && (
                <span>
                  {t("organization.createdAt", {
                    distance: formattedCreationTime.createDistance,
                  })}
                </span>
              )}
              <span>
                {t("organization.totalEvent", { amount: events.length })}
              </span>
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
                "flex items-center flex-wrap first:mr-0 gap-4"
                // styles.links
              )}
            >
              {organization.website && (
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-300 hover:bg-blue-400 transition rounded-xl px-4 py-1 text-white"
                >
                  {t("organization.website")}
                </a>
              )}

              {organization?.bilibili && (
                <a
                  href={organization?.bilibili}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center bg-sky-400 hover:bg-sky-500 transition rounded-xl px-4 py-1 text-white text-center"
                >
                  <SiBilibili className="mr-2" />
                  {t("organization.bilibili")}
                </a>
              )}
              {organization?.weibo && (
                <a
                  href={organization?.weibo}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center bg-red-500 hover:bg-red-600 transition rounded-xl px-4 py-1 text-white text-center"
                >
                  <FaWeibo className="mr-2" />
                  {t("organization.weibo")}
                </a>
              )}

              {organization?.twitter && (
                <a
                  href={organization?.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 transition rounded-xl px-4 py-1 text-white text-center"
                >
                  <FaTwitter className="mr-2" />
                  {t("organization.twitter")}
                </a>
              )}

              {organization?.wikifur && (
                <a
                  href={organization?.wikifur}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center bg-blue-800 hover:bg-blue-900 transition rounded-xl px-4 py-1 text-white text-center"
                >
                  <FaPaw className="mr-2" />
                  {t("organization.wikifur")}
                </a>
              )}

              {organization?.qqGroup && (
                <button
                  onClick={() => {
                    navigator.clipboard
                      .writeText(organization?.qqGroup || "")
                      .then(() =>
                        toast.success(t("organization.qqCopySuccess"))
                      );
                  }}
                  className="flex items-center justify-center bg-red-300 hover:bg-red-400 transition rounded-xl px-4 py-1 text-white text-center"
                >
                  <FaQq className="mr-2" />
                  {t("organization.qq", { qq: organization?.qqGroup })}
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
                        .then(() =>
                          toast.success(t("organization.mailCopySuccess"))
                        );
                    }}
                    className="border-l ml-2 pl-2 cursor-pointer"
                  >
                    <MdOutlineContentCopy />
                  </div>
                </div>
              )}

              {organization?.plurk && (
                <a
                  href={organization?.plurk}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center bg-red-500 hover:bg-red-600 transition rounded-xl px-4 py-1 text-white text-center"
                >
                  <FaPaw className="mr-2" />
                  {t("organization.plurk")}
                </a>
              )}

              {organization?.facebook && (
                <a
                  href={organization?.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center bg-blue-800 hover:bg-blue-900 transition rounded-xl px-4 py-1 text-white text-center"
                >
                  <FaPaw className="mr-2" />
                  {t("organization.facebook")}
                </a>
              )}

              {organization?.rednote && (
                <a
                  href={organization?.rednote}
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
        <p className="text-slate-700 whitespace-pre-line">
          {organization.description || t("organization.defaultDes")}
        </p>
      </div>

      {!!events.length && (
        <section className="mt-8 p-6 bg-gray-100/80 rounded-xl shadow">
          <h2 className="text-xl text-slate-600 mb-4">
            {t("organization.passedEvent")}
          </h2>
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
  const PUBLIC_URL = process.env.NEXT_PUBLIC_WEBSITE_URL;
  try {
    const orgParamsSchema = z.object({
      organization: z
        .string()
        .min(1)
        .regex(/^[a-zA-Z0-9-]+$/),
    });

    const reqParamsParseResult = orgParamsSchema.parse({
      organization: context.params?.organization,
    });

    const data = await organizationsAPI.getOrganizationDetail(reqParamsParseResult.organization);

    const validOrganization = data.organization;
    const validEvents =
      data.events
        ?.map((e) => ({
          ...e,
          organization: {
            name: validOrganization?.name,
            slug: validOrganization?.slug,
            logoUrl: validOrganization?.logoUrl,
          },
        }))
        .sort((a, b) => {
          if (a.startAt && b.startAt) {
            return isBefore(a.startAt, b.startAt) ? 1 : -1;
          }
          return 0;
        }) || [];
    const slug = context?.params?.organization;

    if (!data) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        organization: validOrganization,
        events: validEvents,
        headMetas: {
          title: `${validOrganization?.name}`,
          des: organizationDetailDescriptionGenerator(
            (context.locale as currentSupportLocale) || "zh-Hans",
            validOrganization!,
            validEvents?.length,
            validEvents[0]?.startAt
          ),
          keywords: keywordGenerator({
            page: "organization",
            locale: context.locale as "zh-Hans" | "en",
            organization: validOrganization,
          }),
          url: `/${validOrganization?.slug}`,
          cover: validOrganization?.logoUrl,
        },
        structuredData: {
          breadcrumb: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "展商",
                item: `https://${PUBLIC_URL}/organization`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: validOrganization?.name,
              },
            ],
          },
        },
        ...(context.locale
          ? await serverSideTranslations(context.locale, ["common"])
          : {}),
      },
    };
  } catch (error) {
    if (error instanceof HTTPError && error.response.status === 404) {
      return {
        notFound: true,
      };
    }
    throw new Error(`Organization render error: ${error}`);
  }
}
