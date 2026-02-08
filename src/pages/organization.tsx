import clsx from "clsx";
import { groupBy } from "es-toolkit/compat";
import Image from "@/components/image";
import Link from "next/link";
import { sendTrack } from "@/utils/track";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { OrganizationsAPI } from "@/api/organizations";
import { OrganizationListItem } from "@/types/organization";
import { OrganizationPageMeta } from "@/utils/meta";
import { currentSupportLocale } from "@/utils/locale";
import { breadcrumbGenerator } from "@/utils/structuredData";

export default function OrganizationPage({ organizations }: { organizations: OrganizationListItem[] }) {
  const groupByStatusOrganizations = groupBy(organizations, (o) => o.status);
  const { t } = useTranslation();

  return (
    <div className="bg-white p-6 rounded-xl">
      <section>
        <h1 className="font-bold text-gray-600 text-2xl">{t("organization.active")}</h1>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {groupByStatusOrganizations["active"].map((o) => (
            <OrganizationItem key={o.id} organization={o} />
          ))}
        </div>
      </section>
      <section className="mt-6">
        <h1 className="font-bold text-gray-600 text-2xl">{t("organization.inactive")}</h1>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {groupByStatusOrganizations["inactive"].map((o) => (
            <OrganizationItem key={o.id} organization={o} />
          ))}
        </div>
      </section>
    </div>
  );
}

function OrganizationItem({ organization }: { organization: OrganizationListItem }) {
  const { t } = useTranslation();

  return (
    <Link
      href={organization.slug || ""}
      onClick={() =>
        sendTrack({
          eventName: "click-organization-card",
          eventValue: {
            href: organization.slug,
            from: "organization list",
          },
        })
      }
    >
      <div className="rounded-xl border py-3 px-2 cursor-pointer h-full flex flex-col items-center justify-center">
        {organization.logoUrl && (
          <div className="relative mx-auto">
            <Image
              className="object-contain h-16 w-16 md:h-20 md:w-20 mx-auto"
              src={organization.logoUrl}
              alt={t("organization.logoAlt", { name: organization.name })}
              // width={124}
              height={80}
              sizes="(max-width: 750px) 256px, (max-width: 768px) 300px, 300px"
              autoFormat
            />
          </div>
        )}
        <h2
          className={clsx(
            "tracking-wide text-gray-600 text-center text-sm md:text-lg font-bold",
            organization.logoUrl && "mt-2",
          )}
        >
          {organization.name}
        </h2>
      </div>
    </Link>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  const organizations = await OrganizationsAPI.getOrganizationList({
    current: "1",
    pageSize: "999",
    sortBy: "eventCount",
  });

  if (!organizations) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      organizations: organizations.records.map((organization) => ({
        id: organization.id,
        slug: organization.slug,
        name: organization.name,
        status: organization.status,
        logoUrl: organization.logoUrl,
      })),
      headMetas: {
        title: OrganizationPageMeta[locale as currentSupportLocale].title,
        des: OrganizationPageMeta[locale as currentSupportLocale].description(organizations.total),
        link: "/organization",
      },
      structuredData: {
        ...breadcrumbGenerator({
          items: [
            {
              name: OrganizationPageMeta[locale as currentSupportLocale].title,
              item: "/organization",
            },
          ],
        }),
      },
      ...(await serverSideTranslations(locale, ["common"])),
    },
    revalidate: 500,
  };
}
