import { sendTrack } from "@/utils/track";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import "dayjs/locale/zh-tw";
import { SimpleEventItem } from "@/types/event";
import { useTranslation } from "next-i18next";
import { getDayjsLocale } from "@/utils/locale";

function SimpleEventCard({ event }: { event: SimpleEventItem }) {
  const { t, i18n } = useTranslation();
  const dateFormat = t("date.monthDay") || "MM月DD日";
  const dayjsLocale = getDayjsLocale(i18n.language);

  return (
    <Link
      key={event.id}
      href={`/${event.organization?.slug}/${event.slug}`}
      onClick={() =>
        sendTrack({
          eventName: "click-mini-event-card",
          eventValue: {
            href: `/${event.organization?.slug}/${event.slug}`,
            from: "year list",
          },
        })
      }
      className="rounded-xl shadow relative flex justify-center items-center group bg-white"
    >
      <div className="z-10 relative pointer-events-none p-2">
        <h4 className="tracking-wide text-slate-700 font-bold text-base text-center group-hover:text-red-400 transition">{`${event.region?.localName} · ${event.name}`}</h4>
        <p className="text-center text-slate-600">{event.organization?.name}</p>
        {event.startAt && event.endAt && (
          <p className="text-center text-slate-600 text-sm">
            {event.startAt && <span>{dayjs(event.startAt).locale(dayjsLocale).format(dateFormat)}</span>}
            -
            {event.endAt && <span>{dayjs(event.endAt).locale(dayjsLocale).format(dateFormat)}</span>}
          </p>
        )}
      </div>
    </Link>
  );
}

export default SimpleEventCard;
