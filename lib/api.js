// api.js - Utility for Edu Management API

// Hardcoded base URLs (not using environment variables by request)
export const API_BASE = "http://144.24.146.130/edu"
const BASE_URL = API_BASE + "/api/v1";

// Format a simple `YYYY-MM-DD` date into a full ISO datetime expected by the API.
// If input already looks like a full ISO string, return it unchanged.
export function formatDateForAPI(d) {
  if (!d) return ''
  // already contains time/T
  if (d.includes('T')) return d
  // simple YYYY-MM-DD -> YYYY-MM-DDT00:00:00Z
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return `${d}T00:00:00Z`
  return d
}

// Helper to get access token from localStorage
function getToken() {
  return typeof localStorage !== "undefined" ? localStorage.getItem("access_token") : null;
}

async function apiRequest(endpoint, { method = "GET", body, params, headers = {} } = {}) {
  let url = BASE_URL + endpoint;
  if (params) {
    const query = new URLSearchParams(params).toString();
    url += `?${query}`;
  }
  const token = getToken();
  const fetchOptions = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };
  if (body) fetchOptions.body = JSON.stringify(body);
  const res = await fetch(url, fetchOptions);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// TEACHERS
export const TeachersAPI = {
  list: (params) => apiRequest("/teachers/", { params }),
  get: (id) => apiRequest(`/teachers/${id}`),
  create: (data) => apiRequest("/users/register/teacher", { method: "POST", body: data }),
  update: (id, data) => apiRequest(`/teachers/${id}`, { method: "PUT", body: data }),
  // API expects `{ is_active: boolean }` in the request body
  setActive: (id, active) => apiRequest(`/teachers/${id}/active`, { method: "PATCH", body: { is_active: active } }),
  delete: (id) => apiRequest(`/teachers/${id}`, { method: "DELETE" }),
};

// Add more API groups as needed (StudentsAPI, etc.)
