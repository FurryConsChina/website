import { sendTrack } from "@/utils/track";
import { useTranslation } from "next-i18next";

export default function EventSourceButton({
  sources,
  eventName,
}: {
  sources: { url: string; name: string | null; description: string | null }[];
  eventName: string;
}) {
  const { t, i18n } = useTranslation();
  const firstSource = sources[0];
  if (!firstSource) {
    return null;
  }
  return (
    <a
      href={firstSource.url}
      target="_blank"
      rel="noreferrer"
      onClick={() =>
        sendTrack({
          eventName: "click-event-website",
          eventValue: {
            eventName: eventName,
            link: firstSource.url,
          },
        })
      }
      className="block mt-8 px-16 py-4 bg-red-400 text-white font-bold rounded-md text-center transition duration-300 border-2 border-red-100 hover:border-red-400 shadow-lg"
    >
      {t("event.goToSource")}
    </a>
  );
}
