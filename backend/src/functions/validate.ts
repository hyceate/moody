export function validateEmail(email: string) {
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
    return false;
  }
  return true;
}
export function validateLength(value: string) {
  if (value.length < 3 || value.length > 24) {
    return false;
  }
  return true;
}
