import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import axios from "axios";
import clsx from "clsx";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next/pages";
import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { MdFeedback } from "react-icons/md";
import * as z from "zod/v4";

import { FeedbackAPI } from "@/api/feedback";
import { CapWidget, type CapWidgetRef } from "@/components/FeedbackModal/CapWidget";
import { FEEDBACK_CATEGORIES, type FeedbackCategory, type FeedbackTarget } from "@/types/feedback";
import { CAP_API_ENDPOINT } from "@/utils/env";
import { sendTrack } from "@/utils/track";

const MIN_CONTENT_LENGTH = 5;
const MAX_CONTENT_LENGTH = 2000;
const MAX_EMAIL_LENGTH = 254;
const MAX_TITLE_LENGTH = 200;

const emailSchema = z.email().max(MAX_EMAIL_LENGTH);

function getCleanPagePath(asPath: string): string {
  const withoutHash = asPath.split("#")[0] ?? "";
  const withoutQuery = withoutHash.split("?")[0] ?? "";
  if (!withoutQuery.startsWith("/") || withoutQuery.startsWith("//")) {
    return "/";
  }
  return withoutQuery;
}

function getAcceptLanguage(language: string): string {
  return language.startsWith("zh") ? "zh-CN" : "en";
}

function extractApiErrorMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;
  const data = error.response?.data as { message?: unknown; errors?: Array<{ message?: unknown }> } | undefined;
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }
  const firstValidationMsg = data?.errors?.[0]?.message;
  if (typeof firstValidationMsg === "string" && firstValidationMsg.trim()) {
    return firstValidationMsg;
  }
  return null;
}

export default function FeedbackModal({
  open,
  onClose,
  target,
  pageTitle,
}: {
  open: boolean;
  onClose: () => void;
  target?: FeedbackTarget;
  pageTitle?: string;
}) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const capWidgetRef = useRef<CapWidgetRef>(null);

  const [category, setCategory] = useState<FeedbackCategory>("incorrect_info");
  const [content, setContent] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pagePath = useMemo(() => getCleanPagePath(router.asPath), [router.asPath]);
  const rawPageTitle = pageTitle?.trim() || (typeof document !== "undefined" ? document.title.trim() : "");
  const resolvedPageTitle = rawPageTitle ? rawPageTitle.slice(0, MAX_TITLE_LENGTH) : null;

  const trimmedContent = content.trim();
  const contentLength = trimmedContent.length;

  const resetCaptcha = () => {
    setCaptchaToken("");
    capWidgetRef.current?.reset();
  };

  const resetForm = () => {
    setCategory("incorrect_info");
    setContent("");
    setContactEmail("");
    resetCaptcha();
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    if (contentLength < MIN_CONTENT_LENGTH) {
      toast.error(t("feedback.validation.contentTooShort", { min: MIN_CONTENT_LENGTH }));
      return;
    }
    if (contentLength > MAX_CONTENT_LENGTH) {
      toast.error(t("feedback.validation.contentTooLong", { max: MAX_CONTENT_LENGTH }));
      return;
    }

    const trimmedEmail = contactEmail.trim();
    if (trimmedEmail && !emailSchema.safeParse(trimmedEmail).success) {
      toast.error(t("feedback.validation.invalidEmail"));
      return;
    }

    if (!captchaToken) {
      toast.error(t("feedback.validation.captchaRequired"));
      return;
    }

    setSubmitting(true);
    try {
      await FeedbackAPI.submit(
        {
          category,
          content: trimmedContent,
          contactEmail: trimmedEmail || null,
          page: {
            path: pagePath,
            title: resolvedPageTitle,
          },
          ...(target ? { target } : {}),
          captchaToken,
        },
        getAcceptLanguage(i18n.language),
      );

      sendTrack({
        eventName: "submit-feedback",
        eventValue: { category, targetType: target?.type ?? "page" },
      });
      toast.success(t("feedback.submitSuccess"));
      resetForm();
      onClose();
    } catch (error) {
      resetCaptcha();
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        toast.error(extractApiErrorMessage(error) ?? t("feedback.error.rateLimited"));
      } else {
        toast.error(extractApiErrorMessage(error) ?? t("feedback.error.submitFailed"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm transition-opacity duration-200 data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 overflow-y-auto p-3 sm:p-4">
        <div className="flex min-h-full items-center justify-center">
          <DialogPanel
            transition
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden transition duration-200 data-[closed]:opacity-0 data-[closed]:scale-95"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <MdFeedback className="text-red-400 text-xl shrink-0" aria-hidden />
                <DialogTitle className="text-base sm:text-lg font-bold text-slate-800">
                  {t("feedback.title")}
                </DialogTitle>
              </div>
              <button
                type="button"
                aria-label={t("feedback.close")}
                onClick={handleClose}
                disabled={submitting}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <IoClose className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500 flex items-center gap-2">
                <span className="shrink-0 font-medium text-slate-600">{t("feedback.currentPage")}</span>
                <span className="truncate font-mono text-slate-500" title={pagePath}>
                  {resolvedPageTitle ? `${resolvedPageTitle} (${pagePath})` : pagePath}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t("feedback.categoryLabel")}</label>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("feedback.categoryLabel")}>
                  {FEEDBACK_CATEGORIES.map((item) => {
                    const active = category === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setCategory(item)}
                        className={clsx(
                          "px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors border",
                          active
                            ? "bg-red-400 text-white border-red-400 shadow-sm"
                            : "bg-white text-slate-600 border-gray-200 hover:border-red-300 hover:text-red-400",
                        )}
                      >
                        {t(`feedback.category.${item}`)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="feedback-content" className="text-sm font-medium text-slate-700">
                    {t("feedback.contentLabel")}
                    <span className="text-red-400 ml-0.5">*</span>
                  </label>
                  <span
                    className={clsx(
                      "text-xs tabular-nums",
                      contentLength > MAX_CONTENT_LENGTH ? "text-red-500 font-medium" : "text-slate-400",
                    )}
                  >
                    {contentLength} / {MAX_CONTENT_LENGTH}
                  </span>
                </div>
                <textarea
                  id="feedback-content"
                  rows={4}
                  required
                  minLength={MIN_CONTENT_LENGTH}
                  maxLength={MAX_CONTENT_LENGTH}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t("feedback.contentPlaceholder")}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 resize-y"
                />
              </div>

              <div>
                <label htmlFor="feedback-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t("feedback.emailLabel")}
                  <span className="text-xs font-normal text-slate-400 ml-1.5">({t("feedback.optional")})</span>
                </label>
                <input
                  id="feedback-email"
                  type="email"
                  maxLength={MAX_EMAIL_LENGTH}
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder={t("feedback.emailPlaceholder")}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div>
                <CapWidget
                  ref={capWidgetRef}
                  apiEndpoint={CAP_API_ENDPOINT}
                  onSolve={(token) => setCaptchaToken(token)}
                  onCapError={() => {
                    setCaptchaToken("");
                    toast.error(t("feedback.error.captchaFailed"));
                  }}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {t("feedback.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submitting || !captchaToken || contentLength < MIN_CONTENT_LENGTH}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-red-400 hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? t("feedback.submitting") : t("feedback.submit")}
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
