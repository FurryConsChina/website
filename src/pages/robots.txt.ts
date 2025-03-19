import { GetServerSidePropsContext } from "next";

const URL = process.env.NEXT_PUBLIC_WEBSITE_URL;

const sitemap = `# *
User-agent: *
Allow: /

# Host
Host: https://${URL}

# Sitemaps
Sitemap: https://${URL}/sitemap/index.xml`;

function Robots() {}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { res } = context;

  res.setHeader("Content-Type", "text/plain");

  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default Robots;
