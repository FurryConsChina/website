import type { GetServerSidePropsContext } from "next";

import YearsView from "@/components/YearsView";
import { getYearsPageProps } from "@/utils/yearsProps";

export default YearsView;

export async function getServerSideProps({ locale, params, res }: GetServerSidePropsContext) {
  const requestedYear = Array.isArray(params?.year) ? params.year[0] : params?.year;
  return getYearsPageProps({ locale, res, requestedYear });
}
