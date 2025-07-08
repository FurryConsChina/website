import axios from "axios";

const HOST = "https://api.furrycons.cn";

const API = axios.create({
  baseURL: HOST,
  headers: {
    Authorization: process.env.FEC_API_TOKEN,
  },
});

export default API;
