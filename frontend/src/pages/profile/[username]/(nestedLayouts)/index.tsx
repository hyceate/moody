import { SavedBoards } from '@/components/savedboards';
import { useParams } from 'react-router-dom';

// component start
export default function Profile() {
  const { username } = useParams<{ username: string }>();
  if (!username) {
    return <div>Invalid User</div>;
  }
  return (
    <>
      <div id="profile" className="flex w-full flex-col items-center gap-5">
        <SavedBoards username={username}></SavedBoards>
      </div>
    </>
  );
}
