import clsx from "clsx";
import { GrStatusGoodSmall } from "react-icons/gr";
import { useTranslation } from "next-i18next";
import type { TFunction } from "i18next";

export default function OrganizationStatus(props: { status: string }) {
  const { t } = useTranslation();
  const statusConfig = getOranizationStatusConfig(props.status, t);
  return (
    <div className="flex items-center">
      <div className="text-sm h-4 flex justify-center flex-col">
        <GrStatusGoodSmall className={clsx("mr-1", statusConfig.color)} />
      </div>
      <span className="leading-4 h-4">{statusConfig.label}</span>
    </div>
  );
}

export function getOranizationStatusConfig(status: string, t: TFunction) {
  switch (status) {
    case "active":
      return { label: t("organization.status.active"), color: "text-green-400" };
    case "inactive":
      return {
        label: t("organization.status.inactive"),
        color: "text-red-400",
      };
    default:
      return { label: t("organization.status.unknown"), color: "text-gray-400" };
  }
}
