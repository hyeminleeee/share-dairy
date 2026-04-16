import api from "./client";

export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);
export const findAccount = (data) => api.post("/auth/find-account", data);
export const resetPassword = (data) => api.post("/auth/reset-password", data);
export const getMe = () => api.get("/auth/me");
export const updateProfile = (data) => api.patch("/auth/me/profile", data);
export const changePassword = (data) => api.patch("/auth/me/password", data);
export const updateAvatar = (formData) =>
  api.patch("/auth/me/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } });
