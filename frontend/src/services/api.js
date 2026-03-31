import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000"
});

// ==========================================
// 🔥 TASK MANAGEMENT APIs
// ==========================================
export const getAllTasks = () => API.get("/tasks");

export const getUserTasks = (email) =>
  API.get(`/tasks/user/${email}`);

export const assignTask = (formData) =>
  API.post("/admin/assign-task", formData);

export const updateProgress = (data) =>
  API.post("/update-progress", data);

export const getDashboard = () =>
  API.get("/admin/dashboard");

export const getAnalytics = () =>
  API.get("/admin/analytics");

export const filterTasks = (params) =>
  API.get("/tasks/filter", { params });

// New: Employee task completion with links
export const completeTask = (data) => 
  API.post("/employee/complete-task", data);


// ==========================================
// 🟢 ATTENDANCE APIs (SOD & EOD)
// ==========================================
export const submitSOD = (data) =>
  API.post("/sod", data);

export const submitEOD = (data) =>
  API.post("/eod", data);

export const getSOD = () =>
  API.get("/sod");

export const getEOD = () =>
  API.get("/eod");


// ==========================================
// 📢 CHAT & COMMUNICATION APIs
// ==========================================
export const sendMessage = (data) =>
  API.post("/messages", data);

export const getMessages = () =>
  API.get("/messages");


// ==========================================
// 💡 HELP & SUPPORT APIs (NEWLY ADDED)
// ==========================================

/**
 * @route   POST /help/raise-ticket
 * @desc    Employee raises a doubt or issue to Admin
 */
export const raiseSupportTicket = (ticketData) => 
  API.post("/help/raise-ticket", ticketData);

/**
 * @route   GET /help/tickets
 * @desc    Admin fetches all raised tickets (Optional for Admin Dashboard)
 */
export const getAllSupportTickets = () => 
  API.get("/help/tickets");


// ==========================================
// 🔐 AUTHENTICATION APIs (FOR REFERENCE)
// ==========================================
export const loginUser = (credentials) => 
  API.post("/login", credentials);

export const registerUser = (userData) => 
  API.post("/register-verify", userData);

export const sendRegisterOTP = (email) => 
  API.post("/register-send-otp", { email });


export default API;