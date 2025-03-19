import { GetServerSidePropsContext } from "next";

const URL = process.env.NEXT_PUBLIC_WEBSITE_URL;

const currentSupportedLanguages = ["", "/en"];

const currentStaticPages = ["", "/city", "/years", "/organization"];

function generateSiteMap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${currentStaticPages
       .map((page: string) => {
         return currentSupportedLanguages
           .map((lang: string) => {
             return `
          <url>
              <loc>${`https://${URL}${lang}${page}`}</loc>
              <lastmod>${new Date().toISOString()}</lastmod>
              <changefreq>daily</changefreq>
              <priority>0.7</priority>
          </url>`;
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

  const sitemap = generateSiteMap();

  res.setHeader("Content-Type", "text/xml");

  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;
