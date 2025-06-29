import clsx from "clsx";
import groupBy from "lodash-es/groupBy";
import Image from "@/components/image";
import Link from "next/link";
import { sendTrack } from "@/utils/track";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { organizationsAPI } from "@/api/organizations";
import { OrganizationType } from "@/types/organization";
import { currentSupportLocale, OrganizationPageMeta } from "@/utils/meta";

export default function OrganizationPage({
  organizations,
}: {
  organizations: OrganizationType[];
}) {
  const groupByStatusOrganizations = groupBy(organizations, (o) => o.status);
  const { t } = useTranslation();

  return (
    <div className="bg-white p-6 rounded-xl">
      <section>
        <h1 className="font-bold text-gray-600 text-2xl">
          {t("organization.active")}
        </h1>
        <div className="mt-4 grid md:grid-cols-3 gap-10">
          {groupByStatusOrganizations["active"].map((o) => (
            <OrganizationItem key={o.id} organization={o} />
          ))}
        </div>
      </section>
      <section className="mt-6">
        <h1 className="font-bold text-gray-600 text-2xl">
          {t("organization.inactive")}
        </h1>
        <div className="mt-4 grid md:grid-cols-3 gap-10">
          {groupByStatusOrganizations["inactive"].map((o) => (
            <OrganizationItem key={o.id} organization={o} />
          ))}
        </div>
      </section>
    </div>
  );
}

function OrganizationItem({
  organization,
}: {
  organization: OrganizationType;
}) {
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
      <div className="rounded-xl border p-6 cursor-pointer h-full flex flex-row items-center justify-center md:flex-col">
        {organization.logoUrl && (
          <div className="relative w-2/4 md:h-3/4 max-h-12 mx-auto">
            <Image
              className="object-contain h-full max-h-12 mx-auto"
              src={organization.logoUrl}
              alt={`${organization.name}'s logo`}
              width={124}
              height={50}
              sizes="(max-width: 750px) 256px, (max-width: 768px) 300px, 300px"
              autoFormat
            />
          </div>
        )}
        <h2
          className={clsx(
            "w-3/4 tracking-wide text-gray-600 md:text-center text-lg border-l md:border-l-0 ml-4 md:ml-0 pl-4 md:pl-0 font-bold",
            organization.logoUrl && "md:mt-4"
          )}
        >
          {organization.name}
        </h2>
      </div>
    </Link>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  const PUBLIC_URL = process.env.NEXT_PUBLIC_URL;
  const organizations = await organizationsAPI.getAllOrganizations();

  if (!organizations) {
    return {
      notFound: true,
    };
  }

  const title = OrganizationPageMeta[locale as currentSupportLocale].title;
  const des = OrganizationPageMeta[locale as currentSupportLocale].description(
    organizations.length
  );

  return {
    props: {
      organizations: organizations,
      headMetas: {
        title: OrganizationPageMeta[locale as currentSupportLocale].title,
        des: OrganizationPageMeta[locale as currentSupportLocale].description(
          organizations.length
        ),
        link: "/organization",
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
          ],
        },
      },
      ...(await serverSideTranslations(locale, ["common"])),
    },
    revalidate: 500,
  };
}
