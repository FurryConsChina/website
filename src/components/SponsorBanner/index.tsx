import Image from "@/components/image";
import clsx from "clsx";

import styles from "./index.module.css";
import { sendTrack } from "@/utils/track";

export default function SponsorBanner() {
  return (
    <div className="relative rounded-xl h-[150px] sm:h-[300px] mb-6 group w-full">
      <a
        href="https://www.furrychina.com/?utm_source=fcc"
        target="_blank"
        onClick={() => {
          sendTrack({
            eventName: "sponsor_banner_click",
            eventValue: {
              sponsor_name: "furrychina_2025_dec_shanghai_con",
            },
          });
        }}
      >
        <Image
          autoFormat
          quality={100}
          className={clsx("rounded-xl h-[150px] sm:h-[300px] w-full object-cover", styles.sponsorBanner)}
          containerClassName="w-full"
          src="organizations/furrychina/2025-dec-shanghai-con/home_banner.jpg"
          alt="Sponsor Banner"
        />
        <span className="absolute top-2 right-2 bg-[#76b578] text-white text-xs md:text-sm px-1 rounded md:top-4 md:right-4">
          推荐
        </span>
        <div className="absolute bottom-0 right-0 pr-2 pb-2 rounded-xl flex items-end flex-col md:pr-4 md:pb-4">
          <h3 className="text-2xl font-bold md:text-3xl text-white drop-shadow-md bg-[#76b578] mb-2 text-right px-1 rounded">
            冬兽聚2025
          </h3>
          <p className="text-white text-base md:text-lg bg-[#76b578] px-1 rounded">
            2025年12月19日 上海夏阳湖皇冠假日酒店
          </p>
        </div>
      </a>
    </div>
  );
}
