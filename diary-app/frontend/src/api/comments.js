import api from "./client";

export const listComments = (postId) => api.get(`/comments/post/${postId}`);
export const createComment = (data) => api.post("/comments", data);
export const deleteComment = (id) => api.delete(`/comments/${id}`);
