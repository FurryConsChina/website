import Image from "@/components/image";
import clsx from "clsx";

import styles from "./index.module.css";
import { sendTrack } from "@/utils/track";

export default function SponsorBanner() {
  return (
    <div className="relative rounded-xl h-auto md:h-[300px] mb-6 group w-full">
      <a
        href="https://www.furrychina.com/?utm_source=fcc"
        target="_blank"
        onClick={() => {
          sendTrack({
            eventName: "sponsor_banner_click",
            eventValue: {
              sponsor_name: "furrychina_2026_aug_shanghai_con",
            },
          });
        }}
      >
        <Image
          autoFormat
          quality={100}
          className={clsx("rounded-xl md:h-[300px] h-auto w-full object-fill md:object-cover", styles.sponsorBanner)}
          containerClassName="w-full"
          src="organizations/furrychina/2026-aug-shanghai-con/home-banner.png"
          alt="Sponsor Banner"
        />
        <span className="absolute top-2 right-2 bg-[#914639] text-white text-xs md:text-sm px-1 rounded md:top-4 md:right-4">
          推荐
        </span>
        <div className="absolute bottom-0 right-0 pr-2 pb-2 rounded-xl flex items-end flex-col md:pr-4 md:pb-4">
          <h3 className="text-base font-bold md:text-3xl text-white drop-shadow-md bg-[#914639] mb-2 text-right px-1 rounded">
            极兽聚2026
          </h3>
          <p className="text-white text-sm md:text-lg bg-[#914639] px-1 rounded">
            2026年8月2日 上海世贸展馆
          </p>
        </div>
      </a>
    </div>
  );
}
