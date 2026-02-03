import { ImageLoaderProps } from "next/image";

const GLOBAL_AUTO_CDN_IMAGE_URL = "images.furrycons.cn";
const GLOBAL_MANUAL_CDN_IMAGE_URL = "images.furryeventchina.com";

export const getEventCoverImgPath = (event: {
  thumbnail?: string | null;
  media?: { images?: { url: string }[] } | null;
}) => {
  return (
    event.thumbnail ||
    event.media?.images?.[0].url ||
    `fec-event-default-cover.png`
  );
};

export const imageUrl = (src: string) => {
  return `https://${GLOBAL_AUTO_CDN_IMAGE_URL}/${src}`;
};

const imageLoader = ({
  src,
  width,
  height,
  quality,
  avif,
  webp,
}: Pick<ImageLoaderProps, "src" | "quality"> & {
  avif?: boolean;
  webp?: boolean;
  width?: number;
  height?: number;
}) => {
  const imageURLHost = `https://${GLOBAL_AUTO_CDN_IMAGE_URL}`;
  const imageURL = src.startsWith("http") ? new URL(src) : new URL(`${imageURLHost}/${src}`);

  width !== undefined && imageURL.searchParams.set("w", width.toString());
  height !== undefined && imageURL.searchParams.set("h", height.toString());

  // 暂时关闭质量压缩
  // imageURL.searchParams.set(
  //   "q",
  //   quality === undefined ? "75" : quality.toString()
  // );
  avif && imageURL.searchParams.set("f", "avif");
  webp && imageURL.searchParams.set("f", "webp");

  return imageURL.toString();
};

export default imageLoader;
