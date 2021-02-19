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

export const getTopArtists = async ({
  token,
  range,
  limit = 20,
  offset = 0,
}: Application.GetTopArtistsInput) => {
  try {
    const { data } = await axiosInstance.get(`/me/top/artists`, {
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
