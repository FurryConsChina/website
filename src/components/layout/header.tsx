import { sendTrack } from "@/utils/track";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { HiMenu } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import { useTranslation } from "next-i18next";
import Image from "@/components/image";
import { TbMenuDeep } from "react-icons/tb";
import { useCurrentPath } from "@/utils/path";
import { FaLanguage } from "react-icons/fa6";
import LocaleMenu from "@/components/layout/localeMenu";

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

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[9999] md:relative md:mt-8 md:mb-8">
      <div
        className={clsx(
          "shadow bg-white flex justify-between items-center rounded-b-xl md:rounded-xl",
          "px-2 py-2 md:p-0"
        )}
      >
        <HeaderLeft />
        <HeaderNav isMenuOpen={isMenuOpen} switchMenu={setIsMenuOpen} />
        <HeaderRight />
      </div>
      <MobileMenu isOpen={isMenuOpen} switchMenu={setIsMenuOpen} />
    </header>
  );
}

function HeaderLeft() {
  const { t } = useTranslation();

  return (
    <Link href="/" className="px-4 lg:basis-1/4 shrink-0">
      <div className="flex gap-2 items-center">
        <Image
          alt="logo"
          src="logo_800x800.png"
          width={40}
          height={40}
          fallbackWidth={40}
          fallbackHeight={40}
          quality={100}
          className="w-8 h-8"
        />
        <div className="flex flex-col">
          <h1 className="text-geraldine text-base md:text-2xl font-bold flex items-center gap-2">
            {t("header.title")}
            <span className="flex items-center">
              <img
                alt="title-emoji"
                src="/svgs/tiger-face.svg"
                width={32}
                height={32}
                fetchPriority="low"
                className="w-6 h-6"
              />
              <img
                alt="title-emoji"
                src="/svgs/wolf.svg"
                width={32}
                height={32}
                fetchPriority="low"
                className="w-6 h-6"
              />
              <img
                alt="title-emoji"
                src="/svgs/lion.svg"
                width={32}
                height={32}
                fetchPriority="low"
                className="w-6 h-6"
              />
            </span>
          </h1>
          <span className="text-xs md:text-base text-gray-700 font-bold">
            {t("header.slogan")}
          </span>
        </div>
      </div>
    </Link>
  );
}

function HeaderNav({
  isMenuOpen,
  switchMenu,
}: {
  isMenuOpen: boolean;
  switchMenu: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const { isCurrentPath } = useCurrentPath();

  const bodyRef = useRef<HTMLBodyElement | null>(null);

  useEffect(() => {
    bodyRef.current = document.querySelector("body");
  }, []);

  const handleMenuClick = (openStatus: boolean) => {
    switchMenu(openStatus);

    if (bodyRef.current) {
      if (openStatus) {
        bodyRef.current.classList.add("overflow-y-hidden");
      } else {
        bodyRef.current.classList.remove("overflow-y-hidden");
      }
    }
  };

  return (
    <>
      <div
        className="block md:hidden text-2xl text-gray-600"
        onClick={() => handleMenuClick(!isMenuOpen)}
        onKeyDown={() => handleMenuClick(!isMenuOpen)}
      >
        <TbMenuDeep />
      </div>
      <nav
        className={clsx(
          "hidden md:block mx-3 my-2 flex-auto",
          "bg-gray-100 rounded-md px-3 py-2"
        )}
      >
        <ol className="flex gap-4 justify-between">
          {NavLinks.map((nav) => (
            <li
              key={nav.name}
              className={clsx(
                "font-bold rounded-md w-full",
                isCurrentPath(nav.link)
                  ? "text-geraldine bg-white"
                  : "text-slate-700"
              )}
            >
              <Link
                className="flex justify-center py-2 h-full w-full flex-col text-center"
                href={nav.link}
                onClick={() => {
                  handleMenuClick(false);
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

function HeaderRight() {
  return (
    <div className="hidden md:flex items-center justify-end px-4 py-2 h-full lg:basis-1/4">
      <div className="border-l border-gray-200 pl-6">
        <div className="bg-gray-100 rounded-md px-2 py-2 flex gap-8 justify-center">
          <LocaleMenu />
        </div>
      </div>
    </div>
  );
}

function MobileMenu({
  isOpen,
  switchMenu,
}: {
  isOpen: boolean;
  switchMenu: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const { isCurrentPath } = useCurrentPath();
  return (
    <div
      className={clsx(
        "absolute top-0 left-0 -z-10 md:hidden",
        "w-full h-dvh transition-all duration-200",
        isOpen
          ? "bg-gray-800/70 translate-y-0"
          : "bg-transparent -translate-y-full"
      )}
    >
      <div
        className={clsx(
          "pt-14 bg-gray-100 rounded-b-xl transition-all duration-200",
          isOpen ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <ol className="py-4 px-2 gap-2 grid grid-cols-2">
          {NavLinks.map((nav) => (
            <li key={nav.name}>
              <Link
                href={nav.link}
                className={clsx(
                  "px-2 py-4 rounded-xl font-bold shadow-sm text-base text-center tracking-wide block",
                  isCurrentPath(nav.link)
                    ? "text-white bg-red-400"
                    : "text-slate-700 bg-white/70"
                )}
                onClick={() => {
                  switchMenu(false);
                }}
              >
                {t(nav.name)}
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
