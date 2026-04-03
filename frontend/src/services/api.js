import axios from "axios";

/* ==========================================
   🚀 API CONFIGURATION
   ========================================== */
const API = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// 🛡️ GLOBAL ERROR HANDLING (Interceptor)
// This catches server errors automatically so you don't have to try/catch every single line
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("Server is down, machi! 🛠️ Check your backend.");
    }
    return Promise.reject(error);
  }
);

/* ==========================================
   🔐 AUTHENTICATION APIs
   ========================================== */
export const loginUser = (credentials) => 
  API.post("/login", credentials);

export const registerUser = (userData) => 
  API.post("/register-verify", userData);

export const sendRegisterOTP = (email) => 
  API.post("/register-send-otp", { email });

/* ==========================================
   🔥 TASK MANAGEMENT APIs (Mission Control)
   ========================================== */
export const getAllTasks = () => 
  API.get("/tasks");

export const getUserTasks = (email) =>
  API.get(`/tasks/user/${email}`);

export const assignTask = (formData) =>
  API.post("/admin/assign-task", formData);

export const updateProgress = (data) =>
  API.post("/update-progress", data);

// For Employee Task Submission (Links, Files, etc.)
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
  API.post("/sod", data);

export const submitEOD = (data) =>
  API.post("/eod", data);

export const getSODHistory = () =>
  API.get("/sod");

export const getEODHistory = () =>
  API.get("/eod");

/* = ::::::::::::::::::::::::::::::::::::::::
   📢 CHAT & ANNOUNCEMENTS
   :::::::::::::::::::::::::::::::::::::::: */
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

// Useful for Admin to resolve tickets
export const updateTicketStatus = (ticketId, status) => 
  API.put(`/help/tickets/${ticketId}`, { status });

export default API;