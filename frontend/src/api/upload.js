import axiosInstance from './axios';

export const uploadCoverImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  // Do NOT set Content-Type to multipart/form-data without boundary.
  // Axios instance defaults to application/json — strip so browser sets boundary.
  return axiosInstance.post('/upload/cover', formData, {
    transformRequest: [
      (data, headers) => {
        if (typeof FormData !== 'undefined' && data instanceof FormData) {
          delete headers['Content-Type'];
        }
        return data;
      },
    ],
  });
};
