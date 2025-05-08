import ky from "ky";
import wretch from "wretch";
import QueryStringAddon from "wretch/addons/queryString";

wretch.options({ mode: "cors" });

const HOST = "https://api.furryeventchina.com";

const wfetch = wretch(HOST, { cache: "default" })
  .auth(`${process.env.FEC_API_TOKEN}`)
  .addon(QueryStringAddon);

export const API = ky.create({
  headers: {
    Authorization: process.env.FEC_API_TOKEN,
  },
  prefixUrl: HOST,
});

export default wfetch;
