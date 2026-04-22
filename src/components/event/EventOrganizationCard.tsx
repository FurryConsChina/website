import NextImage from "@/components/image";
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
} from "@/components/OrganizationLinkButton";
import OrganizationStatus from "@/components/organizationStatus";
import type { EventItem } from "@/types/event";
import { sendTrack } from "@/utils/track";
import clsx from "clsx";
import { useTranslation } from "next-i18next/pages";
import Link from "next/link";
import { useState } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

type EventOrganizationCardProps = {
  event: EventItem;
  showDescriptionContainer: boolean;
};

export default function EventOrganizationCard(props: EventOrganizationCardProps) {
  const { t } = useTranslation();
  const orgList = [props.event.organization, ...props.event.organizations];
  const [activeIndex, setActiveIndex] = useState(0);
  const showOrgSwitcher = orgList.length > 1;

  const organization = orgList[activeIndex] ?? orgList[0]!;

  const goToPrev = () => {
    setActiveIndex((i) => (i - 1 + orgList.length) % orgList.length);
  };
  const goToNext = () => {
    setActiveIndex((i) => (i + 1) % orgList.length);
  };

  return (
    <div
      id="event-detail__right"
      className={clsx(
        "bg-white rounded-xl mb-4 lg:mb-0",
        !props.showDescriptionContainer && "w-full",
        props.showDescriptionContainer && "md:w-4/12",
      )}
    >
      <div className="p-4">
        {showOrgSwitcher && (
          <div className="flex justify-between items-center mb-1">
            <span className="text-lg font-bold text-gray-600">主办方 {activeIndex + 1}/{orgList.length}</span>
            <div
              className="inline-flex p-1.5 gap-1 items-stretch rounded-xl bg-slate-100/95"
              role="group"
              aria-label={t("event.hostSwitchGroupAria")}
            >
              <button
                type="button"
                onClick={goToPrev}
                className="rounded-lg px-2.5 py-1.5 text-slate-600 bg-white hover:shadow-sm transition-[color,box-shadow] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/80 focus-visible:ring-offset-1"
                aria-label={t("event.prevHostOrganization")}
              >
                <IoChevronBack className="text-lg" aria-hidden />
              </button>
              <button
                type="button"
                onClick={goToNext}
                className="rounded-lg px-2.5 py-1.5 text-slate-600 bg-white hover:shadow-sm transition-[color,box-shadow] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/80 focus-visible:ring-offset-1"
                aria-label={t("event.nextHostOrganization")}
              >
                <IoChevronForward className="text-lg" aria-hidden />
              </button>
            </div>
          </div>
        )}
        <div className="flex">
          {organization.logoUrl && (
            <div className="border rounded flex justify-center items-center p-2 w-[100px] h-[100px]">
              <NextImage
                className="object-contain"
                alt={`${organization.name}'s logo`}
                width={200}
                height={200}
                src={organization.logoUrl}
                autoFormat
              />
            </div>
          )}
          <div className="ml-4 flex flex-col justify-between">
            <div>
              <Link className="text-2xl font-bold text-gray-600" target="_blank" href={`/${organization.slug}`}>
                {organization.name}
              </Link>
              <div className="flex items-center text-gray-500 mb-4">
                <span className="text-sm">
                  <OrganizationStatus status={organization.status || ""} />
                </span>
              </div>
            </div>

            <Link href={`/${organization.slug}`}>
              <button
                onClick={() =>
                  sendTrack({
                    eventName: "click-event-portal",
                    eventValue: {
                      link: `/${organization.slug}`,
                    },
                  })
                }
                className="border rounded px-2 py-1 text-sm text-gray-500 hover:border-slate-400 hover:drop-shadow transition duration-200"
              >
                {t("event.gotoOrganization")}
              </button>
            </Link>
          </div>
        </div>

        <div
          className={clsx(
            "items-center text-gray-500 grid gap-4 mt-4",
            !props.showDescriptionContainer && "lg:grid-cols-2",
          )}
        >
          {organization.website && <WebsiteButton t={t} href={organization.website} />}
          {organization.qqGroup && <QQGroupButton t={t} text={organization.qqGroup} />}
          {organization.bilibili && <BiliButton t={t} href={organization.bilibili} />}

          {organization.weibo && <WeiboButton t={t} href={organization.weibo} />}

          {organization.twitter && <TwitterButton t={t} href={organization.twitter} />}

          {organization.contactMail && <EmailButton t={t} mail={organization.contactMail} />}

          {organization.plurk && <PlurkButton t={t} href={organization.plurk} />}

          {organization.facebook && <FacebookButton t={t} href={organization.facebook} />}

          {organization.rednote && <RednoteButton t={t} href={organization.rednote} />}
        </div>
      </div>
    </div>
  );
}
