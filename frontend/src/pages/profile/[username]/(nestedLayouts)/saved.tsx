import { useParams } from 'react-router-dom';
import { SavedBoards } from '@/components/savedboards';

export default function ProfileSavedPins() {
  const { username } = useParams<string>();

  return (
    <>
      <SavedBoards username={username} />
    </>
  );
}
