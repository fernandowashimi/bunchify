import axios from 'axios';

export const axiosInstance = axios.create();

export const generateImage = async (body: Application.GenerateImageInput) => {
  try {
    const response = await axiosInstance.post('/api/image', body, { responseType: 'blob' });

    return response.data;
  } catch (e) {
    const error: Application.Error = new Error('An error occurred while fetching the data.');

    error.status = e.response.status;

    throw error;
  }
};
