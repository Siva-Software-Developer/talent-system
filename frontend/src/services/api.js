import axios from "axios";

/* ==========================================
   🚀 API CONFIGURATION & INTERCEPTORS
   ========================================== */
const API = axios.create({
  baseURL: "http://localhost:5000/api", // Added /api prefix as per standard backend routes
  headers: {
    "Content-Type": "application/json",
  },
});

// 🛡️ AUTH INTERCEPTOR (Token Injection)
// Request anupurathukku munnadi, localStorage-la irunthu token-ai eduthu headers-la add pannum.
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 🛡️ RESPONSE INTERCEPTOR (Global Error Handling)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("Server is down! 🛠️ Check your backend connection, machi.");
    } else if (error.response.status === 401) {
      console.warn("Session expired or Unauthorized! 🔑 Log back in.");
      // Optional: localStorage.clear(); window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/* ==========================================
   🔐 AUTHENTICATION APIs
   ========================================== */
export const loginUser = (credentials) => 
  API.post("/auth/login", credentials);

export const registerUser = (userData) => 
  API.post("/auth/register-verify", userData);

export const sendRegisterOTP = (email) => 
  API.post("/auth/register-send-otp", { email });

/* ==========================================
   🔥 TASK MANAGEMENT APIs (Mission Control)
   ========================================== */
export const getAllTasks = () => 
  API.get("/tasks");

export const getUserTasks = (email) =>
  API.get(`/tasks/user/${email}`);

export const assignTask = (formData) =>
  API.post("/admin/assign-task", formData, {
    headers: { "Content-Type": "multipart/form-data" } // Useful if assigning tasks with PDFs
  });

export const updateProgress = (data) =>
  API.post("/tasks/update-progress", data);

export const reportBlocker = (data) =>
  API.post("/employee/report-blocker", data);

export const completeTask = (data) => 
  API.post("/employee/complete-task", data);

/* ==========================================
   📊 ANALYTICS & DASHBOARD
   ========================================== */
export const getDashboardStats = () =>
  API.get("/admin/dashboard");

export const getAnalytics = () =>
  API.get("/admin/analytics");

export const filterTasks = (params) =>
  API.get("/tasks/filter", { params });

/* ==========================================
   🟢 ATTENDANCE APIs (SOD & EOD)
   ========================================== */
export const submitSOD = (data) =>
  API.post("/attendance/sod", data);

export const submitEOD = (data) =>
  API.post("/attendance/eod", data);

export const getSODHistory = () =>
  API.get("/attendance/sod");

export const getEODHistory = () =>
  API.get("/attendance/eod");

/* ==========================================
   📢 CHAT & ANNOUNCEMENTS
   ========================================== */
export const fetchMessages = () => 
  API.get("/messages");

export const sendMessage = (messageData) => 
  API.post("/messages", messageData);

/* ==========================================
   💡 HELP & SUPPORT (TICKET SYSTEM)
   ========================================== */
export const raiseSupportTicket = (ticketData) => 
  API.post("/help/raise-ticket", ticketData);

export const getAllSupportTickets = () => 
  API.get("/help/tickets");

export const updateTicketStatus = (ticketId, status) => 
  API.put(`/help/tickets/${ticketId}`, { status });

/* ==========================================
   👤 USER PROFILE SETTINGS
   ========================================== */
export const updateProfile = (data) =>
  API.post("/user/profile/update", data, {
    headers: { "Content-Type": "multipart/form-data" }
  });

export default API;