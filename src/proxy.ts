import { NextRequest, NextResponse } from "next/server";

const redirectData: Record<string, { destination: string; permanent: boolean }> = {
  "/UTFG": {
    destination: "/utfg",
    permanent: true,
  },
  "/furryCMF": {
    destination: "/furrycmf",
    permanent: true,
  },
  "/FCC": {
    destination: "/fcc",
    permanent: true,
  },
  "/Furrybarqiwuzhi": {
    destination: "/furrybarqiwuzhi",
    permanent: true,
  },
  "/Dreams": {
    destination: "/dreams",
    permanent: true,
  },
  "/ssj": {
    destination: "/hbf",
    permanent: true,
  },
};

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const locale = request.nextUrl.locale;

  const exactMatch = redirectData[pathname];
  if (exactMatch) {
    return NextResponse.redirect(
      new URL(
        locale === "en"
          ? "/en" + exactMatch.destination
          : exactMatch.destination,
        request.url
      ),
      exactMatch.permanent ? 308 : 307
    );
  }

  // 2. 进行动态 slug 匹配（/:org/:slug 格式）
  // 提取路径的第一部分（组织名）
  const pathSegments = pathname.split("/").filter(Boolean);
  if (pathSegments.length >= 2) {
    const orgPath = "/" + pathSegments[0];
    const redirectEntry = redirectData[orgPath];
    
    if (redirectEntry) {
      // 提取 slug 部分（路径的第二部分及之后的所有部分）
      const slug = pathSegments.slice(1).join("/");
      if (slug) {
        const destination = `${redirectEntry.destination}/${slug}`;
        return NextResponse.redirect(
          new URL(
            locale === "en" ? "/en" + destination : destination,
            request.url
          ),
          308
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude API routes, static files, image optimizations, and .png files
    "/((?!api|_next/static|_next/image|.*\\.png$).*)",
  ],
};
