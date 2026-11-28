import type { FeedbackTarget } from "@/types/feedback";
import { sendTrack } from "@/utils/track";
import clsx from "clsx";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next/pages";
import { useState } from "react";
import { FaArrowUp, FaHome } from "react-icons/fa";
import { MdFeedback } from "react-icons/md";

const FeedbackModal = dynamic(() => import("@/components/FeedbackModal"), { ssr: false });

const buttonCls = clsx(
  "bg-white/95 backdrop-blur-sm p-3 text-slate-700 text-lg hover:text-red-400 active:bg-gray-100 transition-colors",
  "lg:p-4",
);
function Sidebar({ feedbackTarget, pageTitle }: { feedbackTarget?: FeedbackTarget; pageTitle?: string }) {
  const router = useRouter();
  const { t } = useTranslation();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <>
      <aside
        className={clsx(
          "fixed",
          "flex flex-col divide-y shadow-md overflow-hidden z-20",
          "lg:right-0 lg:top-1/2 lg:bottom-auto lg:-translate-y-1/2 lg:rounded-l-lg lg:rounded-none",
          "right-3 bottom-4 rounded-xl",
        )}
      >
        <button
          type="button"
          aria-label={t("sidebar.backToTop")}
          title={t("sidebar.backToTop")}
          className={clsx(buttonCls)}
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            sendTrack({
              eventName: "click-sidebar",
              eventValue: { "click-position": "back-top" },
            });
          }}
        >
          <FaArrowUp />
        </button>

        {router.pathname !== "/" && (
          <Link
            aria-label={t("sidebar.backHome")}
            title={t("sidebar.backHome")}
            className={clsx(buttonCls)}
            href="/"
            onClick={() => {
              sendTrack({
                eventName: "click-sidebar",
                eventValue: { "click-position": "back-home" },
              });
            }}
          >
            <FaHome />
          </Link>
        )}

        <button
          type="button"
          aria-label={t("feedback.title")}
          title={t("feedback.title")}
          className={clsx(buttonCls)}
          onClick={() => {
            setFeedbackOpen(true);
            sendTrack({
              eventName: "click-sidebar",
              eventValue: { "click-position": "feedback" },
            });
          }}
        >
          <MdFeedback />
        </button>
      </aside>

      {feedbackOpen && (
        <FeedbackModal
          open={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          target={feedbackTarget}
          pageTitle={pageTitle}
        />
      )}
    </>
  );
}

export default Sidebar;
