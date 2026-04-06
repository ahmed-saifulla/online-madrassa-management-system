// api.js - Utility for Edu Management API

const BASE_URL = "https://77c2-2406-7400-56-1851-00-102.ngrok-free.app/api/v1";

// Helper to get access token from localStorage (customize as needed)
function getToken() {
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNDViZGRmZDAtNzJlNi00NTY3LWJlZjgtNGU5YTJhYTliYjJhIiwicm9sZSI6IlNVUEVSX0FETUlOIiwiZW1haWwiOiJzdXBlcmFkbWluQHNjaG9vbC5jb20iLCJzdWIiOiI0NWJkZGZkMC03MmU2LTQ1NjctYmVmOC00ZTlhMmFhOWJiMmEiLCJleHAiOjE3NzU3Mjg1NTIsImlhdCI6MTc3NTQ2OTM1Mn0.S8Nm8bjq0SDT8RAD-MR-LaS1wOecSk_Y6OQefZzmRUA";
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
  setActive: (id, active) => apiRequest(`/teacher/${id}/active`, { method: "PATCH", body: { active } }),
  delete: (id) => apiRequest(`/teacher/${id}`, { method: "DELETE" }),
};

// Add more API groups as needed (StudentsAPI, etc.)
