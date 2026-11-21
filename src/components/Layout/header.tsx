import { sendTrack } from "@/utils/track";
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { useTranslation } from "next-i18next/pages";
import Image from "@/components/Image";
import { TbMenuDeep } from "react-icons/tb";
import { useCurrentPath } from "@/utils/path";
import LocaleMenu, { MobileLocaleSelector } from "@/components/Layout/localeMenu";
import SearchModal from "@/components/SearchModal";
import imageLoader from "@/utils/imageLoader";

// const AnimeEmojis = [
//   "tiger-face",
//   "wolf",
//   "lion",
//   "dog-face",
//   "fox",
//   "leopard",
//   "bison",
//   "ox",
//   "cow",
//   "water-buffalo",
//   "cow-face",
//   "boar",
//   "elephant",
//   "mammoth",
//   "rhinoceros",
//   "hippopotamus",
//   "shark",
//   "seal",
//   "dolphin",
//   "whale",
//   "spouting",
//   "dragon",
//   "crocodile",
//   "parrot",
//   "owl",
//   "eagle",
//   "dove",
//   "penguin",
//   "bird",
//   "paw",
//   "badger",
//   "skunk",
//   "langaroo",
//   "otter",
//   "sloth",
//   "panda",
//   "koala",
//   "polar-bear",
//   "bear",
// ].map((emojiName) => (
//   <span key={emojiName} className={`icon-[fluent-emoji--${emojiName}]`} />
// ));

const NavLinks = [
  { name: "header.nav.homepage", link: "/" },
  { name: "header.nav.city", link: "/city" },
  { name: "header.nav.organization", link: "/organization" },
  { name: "header.nav.years", link: "/years" },
];

