import api from "./client";

export const toggleLike = (postId) => api.post(`/likes/${postId}`);
