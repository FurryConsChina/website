import clsx from "clsx";
import Link, { type LinkProps } from "next/link";
import { useTranslation } from "next-i18next/pages";
import { Fragment } from "react";
import { HiChevronLeft, HiChevronRight, HiDotsHorizontal } from "react-icons/hi";

export default function Pagination({
  current,
  totalPages,
  getPageHref,
  className,
}: {
  current: number;
  totalPages: number;
  getPageHref: (page: number) => LinkProps["href"];
  className?: string;
}) {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  const startPage = Math.max(2, Math.min(current - 1, totalPages - 3));
  const endPage = Math.min(totalPages - 1, Math.max(current + 1, 4));
  const pageNumbers =
    totalPages <= 7
      ? Array.from({ length: totalPages }, (_, index) => index + 1)
      : [1, ...Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index), totalPages];

  return (
    <nav aria-label={t("pagination.label")} className={clsx("flex justify-center", className)}>
      <ul className="flex flex-wrap items-center justify-center gap-1">
        <li>
          <Link
            href={getPageHref(Math.max(1, current - 1))}
            rel="prev"
            aria-label={t("pagination.previousPage")}
            aria-disabled={current === 1}
            tabIndex={current === 1 ? -1 : undefined}
            className="inline-flex h-9 w-9 items-center justify-center gap-1 rounded-md text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 aria-disabled:pointer-events-none aria-disabled:opacity-50 sm:w-auto sm:pl-2.5 sm:pr-3"
          >
            <HiChevronLeft aria-hidden="true" className="size-4" />
            <span className="hidden sm:inline">{t("pagination.previousPage")}</span>
          </Link>
        </li>
        {pageNumbers.map((page, index) => (
          <Fragment key={page}>
            {index > 0 && page - pageNumbers[index - 1] > 1 && (
              <li aria-hidden="true" className="flex size-9 items-center justify-center text-slate-500">
                <HiDotsHorizontal className="size-4" />
              </li>
            )}
            <li>
              <Link
                href={getPageHref(page)}
                aria-label={t("pagination.pageCounter", { current: page, total: totalPages })}
                aria-current={page === current ? "page" : undefined}
                className={clsx(
                  "inline-flex size-9 items-center justify-center rounded-md text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
                  page === current && "border border-slate-200 bg-white shadow-sm hover:bg-slate-50",
                )}
              >
                {page}
              </Link>
            </li>
          </Fragment>
        ))}
        <li>
          <Link
            href={getPageHref(Math.min(current + 1, totalPages))}
            rel="next"
            aria-label={t("pagination.nextPage")}
            aria-disabled={current === totalPages}
            tabIndex={current === totalPages ? -1 : undefined}
            className="inline-flex h-9 w-9 items-center justify-center gap-1 rounded-md text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 aria-disabled:pointer-events-none aria-disabled:opacity-50 sm:w-auto sm:pl-3 sm:pr-2.5"
          >
            <span className="hidden sm:inline">{t("pagination.nextPage")}</span>
            <HiChevronRight aria-hidden="true" className="size-4" />
          </Link>
        </li>
      </ul>
    </nav>
  );
}
