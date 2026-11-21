import type { GetServerSidePropsContext } from "next";

import YearsView from "@/components/YearsView";
import { getYearsPageProps } from "@/utils/yearsProps";

export default YearsView;

export async function getServerSideProps({ locale, res }: GetServerSidePropsContext) {
  return getYearsPageProps({ locale, res });
}
