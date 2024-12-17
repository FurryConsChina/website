import { useRouter } from "next/router";

export const useCurrentPath = () => {
  const { pathname } = useRouter();

  const isCurrentPath = (path: string, includeChild = false) => {
    if (includeChild) {
      return pathname.includes(path);
    }
    return pathname === path;
  };

  return { pathname, isCurrentPath };
};
