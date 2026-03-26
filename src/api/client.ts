import axios from "axios";

const TOKEN_KEY = "hub32_token";

const client = axios.create({
    baseURL: import.meta.env.VITE_MOCK_API === "true"
        ? ""
        : (import.meta.env.VITE_API_URL as string),
    timeout: 10_000,
    headers: {
        "Content-Type": "application/json",
    },
});

// ---- Request: attach JWT Bearer token ----
client.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ---- Response: handle 401 → clear token → redirect /login ----
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            window.location.href = "/login";
        }
        return Promise.reject(error);
    },
);

export { TOKEN_KEY };
export default client;
