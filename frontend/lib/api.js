const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("acn_token");
}

export function setToken(token) {
  if (typeof window !== "undefined") localStorage.setItem("acn_token", token);
}

export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem("acn_token");
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("acn_user");
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user) {
  if (typeof window !== "undefined") localStorage.setItem("acn_user", JSON.stringify(user));
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    const message = data?.message || data?.errors?.[0]?.msg || "Something went wrong";
    throw new Error(message);
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload, auth: false }),
  me: () => request("/auth/me"),

  createPolicy: (payload) => request("/insurance", { method: "POST", body: payload }),
  listPolicies: () => request("/insurance"),
  deletePolicy: (id) => request(`/insurance/${id}`, { method: "DELETE" }),

  listHospitals: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/hospitals${qs ? `?${qs}` : ""}`, { auth: false });
  },
  matchHospitals: (payload) => request("/hospitals/match", { method: "POST", body: payload }),

  createJourney: (payload) => request("/journeys", { method: "POST", body: payload }),
  listJourneys: () => request("/journeys"),
  getJourney: (id) => request(`/journeys/${id}`),
  updateStage: (id, payload) => request(`/journeys/${id}/stage`, { method: "PATCH", body: payload }),
  getStages: () => request("/journeys/stages"),
};
