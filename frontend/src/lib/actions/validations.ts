export const validateName = (values: string) => {
  let error;
  if (!values) {
    error = 'Please enter an username';
  } else if (values.length < 2 || values.length > 24) {
    error = 'Username should be longer than 2 character';
  }
  return error;
};
export const validatePassword = async (value: string) => {
  let error;
  if (value) {
    if (value.length < 8 || value.length > 24) {
      error = 'Must be between 8 and 24 characters';
    }
  }
  return error;
};
export const validateNewPassword = (
  newPassword: string,
  confirmPassword: string,
) => {
  let error;
  if (newPassword && confirmPassword) {
    if (newPassword !== confirmPassword) {
      error = 'Passwords do not match';
      return error;
    } else {
      return '';
    }
  }
  return;
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
