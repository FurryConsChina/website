import clsx from "clsx";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import SliderStyle from "./index.module.css";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

const IS_CN_REGION = process.env.NEXT_PUBLIC_REGION === "CN";

function AnnouncementSlider() {
  const router = useRouter();
  const asPath = router.asPath;
  const [emblaRef] = useEmblaCarousel({ loop: true, align: "start" }, [Autoplay({ delay: 3000 })]);

  const defaultSliderClass =
    "px-3.5 py-2.5 md:px-4 md:py-4 bg-white shadow-sm rounded-xl text-red-400 text-xs sm:text-sm md:text-base leading-relaxed";
  return (
    <div className="overflow-hidden mt-2.5 md:mt-0 mb-3 md:mb-6 mx-2.5 sm:mx-4 xl:mx-0" ref={emblaRef}>
      <div className="embla__container flex">
        <div
          className={clsx(
            SliderStyle.embla__slide,
            defaultSliderClass,
            !IS_CN_REGION && "ml-4",
            IS_CN_REGION && "basis-full",
          )}
        >
          有任何建议和反馈，请加入我们的QQ群聊
          <a target="_blank" href="https://qm.qq.com/q/yIpHnyHg5y" className="underline cursor-pointer font-bold mx-1">
            {`630572929 (点我加入)`}
          </a>
          直抒胸臆！或者点
          <span
            className="underline cursor-pointer mx-1 font-bold"
            onClick={() => {
              navigator.clipboard.writeText("630572929").then(() => toast.success("🥳 复制成功，快去QQ加群吧"));
            }}
          >
            这里
          </span>
          复制群号。
        </div>
      </div>
    </div>
  );
}

export default AnnouncementSlider;
