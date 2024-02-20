import axios from "axios";

const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN || "localhost";
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT || 3333;

export const api = axios.create({
  baseURL: `http://${SERVER_DOMAIN}:${SERVER_PORT}`,
  withCredentials: true,
});
