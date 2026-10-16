
import axios from "axios";

// Centraliza a configuração das requisições HTTP ao backend.
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
  timeout: 10000,
});

export default api;
