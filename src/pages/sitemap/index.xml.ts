import { GetServerSidePropsContext } from "next";

const URL = process.env.NEXT_PUBLIC_WEBSITE_URL;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<sitemap><loc>https://${URL}/sitemap/static.xml</loc></sitemap>
<sitemap><loc>https://${URL}/sitemap/convention.xml</loc></sitemap>
<sitemap><loc>https://${URL}/sitemap/organization.xml</loc></sitemap>
</sitemapindex>`;

// <sitemap><loc>${URL}/sitemap/city.xml</loc></sitemap>
// <sitemap><loc>${URL}/sitemap/year.xml</loc></sitemap>

function SiteMap() {}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { res } = context;

  res.setHeader("Content-Type", "text/xml");

  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;
