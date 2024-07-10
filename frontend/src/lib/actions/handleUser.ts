import { FormikHelpers } from 'formik';
import axios, { AxiosResponse } from 'axios';
interface FormValues {
  email: string;
  password: string;
  username?: string;
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
        setSubmitting(false);
        window.location.reload();
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
        setFieldError('password', 'Incorrect email or password');
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
