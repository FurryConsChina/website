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
import { OrganizationLinkType } from "@/constants/organization";
import type { EventItem } from "@/types/event";
import { getEventOrganizations } from "@/utils/event";
import { getOrganizationLink } from "@/utils/organization";
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
  const { primary, others } = getEventOrganizations(props.event);
  const orgList = primary ? [primary, ...others] : others;
  const [activeIndex, setActiveIndex] = useState(0);
  const showOrgSwitcher = orgList.length > 1;

  const organization = orgList[activeIndex] ?? orgList[0];

  if (!organization) return null;

  const organizationProfileHref = `/${organization.slug}`;
  const website = getOrganizationLink(organization, OrganizationLinkType.Website);
  const qqGroup = getOrganizationLink(organization, OrganizationLinkType.QQGroup);
  const bilibili = getOrganizationLink(organization, OrganizationLinkType.Bilibili);
  const weibo = getOrganizationLink(organization, OrganizationLinkType.Weibo);
  const twitter = getOrganizationLink(organization, OrganizationLinkType.Twitter);
  const plurk = getOrganizationLink(organization, OrganizationLinkType.Plurk);
  const facebook = getOrganizationLink(organization, OrganizationLinkType.Facebook);
  const rednote = getOrganizationLink(organization, OrganizationLinkType.Rednote);
  const trackOrganizationProfileClick = () => {
    sendTrack({
      eventName: "click-event-portal",
      eventValue: {
        link: organizationProfileHref,
      },
    });
  };

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
            <span className="text-lg font-bold text-gray-600">
              {t("event.hostOrganizationCounter", { index: activeIndex + 1, total: orgList.length })}
            </span>
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
                alt={t("organization.logoAlt", { name: organization.name })}
                width={200}
                height={200}
                src={organization.logoUrl}
                autoFormat
              />
            </div>
          )}
          <div className="ml-4 flex flex-col justify-between">
            <div>
              <Link
                className="text-2xl font-bold text-gray-600"
                href={organizationProfileHref}
                onClick={trackOrganizationProfileClick}
              >
                {organization.name}
              </Link>
              <div className="flex items-center text-gray-500 mb-4">
                <span className="text-sm">
                  <OrganizationStatus status={organization.status || ""} />
                </span>
              </div>
            </div>

            <Link href={organizationProfileHref} onClick={trackOrganizationProfileClick}>
              <button
                type="button"
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
          {website && <WebsiteButton t={t} href={website} />}
          {qqGroup && <QQGroupButton t={t} text={qqGroup} />}
          {bilibili && <BiliButton t={t} href={bilibili} />}

          {weibo && <WeiboButton t={t} href={weibo} />}

          {twitter && <TwitterButton t={t} href={twitter} />}

          {organization.contactMail && <EmailButton t={t} mail={organization.contactMail} />}

          {plurk && <PlurkButton t={t} href={plurk} />}

          {facebook && <FacebookButton t={t} href={facebook} />}

          {rednote && <RednoteButton t={t} href={rednote} />}
        </div>
      </div>
    </div>
  );
}
