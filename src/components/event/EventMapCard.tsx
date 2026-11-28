import { parseCoordinates } from "@/utils/coordinate";
import clsx from "clsx";
import Script from "next/script";
import { useTranslation } from "next-i18next/pages";
import { useCallback, useEffect, useRef, useState } from "react";
import { VscLoading } from "react-icons/vsc";
import { sendTrack } from "@/utils/track";

const MapLoadingStatus = {
  Idle: "idle",
  Loading: "loading",
  Finished: "finished",
  Error: "error",
} as const;

type MapLoadingStatusType = (typeof MapLoadingStatus)[keyof typeof MapLoadingStatus];

type EventMapCardProps = {
  latitude?: number | null;
  longitude?: number | null;
  embedded?: boolean;
};

export default function EventMapCard(props: EventMapCardProps) {
  const { t } = useTranslation();
  const { latitude, longitude, isValid } = parseCoordinates(props.latitude, props.longitude);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<TMapMapInstance | null>(null);
  const hasInitializedRef = useRef(false);
  const [scriptReloadKey, setScriptReloadKey] = useState(0);
  const [mapLoadingStatus, setMapLoadingStatus] = useState<MapLoadingStatusType>(() => {
    if (isValid) {
      return MapLoadingStatus.Loading;
    }
    return MapLoadingStatus.Idle;
  });

  const initMap = useCallback(() => {
    if (
      !window.TMap ||
      !isValid ||
      !mapContainerRef.current ||
      mapContainerRef.current.offsetWidth === 0 ||
      hasInitializedRef.current
    ) {
      return;
    }

    setMapLoadingStatus(MapLoadingStatus.Loading);

    try {
      const center = new window.TMap.LatLng(latitude, longitude);
      const map = new window.TMap.Map(mapContainerRef.current, {
        center,
        zoom: 17.2,
        pitch: 43.5,
        rotation: 45,
      });

      mapInstanceRef.current = map;
      hasInitializedRef.current = true;

      map.on("tilesloaded", () => {
        setMapLoadingStatus(MapLoadingStatus.Finished);
      });

      new window.TMap.MultiMarker({
        id: "marker-layer",
        map,
        styles: {
          marker: new window.TMap.MarkerStyle({
            width: 25,
            height: 35,
            anchor: { x: 16, y: 32 },
          }),
        },
        geometries: [
          {
            id: "event-location-marker",
            styleId: "marker",
            position: center,
            properties: {
              title: "marker",
            },
          },
        ],
      });
    } catch (error) {
      console.error(error);
      setMapLoadingStatus(MapLoadingStatus.Error);
    }
  }, [isValid, latitude, longitude]);

  useEffect(() => {
    if (window.TMap) {
      queueMicrotask(initMap);
    }

    const container = mapContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      if (container.offsetWidth > 0 && window.TMap && !hasInitializedRef.current) {
        initMap();
      }
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      mapInstanceRef.current?.destroy?.();
      mapInstanceRef.current = null;
      hasInitializedRef.current = false;
    };
  }, [initMap]);

  const handleRetryLoadMap = useCallback(() => {
    hasInitializedRef.current = false;

    setMapLoadingStatus(MapLoadingStatus.Loading);

    if (window.TMap) {
      queueMicrotask(initMap);
      return;
    }

    setScriptReloadKey((value) => value + 1);
  }, [initMap]);

  if (!isValid) {
    return null;
  }

  return (
    <>
      <Script
        key={scriptReloadKey}
        src="https://map.qq.com/api/gljs?v=1.exp&key=PXEBZ-QLM6C-RZX2K-AV2XX-SBBW5-VGFC4"
        strategy="lazyOnload"
        onReady={initMap}
        onError={() => setMapLoadingStatus(MapLoadingStatus.Error)}
      />

      <div
        className={clsx(
          "relative z-0 overflow-hidden",
          !props.embedded && "my-3 sm:my-4 bg-white shadow-sm rounded-xl",
        )}
      >
        {!props.embedded && (
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 mx-4 mt-3.5 sm:m-4">{t("event.map")}</h3>
        )}

        <div
          ref={mapContainerRef}
          className={clsx(
            "h-[240px] sm:h-[340px] md:h-[450px] overflow-hidden rounded-xl sm:rounded-2xl relative",
            props.embedded ? "mx-4 mt-4 mb-3" : "mx-3 my-2.5 sm:m-4",
          )}
        >
          <div
            className={clsx(
              "absolute inset-0 bg-gray-100/70 flex justify-center overflow-hidden transition duration-300",
              mapLoadingStatus === MapLoadingStatus.Loading && "h-full",
              mapLoadingStatus !== MapLoadingStatus.Loading && "h-0",
            )}
          >
            <div className="flex items-center z-10">
              <span className="animate-spin mr-2">
                <VscLoading className="text-base" />
              </span>
              <span className="text-gray-600">{t("event.mapLoading")}</span>
            </div>
          </div>

          {mapLoadingStatus === MapLoadingStatus.Error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-100/80 px-6 text-center">
              <p className="text-gray-600">{t("event.mapLoadFailed")}</p>
              <button
                type="button"
                onClick={handleRetryLoadMap}
                className="px-4 py-2 border border-gray-300 text-sm rounded text-gray-700 hover:text-gray-900 hover:border-gray-400 transition duration-300 bg-white"
              >
                {t("event.retryLoadMap")}
              </button>
            </div>
          )}
        </div>

        <div className={clsx("flex items-center", props.embedded ? "mb-4 px-4" : "mt-2 mb-3.5 sm:mb-4 px-3 sm:px-4")}>
          <a
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              sendTrack({
                eventName: "click-event-map-gaode",
                eventValue: {
                  longitude,
                  latitude,
                },
              });
            }}
            href={`https://uri.amap.com/marker?position=${longitude},${latitude}`}
            className="w-full sm:w-auto text-center px-3 py-2 border border-gray-300 text-sm rounded-lg sm:rounded text-gray-700 hover:text-gray-900 hover:border-gray-400 active:bg-gray-50 transition duration-300"
          >
            {t("event.gotoGaoDe")}
          </a>
        </div>
      </div>
    </>
  );
}
