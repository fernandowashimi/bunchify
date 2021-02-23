import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_SPOTIFY_API_URL;

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

export const getProfile = async ({
  token,
}: Application.GetProfileInput): Promise<Application.GetProfileResponse> => {
  try {
    const { data } = await axiosInstance.get('/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  } catch (e) {
    const error: Application.Error = new Error('An error occurred while fetching the data.');

    error.status = e.response.status;

    throw error;
  }
};

export const getTop = async ({
  token,
  type,
  range,
  limit = 20,
  offset = 0,
}: Application.GetTopArtistsInput): Promise<Application.GetTopResponse> => {
  try {
    const { data } = await axiosInstance.get(`/me/top/${type}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        time_range: range,
        limit,
        offset,
      },
    });

    return data;
  } catch (e) {
    const error: Application.Error = new Error('An error occurred while fetching the data.');

    error.status = e.response.status;

    throw error;
  }
};
