import { ProfileAvatar } from '@/components/avatar';
import { useQuery } from '@tanstack/react-query';
import { fetchData, endpoint } from '@/query/fetch';
import { Link, Outlet, useParams } from 'react-router-dom';
import { User } from '@/@types/interfaces';
import { fetchUserData } from '@/query/queries';
import { useAuth } from '@/context/authContext';
import { Button } from '@chakra-ui/react';

export default function ProfileLayout() {
  const { username } = useParams<string>();
  const { isAuthenticated, user } = useAuth();
  const userData = useQuery<User>({
    queryKey: ['user', username, endpoint],
    queryFn: () =>
      fetchData<{ userByName: User }>(endpoint, fetchUserData, {
        name: username,
      }).then((data) => data.userByName),
    enabled: !!username,
  });
  return (
    <div id="profileWrapper" className="flex w-full flex-col">
      <section className="mt-5 flex flex-col items-center gap-2">
        <ProfileAvatar size="9rem" src={userData.data?.avatarUrl} />
        <h1 className="text-4xl">{username}</h1>
        {userData.data && isAuthenticated && userData.data.id === user?.id && (
          <Link to="/settings">
            <Button mt="10px">Edit Profile</Button>
          </Link>
        )}
      </section>
      <div className="mb-4 mt-10 flex w-full flex-row flex-wrap justify-center gap-10">
        <Link to={`/profile/${username}/created`}>
          <Button>Created</Button>
        </Link>
        <Link to={`/profile/${username}/saved`}>
          <Button>Saved</Button>
        </Link>
      </div>
      <Outlet />
    </div>
  );
}
