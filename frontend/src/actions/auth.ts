import { FormikHelpers } from 'formik';
import axios, { AxiosResponse } from 'axios';
import { $user } from '../context/userStore';
interface FormValues {
  email: string;
  password: string;
  username?: string;
}

export const validateName = (values: string) => {
  let error;
  if (!values) {
    error = 'Please enter an username';
  } else if (values.length < 2 || values.length > 24) {
    error = 'Username should be longer than 2 character';
  }
  return error;
};
export const validatePassword = (values: string) => {
  let error;
  if (!values) {
    error = 'Please input a password between 8 - 24 characters';
  } else if (values.length < 8 || values.length > 24) {
    error = 'Password must be between 8 and 24 characters';
  }
  return error;
};
export function validateEmail(value: string) {
  let error;
  if (!value) {
    error = 'Please input an email';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
    error = 'Invalid email address';
  }
  return error;
}

// login
export const handleLogIn = async (
  values: FormValues,
  { setSubmitting, setFieldError }: FormikHelpers<FormValues>,
) => {
  axios
    .post('http://localhost:3000/api/auth/login', values, {
      withCredentials: true,
      timeout: 3000,
    })
    .then((response: AxiosResponse) => {
      if (response.status === 200) {
        const userData = response.data.user;
        setSubmitting(false);
        // console.log(userData);
        $user.setKey('id', userData.id);
        window.location.href = '/';
      } else if (response.status === 401) {
        setFieldError('email', 'username is already used');
        setSubmitting(false);
        return;
      } else {
        setSubmitting(false);
        throw new Error(`Unexpected Error` + response.status);
      }
    })
    .catch((Error) => {
      if (Error.response && Error.response.status === 401) {
        setFieldError('email', 'Incorrect email or password');
        setSubmitting(false);
      } else {
        console.error('Unexpected error occurred ' + Error.response.status);
      }
      setSubmitting(false);
      return;
    });
};

//logout
export const handleLogOut = async () => {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/auth/logout',
      {},
      {
        withCredentials: true,
      },
    );
    if (response.status === 200) {
      // Check for success response from server
      $user.setKey('id', undefined);
      window.location.href = '/';
      return true;
    } else {
      console.error('Logout failed:', response.data.error);
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};
interface UserData {
  user: any;
  id: string;
  username: string;
}
export const checkAuth = async (): Promise<UserData | null> => {
  try {
    const response = await axios.get('http://localhost:3000/api/auth/user', {
      withCredentials: true,
      timeout: 5000,
    });
    if (response && response.status === 200) {
      return response.data;
    }
  } catch (error) {
    return null;
  }
  return null;
};
