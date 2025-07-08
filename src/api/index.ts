import axios from "axios";

const HOST = "http://localhost:8787";

const API = axios.create({
  baseURL: HOST,
  headers: {
    Authorization: process.env.FEC_API_TOKEN,
  },
});

export default API;
