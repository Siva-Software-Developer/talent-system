import axios from "axios";

/* ==========================================
   🚀 API CONFIGURATION & INTERCEPTORS
   ========================================== */
const API = axios.create({
  baseURL: "http://localhost:5000", // ✅ FIX: removed /api (backend supports both)
  headers: {
    "Content-Type": "application/json",
  },
});

// 🛡️ AUTH INTERCEPTOR
API.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("dtms_user")); // ✅ FIXED KEY
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🛡️ RESPONSE INTERCEPTOR
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("Server is down! 🛠️ Check backend.");
    } else if (error.response.status === 401) {
      console.warn("Unauthorized! 🔑 Login again.");
    }
    return Promise.reject(error);
  }
);

/* ==========================================
   🔐 AUTH APIs (🔥 FIXED)
   ========================================== */

// ✅ FIX: correct endpoint
export const loginUser = (credentials) =>
  API.post("/login", credentials);

// ✅ FIX: correct endpoint
export const registerUser = (userData) =>
  API.post("/register-verify", userData);

// ✅ FIX: correct endpoint
export const sendRegisterOTP = (email) =>
  API.post("/register-send-otp", { email });

/* ==========================================
   🔥 TASK APIs
   ========================================== */
export const getAllTasks = () =>
  API.get("/tasks");

export const getUserTasks = (email) =>
  API.get(`/tasks/user/${email}`);

export const assignTask = (formData) =>
  API.post("/admin/assign-task", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateProgress = (data) =>
  API.post("/update-progress", data); // ✅ FIX

export const reportBlocker = (data) =>
  API.post("/employee/report-blocker", data);

export const completeTask = (data) =>
  API.post("/employee/complete-task", data);

/* ==========================================
   📊 DASHBOARD APIs
   ========================================== */
export const getDashboardStats = () =>
  API.get("/admin/dashboard");

export const getAnalytics = () =>
  API.get("/admin/analytics");

export const filterTasks = (params) =>
  API.get("/tasks/filter", { params });

/* ==========================================
   🟢 ATTENDANCE APIs
   ========================================== */
export const submitSOD = (data) =>
  API.post("/sod", data);

export const submitEOD = (data) =>
  API.post("/eod", data);

export const getSODHistory = () =>
  API.get("/sod");

export const getEODHistory = () =>
  API.get("/eod");

/* ==========================================
   📢 CHAT APIs
   ========================================== */
export const fetchMessages = () =>
  API.get("/messages");

export const sendMessage = (messageData) =>
  API.post("/messages", messageData);

/* ==========================================
   💡 HELP APIs
   ========================================== */
export const raiseSupportTicket = (ticketData) =>
  API.post("/help/raise-ticket", ticketData);

export const getAllSupportTickets = () =>
  API.get("/help/tickets");

// ⚠️ backend uses POST not PUT
export const updateTicketStatus = (ticketId, status) =>
  API.post("/help/tickets/update", { ticket_id: ticketId, status });

/* ==========================================
   👤 PROFILE APIs
   ========================================== */
export const updateProfile = (data) =>
  API.post("/api/user/profile/update", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export default API;