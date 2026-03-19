import axiosInstance from './axios';

export const uploadCoverImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return axiosInstance.post('/upload/cover', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
