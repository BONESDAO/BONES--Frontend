import axios from "axios";

const request = axios.create({
  withCredentials: true,
  baseURL: "https://xxxxx/api",
  timeout: 6000,
  headers: {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"}
});

export default request;
