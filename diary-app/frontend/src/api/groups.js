import api from "./client";

export const createGroup = (data) => api.post("/groups", data);
export const listGroups = () => api.get("/groups");
export const getGroup = (id) => api.get(`/groups/${id}`);
export const joinByInvite = (token) => api.post(`/groups/invite/${token}`);
export const leaveGroup = (id) => api.delete(`/groups/${id}/leave`);
export const deleteGroup = (id) => api.delete(`/groups/${id}`);