export default function Header({ slogan }: { slogan?: string | null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const bodyRef = useRef<HTMLBodyElement | null>(null);

  useEffect(() => {
    bodyRef.current = document.querySelector("body");
    return () => {
      bodyRef.current?.classList.remove("overflow-y-hidden");
    };
  }, []);

  const handleMenuClick = (openStatus: boolean) => {
    setIsMenuOpen(openStatus);
    if (bodyRef.current) {
      if (openStatus) {
        bodyRef.current.classList.add("overflow-y-hidden");
      } else {
        bodyRef.current.classList.remove("overflow-y-hidden");
      }
    }
  };

  const handleOpenSearch = () => {
    if (isMenuOpen) {
      handleMenuClick(false);
    }
    setIsSearchOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-30 md:relative md:mt-8 md:mb-8">
        <div
          className={clsx(
            "shadow bg-white flex justify-between items-center rounded-b-xl md:rounded-xl",
            "px-3 py-2 md:p-0",
          )}
        >
          <HeaderLeft slogan={slogan} />
          <HeaderNav isMenuOpen={isMenuOpen} switchMenu={handleMenuClick} onOpenSearch={handleOpenSearch} />
          <HeaderRight onOpenSearch={handleOpenSearch} />
        </div>
        <MobileMenu isOpen={isMenuOpen} switchMenu={handleMenuClick} />
      </header>
      <SearchModal open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}

function HeaderLeft({ slogan }: { slogan?: string | null }) {
  const { t } = useTranslation();

  return (
    <Link href="/" className="px-1 md:px-4 lg:basis-1/4 shrink-0 min-w-0">
      <div className="flex gap-2 items-center">
        <Image
          alt="logo"
          src="logo_800x800.png"
          width={40}
          height={40}
          fallbackWidth={40}
          fallbackHeight={40}
          quality={100}
          className="w-8 h-8 shrink-0"
        />
        <div className="flex flex-col min-w-0">
          <h1 className="text-geraldine text-base md:text-2xl font-bold flex items-center gap-1.5 md:gap-2">
            <span className="truncate">{t("header.title")}</span>
            <span className="flex items-center shrink-0">
              <img
                alt="title-emoji"
                src={imageLoader({ src: "assets/svgs/tiger-face.svg" })}
                width={32}
                height={32}
                fetchPriority="low"
                className="w-5 h-5 md:w-6 md:h-6"
              />
              <img
                alt="title-emoji"
                src={imageLoader({ src: "assets/svgs/wolf.svg" })}
                width={32}
                height={32}
                fetchPriority="low"
                className="w-5 h-5 md:w-6 md:h-6"
              />
              <img
                alt="title-emoji"
                src={imageLoader({ src: "assets/svgs/lion.svg" })}
                width={32}
                height={32}
                fetchPriority="low"
                className="w-5 h-5 md:w-6 md:h-6"
              />
            </span>
          </h1>
          {slogan ? <span className="text-xs md:text-base text-gray-700 font-bold truncate">{slogan}</span> : null}
        </div>
      </div>
    </Link>
  );
}

function HeaderNav({
  isMenuOpen,
  switchMenu,
  onOpenSearch,
}: {
  isMenuOpen: boolean;
  switchMenu: (open: boolean) => void;
  onOpenSearch: () => void;
}) {
  const { t } = useTranslation();
  const { isCurrentPath } = useCurrentPath();

  return (
    <>
      <div className="flex items-center gap-1 md:hidden shrink-0">
        <button
          type="button"
          aria-label={t("event.filter.search")}
          className="p-1.5 rounded-lg text-xl text-gray-600 active:bg-gray-100 transition-colors"
          onClick={onOpenSearch}
        >
          <IoSearch />
        </button>
        <button
          type="button"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
          className="p-1.5 -mr-1 rounded-lg text-2xl text-gray-600 active:bg-gray-100 transition-colors"
          onClick={() => switchMenu(!isMenuOpen)}
        >
          {isMenuOpen ? <IoMdClose /> : <TbMenuDeep />}
        </button>
      </div>
      <nav className={clsx("hidden md:block mx-3 my-2 flex-auto", "bg-gray-100 rounded-md px-3 py-2")}>
        <ol className="flex gap-4 justify-between">
          {NavLinks.map((nav) => (
            <li
              key={nav.name}
              className={clsx(
                "font-bold rounded-md w-full",
                isCurrentPath(nav.link, nav.link !== "/")
                  ? "text-geraldine bg-white"
                  : "text-slate-700 hover:text-geraldine hover:bg-white/70",
              )}
            >
              <Link
                className="flex justify-center py-2 h-full w-full flex-col text-center"
                href={nav.link}
                onClick={() => {
                  switchMenu(false);
                  sendTrack({
                    eventName: "click-nav-link",
                    eventValue: {
                      href: nav.link,
                    },
                  });
                }}
              >
                {t(nav.name)}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

function HeaderRight({ onOpenSearch }: { onOpenSearch: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="hidden md:flex items-center justify-end px-4 py-2 h-full lg:basis-1/4">
      <div className="border-l border-gray-200 pl-6">
        <div className="bg-gray-100 rounded-md px-3 py-2 flex items-center gap-3">
          <button
            type="button"
            aria-label={t("event.filter.search")}
            onClick={onOpenSearch}
            className="text-gray-600 hover:text-gray-900 flex items-center justify-center transition-colors"
          >
            <IoSearch size={20} aria-hidden />
          </button>
          <span className="h-5 w-px bg-gray-300/80" aria-hidden />
          <LocaleMenu />
        </div>
      </div>
    </div>
  );
}

function MobileMenu({ isOpen, switchMenu }: { isOpen: boolean; switchMenu: (open: boolean) => void }) {
  const { t } = useTranslation();
  const { isCurrentPath } = useCurrentPath();

  return (
    <div
      className={clsx(
        "fixed inset-0 top-0 left-0 -z-10 md:hidden",
        "w-full h-dvh transition-opacity duration-200",
        isOpen ? "bg-gray-900/50 opacity-100 pointer-events-auto" : "bg-transparent opacity-0 pointer-events-none",
      )}
      onClick={() => switchMenu(false)}
    >
      <div
        className={clsx(
          "pt-16 pb-4 px-3 bg-gray-100 rounded-b-2xl shadow-lg transition-transform duration-200 ease-out",
          isOpen ? "translate-y-0" : "-translate-y-full",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <ol className="py-2 gap-2.5 grid grid-cols-2">
          {NavLinks.map((nav) => (
            <li key={nav.name}>
              <Link
                href={nav.link}
                className={clsx(
                  "px-3 py-3.5 rounded-xl font-bold shadow-sm text-base text-center tracking-wide block transition-colors",
                  isCurrentPath(nav.link, nav.link !== "/")
                    ? "text-white bg-red-400"
                    : "text-slate-700 bg-white active:bg-gray-50",
                )}
                onClick={() => {
                  switchMenu(false);
                  sendTrack({
                    eventName: "click-nav-link",
                    eventValue: {
                      href: nav.link,
                    },
                  });
                }}
              >
                {t(nav.name)}
              </Link>
            </li>
          ))}
        </ol>

        <MobileLocaleSelector key={String(isOpen)} onSelect={() => switchMenu(false)} />
      </div>
    </div>
  );
}
