import { parseCoordinates } from "@/utils/coordinate";
import clsx from "clsx";
import Script from "next/script";
import { useTranslation } from "next-i18next/pages";
import { useCallback, useEffect, useRef, useState } from "react";
import { VscLoading } from "react-icons/vsc";

const MapLoadingStatus = {
  Idle: "idle",
  Loading: "loading",
  Finished: "finished",
  Error: "error",
} as const;

type MapLoadingStatusType = (typeof MapLoadingStatus)[keyof typeof MapLoadingStatus];

type EventMapCardProps = {
  latitudeText?: string | null;
  longitudeText?: string | null;
};

export default function EventMapCard({ latitudeText, longitudeText }: EventMapCardProps) {
  const { t } = useTranslation();
  const { latitude, longitude, isValid } = parseCoordinates(latitudeText, longitudeText);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const hasInitializedRef = useRef(false);
  const [mapLoadingStatus, setMapLoadingStatus] = useState<MapLoadingStatusType>(() => {
    if (isValid) {
      return MapLoadingStatus.Loading;
    }
    return MapLoadingStatus.Idle;
  });

  const initMap = useCallback(() => {
    if (!window.TMap || !isValid || !mapContainerRef.current || hasInitializedRef.current) {
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
  }, [initMap]);

  if (!isValid) {
    return null;
  }

  return (
    <>
      <Script
        src="https://map.qq.com/api/gljs?v=1.exp&key=PXEBZ-QLM6C-RZX2K-AV2XX-SBBW5-VGFC4"
        strategy="lazyOnload"
        onReady={initMap}
      />

      <div className="my-4 bg-white rounded-xl overflow-hidden relative">
        <h3 className="text-xl text-gray-600 m-4">{t("event.map")}</h3>

        <div ref={mapContainerRef} className="h-[450px] overflow-hidden rounded-2xl m-4 relative">
          <div
            className={clsx(
              "absolute w-full bg-gray-100/70 top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 flex justify-center overflow-hidden transition duration-300",
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
        </div>

        <div className="flex items-center mt-2 mb-4 px-4">
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://uri.amap.com/marker?position=${longitude},${latitude}`}
            className="px-2 py-2 border border-gray-300 text-sm rounded text-gray-700 hover:text-gray-900 hover:border-gray-400 transition duration-300"
          >
            {t("event.gotoGaoDe")}
          </a>
        </div>
      </div>
    </>
  );
}
