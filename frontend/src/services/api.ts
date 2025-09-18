import axios from "axios";

interface ImportMeta {
  env: {
    VITE_API_URL?: string;
  };
}

declare global {
  interface ImportMeta {
    env: {
      VITE_API_URL?: string;
    };
  }
}

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" }
});

export const setToken = (token: string | null) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

export default API;
