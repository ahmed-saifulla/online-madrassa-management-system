// api.js - Utility for Edu Management API

// Use environment variable for API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000"
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
  if (res.status === 401) {
    // Clear all auth tokens and redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('madrassa_admin');
      localStorage.removeItem('madrassa_teacher');
      localStorage.removeItem('madrassa_student');
      window.location.href = '/';
    }
    throw new Error('Unauthorized');
  }
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

// DEPARTMENTS
export const DepartmentsAPI = {
  list: (params) => apiRequest("/departments/", { params }),
  get: (id) => apiRequest(`/departments/${id}`),
  create: (data) => apiRequest("/departments/", { method: "POST", body: data }),
  update: (id, data) => apiRequest(`/departments/${id}`, { method: "PUT", body: data }),
  setHead: (id, head_teacher_id) => apiRequest(`/departments/${id}/head`, { method: "PATCH", body: { head_teacher_id } }),
  removeHead: (id) => apiRequest(`/departments/${id}/head`, { method: "PATCH", body: { head_teacher_id: null } }),
  delete: (id) => apiRequest(`/departments/${id}`, { method: "DELETE" }),
};
