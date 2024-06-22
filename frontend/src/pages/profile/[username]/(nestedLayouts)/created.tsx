import { CreatedPins } from '@/components/createdPins';
import { useParams } from 'react-router-dom';

export default function ProfileCreatedPins() {
  const { username } = useParams();
  return (
    <>
      <CreatedPins username={username} />
    </>
  );
}
