import api from "./client";

export const getFeed = (page = 1, size = 20) =>
  api.get("/posts/feed", { params: { page, size } });

export const getGroupPosts = (groupId, page = 1, size = 20) =>
  api.get(`/posts/group/${groupId}`, { params: { page, size } });

export const createPost = (formData) =>
  api.post("/posts", formData, { headers: { "Content-Type": "multipart/form-data" } });

export const getPost = (id) => api.get(`/posts/${id}`);

export const updatePost = (id, formData) =>
  api.put(`/posts/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });

export const deletePost = (id) => api.delete(`/posts/${id}`);
