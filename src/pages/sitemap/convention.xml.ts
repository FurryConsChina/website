import wfetch from "@/api";
import { GetServerSidePropsContext } from "next";
import { z } from "zod";

const URL = process.env.NEXT_PUBLIC_WEBSITE_URL;

const currentSupportedLanguages = ["", "/en"];

function generateSiteMap(cons: any) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${cons
       .map((con: any) => {
         return currentSupportedLanguages
           .map((lang: string) => {
             return `
          <url>
              <loc>${`https://${URL}${lang}/${con.organization.slug}/${con.slug}`}</loc>
              <lastmod>${new Date().toISOString()}</lastmod>
              <changefreq>weekly</changefreq>
              <priority>0.7</priority>
          </url>
        `;
           })
           .join("");
       })
       .join("")}
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { res } = context;

  const events = await wfetch.get("/event/all").json();

  const parseEventResult = z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        addressExtra: z.object({ city: z.string().nullable() }).nullable(),
        startAt: z.string().datetime().nullable(),
        endAt: z.string().datetime().nullable(),
        organization: z.object({
          name: z.string(),
          slug: z.string(),
        }),
      })
    )
    .safeParse(events);

  const validEvents = parseEventResult.data;
  const sitemap = generateSiteMap(validEvents);

  res.setHeader("Content-Type", "text/xml");

  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;
