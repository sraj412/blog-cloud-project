import axiosInstance from './axios';

export const register = (email, password) =>
  axiosInstance.post('/auth/register', { email, password });

export const login = (email, password) =>
  axiosInstance.post('/auth/login', { email, password });
