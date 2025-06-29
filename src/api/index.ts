import ky from "ky";

const HOST = "https://api.furrycons.cn";

export const API = ky.create({
  headers: {
    Authorization: process.env.FEC_API_TOKEN,
  },
  prefixUrl: HOST,
  mode: "cors",
  cache: "default",
});

export default API;
