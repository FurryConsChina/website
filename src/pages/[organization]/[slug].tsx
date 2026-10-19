import { EventsAPI } from "@/api/events";
import { formatLocale } from "@/utils/locale";
import { getEventDetailUrl } from "@/utils/url";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import * as z from "zod/v4";

export default function LegacyEventDetail() {
  return null;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  context.res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=300");

  const params = z
    .object({
      slug: z.string().min(1).regex(/^[a-zA-Z0-9-]+$/),
      organization: z.string().min(1).regex(/^[a-zA-Z0-9-]+$/),
    })
    .safeParse(context.params);

  if (!params.success) {
    return { notFound: true };
  }

  try {
    const event = await EventsAPI.getEventDetail(params.data);
    return {
      redirect: {
        destination: getEventDetailUrl({
          urlKey: event.urlKey,
          locale: formatLocale(context.locale),
        }),
        statusCode: 301,
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { notFound: true };
    }
    throw error;
  }
}
