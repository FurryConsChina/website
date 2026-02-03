import { sendTrack } from "@/utils/track";
import Link from "next/link";
import { format } from "date-fns";
import { EventItem } from "@/types/event";
import { useTranslation } from "next-i18next";

function SimpleEventCard({ event }: { event: EventItem }) {
  const { t } = useTranslation();

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
            {event.startAt && (
              <span>{format(event.startAt, t("date.monthDay"))}</span>
            )}
            -
            {event.endAt && (
              <span>{format(event.endAt, t("date.monthDay"))}</span>
            )}
          </p>
        )}
      </div>
    </Link>
  );
}

export default SimpleEventCard;
