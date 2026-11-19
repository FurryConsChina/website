import axios from "axios";

const API = axios.create({
  baseURL: process.env.FEC_API_URL,
  timeout: 10000,
  headers: {
    Authorization: process.env.FEC_API_TOKEN,
  },
});

export default API;
