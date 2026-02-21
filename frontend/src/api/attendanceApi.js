import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const client = axios.create({
  baseURL: `${API_BASE_URL}/api/attendance`,
  timeout: 15000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const attendanceApi = {
  // SUO
  createSession: (payload) => client.post("/sessions", payload),
  deleteSession: (id) => client.delete(`/sessions/${id}`),
  createDrill: (payload) => client.post("/drills", payload),
  deleteDrill: (id) => client.delete(`/drills/${id}`),
  patchRecords: (payload) => client.patch("/records", payload),
  exportSession: (sessionId) =>
    client.get(`/export/${sessionId}`, {
      responseType: "blob",
    }),

  // ANO/SUO
  getSessions: () => client.get("/sessions"),
  getSession: (id) => client.get(`/session/${id}`),

  // CADET
  getMyAttendance: (regimentalNo) => client.get(`/my/${encodeURIComponent(regimentalNo)}`),
  submitLeave: (formData) =>
    client.post("/leave", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  reviewLeave: (id, payload) => client.patch(`/leave/${id}`, payload),
};

export default attendanceApi;

