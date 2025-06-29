import { eventsAPI } from "@/api/events";
import { GetServerSidePropsContext } from "next";

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

  const events = await eventsAPI.getSitemapEvents();

  const sitemap = generateSiteMap(events);

  res.setHeader("Content-Type", "text/xml");

  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;
