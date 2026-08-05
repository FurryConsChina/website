import { Children, useCallback, useEffect, useRef, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import clsx from "clsx";

import Image from "@/components/image";
import { sendTrack } from "@/utils/track";

import styles from "./index.module.css";

const sponsorSlides = [
  <a
    key="lifurry_2026_aug_shanghai_con"
    className="relative block h-auto md:h-[300px]"
    href="https://market.ciyuanxiang.com/?utm_source=fcc"
    target="_blank"
    rel="noreferrer"
    onClick={() => {
      sendTrack({
        eventName: "sponsor_banner_click",
        eventValue: {
          sponsor_name: "lifurry_2026_aug_shanghai_con",
        },
      });
    }}
  >
    <Image
      autoFormat
      priority
      quality={100}
      className={clsx("h-auto w-full object-fill md:h-[300px] md:object-cover", styles.sponsorBanner)}
      containerClassName="block w-full"
      src="organizations/lifurry/2026-oct-shanghai-con/20260721-162046.jpg"
      alt="理想城2026"
    />
    <span className="absolute right-2 top-2 rounded bg-[#4b2122] px-1 text-xs text-white md:right-4 md:top-4 md:text-sm">
      推荐
    </span>
  </a>,
];

export default function SponsorBanner() {
  const autoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [autoplay.current]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  const syncCarouselState = useCallback(() => {
    if (!emblaApi) {
      return;
    }

    setSelectedIndex(emblaApi.selectedScrollSnap());
    setSlideCount(emblaApi.scrollSnapList().length);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    syncCarouselState();
    emblaApi.on("select", syncCarouselState).on("reInit", syncCarouselState);

    return () => {
      emblaApi.off("select", syncCarouselState).off("reInit", syncCarouselState);
    };
  }, [emblaApi, syncCarouselState]);

  return (
    <section aria-label="推荐活动" className="relative mb-6 w-full overflow-hidden rounded-xl group">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {Children.map(sponsorSlides, (slide) => (
            <div className={styles.slide}>{slide}</div>
          ))}
        </div>
      </div>

      {slideCount > 1 && (
        <>
          <button
            type="button"
            aria-label="上一张推荐活动"
            className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60 focus-visible:block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white group-hover:block md:left-4"
            onClick={() => emblaApi?.scrollPrev()}
          >
            <IoIosArrowBack aria-hidden className="size-5 md:size-6" />
          </button>
          <button
            type="button"
            aria-label="下一张推荐活动"
            className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60 focus-visible:block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white group-hover:block md:right-4"
            onClick={() => emblaApi?.scrollNext()}
          >
            <IoIosArrowForward aria-hidden className="size-5 md:size-6" />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2 md:bottom-4">
            {Array.from({ length: slideCount }, (_, index) => (
              <button
                type="button"
                key={index}
                aria-label={`切换到第 ${index + 1} 张推荐活动`}
                aria-current={index === selectedIndex ? "true" : undefined}
                className={clsx(
                  "size-2.5 rounded-full border border-white shadow transition-colors",
                  index === selectedIndex ? "bg-white" : "bg-black/30 hover:bg-white/70",
                )}
                onClick={() => emblaApi?.scrollTo(index)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
