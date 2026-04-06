// api.js - Utility for Edu Management API

const BASE_URL = "http://144.24.146.130/edu/api/v1";

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
  list: (params) => apiRequest("/teacher/", { params }),
  get: (id) => apiRequest(`/teacher/${id}`),
  create: (data) => apiRequest("/users/register/teacher", { method: "POST", body: data }),
  update: (id, data) => apiRequest(`/teacher/${id}`, { method: "PUT", body: data }),
  // API expects `{ is_active: boolean }` in the request body
  setActive: (id, active) => apiRequest(`/teacher/${id}/active`, { method: "PATCH", body: { is_active: active } }),
  delete: (id) => apiRequest(`/teacher/${id}`, { method: "DELETE" }),
};

// Add more API groups as needed (StudentsAPI, etc.)
