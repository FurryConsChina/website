import axios from "axios";

const HOST =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8787"
    : "https://api.furrycons.cn";

const API = axios.create({
  baseURL: HOST,
  headers: {
    Authorization: process.env.FEC_API_TOKEN,
  },
});

export default API;
