import axiosInstance from './axios';

export const getPublishedPosts = () => axiosInstance.get('/posts');

export const getPost = (id) => axiosInstance.get(`/posts/${id}`);

export const getMyPosts = () => axiosInstance.get('/posts/my');

export const getMyPost = (id) => axiosInstance.get(`/posts/my/${id}`);

export const createPost = (data) => axiosInstance.post('/posts', data);

export const updatePost = (id, data) => axiosInstance.patch(`/posts/${id}`, data);

export const publishPost = (id) => axiosInstance.patch(`/posts/${id}/publish`);

export const deletePost = (id) => axiosInstance.delete(`/posts/${id}`);
