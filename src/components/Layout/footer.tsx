import { AboutUsLinks, FriendSiteLinks } from "@/constants/staticConfig";
import { sendTrack } from "@/utils/track";
import clsx from "clsx";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next/pages";
import Image from "@/components/Image";

export default function Footer({ isCNRegion }: { isCNRegion: boolean }) {
  const { t } = useTranslation();

  return (
    <footer className="mt-6 md:mt-8 bg-white shadow rounded-t-xl p-4 md:p-6 text-sm text-left">
      <h5 className="text-gray-600 mb-2.5 md:mb-4 text-xs sm:text-sm flex flex-row flex-wrap items-center gap-y-1">
        <span className="font-bold text-sm sm:text-base mr-2">{t("header.title")}</span>
        <span className="flex items-center text-gray-500">
          {t("footer.use")}
          <img
            alt="smiling-face-with-hearts"
            src="/svgs/smiling-face-with-hearts.svg"
            className="w-4 h-4 sm:w-5 sm:h-5 mx-1"
            fetchPriority="low"
            loading="lazy"
            width={32}
            height={32}
          />
          {t("footer.and")}
          <img
            alt="steaming-bowl"
            src="/svgs/steaming-bowl.svg"
            className="w-4 h-4 sm:w-5 sm:h-5 mx-1"
            fetchPriority="low"
            loading="lazy"
            width={32}
            height={32}
          />
          {t("footer.made")}
        </span>
      </h5>

      <div className="flex flex-col md:flex-row justify-between items-start">
        <div>
          <div className="flex flex-col md:flex-row items-start">
            <div className="hidden md:block mt-4 md:mt-0 text-center md:text-left md:mr-4">
              <h3 className="text-gray-700 mb-2">{t("footer.friendsLink")}</h3>
              <div className="flex flex-col">
                {FriendSiteLinks.map((link) => (
                  <FriendLink key={link.link} link={link.link} label={link.label} />
                ))}
              </div>
            </div>

            <div className="text-left">
              <h3 className="text-gray-700 hidden md:block mb-2">{t("footer.aboutUs")}</h3>
              <ul className="flex flex-wrap gap-x-1 gap-y-1 md:flex-col md:gap-y-0 text-xs sm:text-sm">
                {AboutUsLinks.map((link) => (
                  <li key={link.link}>
                    <FriendLink key={link.link} link={link.link} label={t(link.labelKey)} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col text-gray-600 text-left md:text-right text-xs mt-3 md:mt-0 space-y-1">
          <div className="flex flex-wrap items-center md:justify-end gap-x-2 gap-y-0.5">
            <span>
              ©️ {isCNRegion ? "FURRYCONS.CN" : "FURRYEVENTCHINA.COM"} {2023}-{new Date().getFullYear()}
            </span>
            <span className="text-gray-400" suppressHydrationWarning>
              build.{COMMITHASH}
            </span>
          </div>

          <span className="block text-gray-500">{t("footer.disclaimer")}</span>

          {isCNRegion && (
            <div className="flex flex-wrap items-center md:justify-end gap-x-3 gap-y-1 text-gray-500">
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer" className="hover:text-gray-700">
                渝ICP备18016662号-2
              </a>
              <span className="inline-flex items-center gap-1">
                <Image alt="beian" src="ga.png" width={14} height={14} className="w-3.5 h-3.5" />
                <a
                  href="https://beian.mps.gov.cn/#/query/webSearch?code=31010502007546"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-gray-700"
                >
                  沪公网安备31010502007546号
                </a>
              </span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

function FriendLink({ label, link }: { label: string; link: string }) {
  return (
    <a
      className="mr-2 text-gray-400 underline hover:text-gray-600 transition inline-block"
      href={link}
      referrerPolicy="no-referrer"
      onClick={() =>
        sendTrack({
          eventName: "click-footer-link",
          eventValue: {
            href: link,
          },
        })
      }
    >
      {label}
    </a>
  );
}

function getDisplayHost(url: string) {
  return new URL(url).hostname.replace(/^www\./, "");
}

export function FriendSiteBlock() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start", duration: 22 });

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setActiveIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const handleSelectSite = (index: number) => {
    setActiveIndex(index);
    emblaApi?.scrollTo(index);
  };

  const trackFriendLink = (link: (typeof FriendSiteLinks)[number]) => {
    sendTrack({
      eventName: "click-index-friend-link",
      eventValue: {
        href: link,
      },
    });
  };

  return (
    <section className="bg-white shadow-sm p-3.5 sm:p-4 md:p-6 rounded-xl mt-6 md:mt-8">
      <h3 className="font-bold text-gray-600 text-lg sm:text-xl md:text-2xl">{t("footer.friendsLink")}</h3>

      <div className="mt-3 md:hidden">
        <div className="overflow-hidden rounded-xl bg-red-400 text-white" ref={emblaRef}>
          <div className="flex items-stretch">
            {FriendSiteLinks.map((link) => (
              <div key={link.link} className="min-w-0 shrink-0 grow-0 basis-full flex">
                <Link
                  href={link.link}
                  onClick={() => trackFriendLink(link)}
                  className="flex flex-col justify-between w-full p-4 active:bg-red-500 transition-colors"
                >
                  <div>
                    <h4 className="text-base font-bold leading-snug">{link.label}</h4>
                    <p className="text-xs text-white/90 leading-relaxed mt-1.5">{link.description}</p>
                  </div>
                  <span className="mt-3 text-xs text-white/75 font-medium self-end">{getDisplayHost(link.link)} ↗</span>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2.5" role="tablist">
          {FriendSiteLinks.map((link, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={link.link}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleSelectSite(index)}
                className={clsx(
                  "px-3 py-2 rounded-lg border text-xs text-center truncate transition-all duration-200",
                  isActive
                    ? "border-red-400 text-red-400 font-bold bg-white"
                    : "border-gray-200 text-gray-600 bg-white active:bg-gray-50",
                )}
              >
                {link.shortLabel ?? link.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden md:grid md:grid-cols-3 gap-4 mt-4">
        {FriendSiteLinks.map((link) => (
          <Link
            href={link.link}
            key={link.link}
            onClick={() => trackFriendLink(link)}
            className="bg-white p-3 rounded-xl flex flex-col border group hover:border-red-300 hover:bg-red-300 transition duration-300 relative"
          >
            <h4 className="text-lg font-bold mb-3 transition duration-300 text-gray-600 group-hover:text-white decoration-transparent group-hover:decoration-current decoration-wavy">
              {link.label}
            </h4>
            <p className="text-sm group-hover:text-white transition duration-300 text-gray-600">{link.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
