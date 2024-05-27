import { useEffect } from 'react';

export default function Settings() {
  useEffect(() => {
    document.title = 'User Settings';
  }, []);
  return <h1>Settings</h1>;
}
