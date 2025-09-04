import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FaLanguage } from "react-icons/fa6";

export default function LocaleMenu() {
  const [open, setOpen] = useState(false);

  const pathname = usePathname();
  return (
    <div className="relative flex justify-center">
      <button
        type="button"
        className="text-2xl text-gray-600"
        onClick={() => setOpen(!open)}
      >
        <FaLanguage className="align-middle" size={24} />
      </button>
      {open && (
        <div className="absolute top-10 right-0 w-content bg-white shadow rounded-md px-2 py-2">
          <ul className="flex flex-col gap-2">
            <li>
              <Link
                href={pathname}
                locale="zh-Hans"
                className="px-4 py-2 w-full block text-center  hover:bg-gray-100 rounded-md"
                onClick={() => setOpen(false)}
              >
                中文
              </Link>
            </li>
            <li>
              <Link
                href={pathname}
                locale="en"
                className="px-4 py-2 w-full block text-center  hover:bg-gray-100 rounded-md"
                onClick={() => setOpen(false)}
              >
                English
              </Link>
            </li>
            <li>
              <Link
                href={pathname}
                locale="zh-tw"
                className="px-4 py-2 w-full block text-center  hover:bg-gray-100 rounded-md"
                onClick={() => setOpen(false)}
              >
                繁體中文
              </Link>
            </li>
            <li>
              <Link
                href={pathname}
                locale="ru"
                className="px-4 py-2 w-full block text-center  hover:bg-gray-100 rounded-md"
                onClick={() => setOpen(false)}
              >
                Русский
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
