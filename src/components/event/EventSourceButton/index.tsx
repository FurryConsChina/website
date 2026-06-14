import { sendTrack } from "@/utils/track";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useTranslation } from "next-i18next/pages";
import toast from "react-hot-toast";
import { IoChevronDown } from "react-icons/io5";

type EventSource = { url: string; name: string | null; description: string | null };

function getUrl(value: string) {
  try {
    const href = value.trim();
    const url = new URL(href);
    return ["http:", "https:"].includes(url.protocol) ? href : null;
  } catch {
    return null;
  }
}

export default function EventSourceButton({
  sources,
  eventName,
}: {
  sources: EventSource[];
  eventName: string;
}) {
  const { t } = useTranslation();
  const firstSource = sources[0];
  if (!firstSource) {
    return null;
  }

  const track = (source: EventSource) => {
    sendTrack({
      eventName: "click-event-website",
      eventValue: {
        eventName,
        link: source.url,
      },
    });
  };

  const copySource = (source: EventSource) => {
    navigator.clipboard
      .writeText(source.url)
      .then(() => toast.success(t("event.sourceCopySuccess", { name: source.name || source.url })));
    track(source);
  };

  const renderSourceAction = (source: EventSource, className: string, children: React.ReactNode) => {
    const href = getUrl(source.url);
    return href ? (
      <a href={href} target="_blank" rel="noreferrer" onClick={() => track(source)} className={className}>
        {children}
      </a>
    ) : (
      <button type="button" onClick={() => copySource(source)} className={className}>
        {children}
      </button>
    );
  };

  const getSourceActionText = (source: EventSource) => {
    return getUrl(source.url)
      ? t("event.goToSource", { name: source.name || t("event.source") })
      : t("event.copySource", { name: source.name || t("event.source") });
  };

  const mainButtonClass =
    "block mt-8 px-16 py-4 bg-red-400 text-white font-bold rounded-md text-center transition duration-300 border-2 border-red-100 shadow-lg";

  if (sources.length === 1) {
    return renderSourceAction(firstSource, mainButtonClass, getSourceActionText(firstSource));
  }

  return (
    <Menu as="div" className="relative mt-8 flex w-full shadow-lg">
      {renderSourceAction(
        firstSource,
        "flex-1 px-16 py-4 bg-red-400 text-white font-bold rounded-l-md text-center transition duration-300 border-2 border-r-0 border-red-100",
        getSourceActionText(firstSource),
      )}

      <MenuButton
        aria-label={t("event.sourceList")}
        className="group flex items-center justify-center px-4 bg-red-400 text-white rounded-r-md transition duration-300 border-2 border-red-100"
      >
        <IoChevronDown aria-hidden className="text-xl transition duration-200 group-data-[open]:rotate-180" />
      </MenuButton>

      <MenuItems
        transition
        className="absolute left-0 right-0 top-full z-20 mt-2 origin-top rounded-md bg-white p-2 shadow-xl ring-1 ring-black/5 transition duration-150 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 focus:outline-none"
      >
        {sources.map((source, index) => (
          <MenuItem key={`${source.url}-${index}`}>
            {({ focus }) =>
              renderSourceAction(
                source,
                `block w-full px-4 py-3 text-left transition-all duration-200 rounded-md ${focus ? "bg-red-50 text-red-600" : "text-gray-700"}`,
                <>
                  <span className="block font-medium">{source.name || `${getSourceActionText(source)} ${index + 1}`}</span>
                  {(source.description || source.url) && (
                    <span className="mt-1 block truncate text-sm text-gray-500">{source.description || source.url}</span>
                  )}
                </>,
              )
            }
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}
