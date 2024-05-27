import { useEffect } from 'react';

export default function Explore() {
  useEffect(() => {
    document.title = 'Explore moody.';
  }, []);
  return (
    <div>
      <h1>Test</h1>
    </div>
  );
}
