import type { CapWidget as CapWidgetElement } from "@cap.js/widget";
import { useTranslation } from "next-i18next/pages";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const CAP_WASM_URL = "https://cap.furrycons.cn/assets/cap_wasm_bg.wasm";
const CAP_HASHWX_URL = "https://cap.furrycons.cn/assets/hashwx.wasm";

let capWidgetLoadPromise: Promise<unknown> | null = null;

function loadCapWidget() {
  if (typeof window === "undefined") return;
  window.CAP_CUSTOM_WASM_URL = CAP_WASM_URL;
  window.CAP_CUSTOM_HASHWX_URL = CAP_HASHWX_URL;
  if (!capWidgetLoadPromise) {
    capWidgetLoadPromise = import("@cap.js/widget").catch((error) => {
      capWidgetLoadPromise = null;
      throw error;
    });
  }
}

export interface CapWidgetProps {
  apiEndpoint: string;
  onSolve?: (token: string) => void;
  onProgress?: (progress: number) => void;
  onCapError?: (message: string) => void;
  className?: string;
}

export interface CapWidgetRef {
  reset: () => void;
}

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "cap-widget": React.DetailedHTMLProps<
        React.HTMLAttributes<CapWidgetElement> & {
          "data-cap-api-endpoint"?: string;
          "data-cap-i18n-initial-state"?: string;
          "data-cap-i18n-verifying-label"?: string;
          "data-cap-i18n-solved-label"?: string;
          "data-cap-i18n-error-label"?: string;
          "data-cap-i18n-troubleshooting-label"?: string;
          "data-cap-i18n-wasm-disabled"?: string;
          "data-cap-i18n-verify-aria-label"?: string;
          "data-cap-i18n-verifying-aria-label"?: string;
          "data-cap-i18n-verified-aria-label"?: string;
          "data-cap-i18n-error-aria-label"?: string;
        },
        CapWidgetElement
      >;
    }
  }
}

export const CapWidget = forwardRef<CapWidgetRef, CapWidgetProps>(
  ({ apiEndpoint, onSolve, onProgress, onCapError, className }, ref) => {
    const { t } = useTranslation();
    const widgetRef = useRef<CapWidgetElement>(null);
    const callbacksRef = useRef({ onSolve, onProgress, onCapError });

    useEffect(() => {
      callbacksRef.current = { onSolve, onProgress, onCapError };
    });

    useEffect(() => {
      loadCapWidget();
    }, []);

    useEffect(() => {
      const element = widgetRef.current;
      if (!element) return;

      const handleSolve = (event: Event) => {
        const token = (event as CustomEvent<{ token?: string }>).detail?.token;
        if (token) callbacksRef.current.onSolve?.(token);
      };
      const handleProgress = (event: Event) => {
        const progress = (event as CustomEvent<{ progress?: number }>).detail?.progress;
        if (typeof progress === "number") callbacksRef.current.onProgress?.(progress);
      };
      const handleError = (event: Event) => {
        const message = (event as CustomEvent<{ message?: string }>).detail?.message ?? "";
        callbacksRef.current.onCapError?.(message);
      };

      element.addEventListener("solve", handleSolve);
      element.addEventListener("progress", handleProgress);
      element.addEventListener("error", handleError);

      return () => {
        element.removeEventListener("solve", handleSolve);
        element.removeEventListener("progress", handleProgress);
        element.removeEventListener("error", handleError);
      };
    }, []);

    useImperativeHandle(ref, () => ({
      reset: () => {
        widgetRef.current?.reset();
      },
    }));

    return (
      <cap-widget
        ref={widgetRef}
        className={className}
        data-cap-api-endpoint={apiEndpoint}
        data-cap-i18n-initial-state={t("feedback.captcha.initial")}
        data-cap-i18n-verifying-label={t("feedback.captcha.verifying")}
        data-cap-i18n-solved-label={t("feedback.captcha.solved")}
        data-cap-i18n-error-label={t("feedback.captcha.error")}
        data-cap-i18n-troubleshooting-label={t("feedback.captcha.troubleshooting")}
        data-cap-i18n-wasm-disabled={t("feedback.captcha.wasmDisabled")}
        data-cap-i18n-verify-aria-label={t("feedback.captcha.verifyAria")}
        data-cap-i18n-verifying-aria-label={t("feedback.captcha.verifyingAria")}
        data-cap-i18n-verified-aria-label={t("feedback.captcha.verifiedAria")}
        data-cap-i18n-error-aria-label={t("feedback.captcha.errorAria")}
      />
    );
  },
);

CapWidget.displayName = "CapWidget";
