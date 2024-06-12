import axios from 'axios';

interface UserData {
  user: any;
  id: string;
  username: string;
}
export const checkAuth = async (): Promise<UserData | null> => {
  try {
    const response = await axios.get('http://localhost:3000/api/auth/user', {
      withCredentials: true,
      timeout: 3000,
    });
    if (response && response.status === 200) {
      return response.data;
    }
  } catch (error) {
    return null;
  }
  return null;
};
