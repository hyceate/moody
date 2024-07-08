import { ProfileAvatar } from '@/components/avatar';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '@/query/fetch';
import { Link, Outlet, useParams } from 'react-router-dom';
import { User } from '@/@types/interfaces';
import { fetchUserData } from '@/query/queries';
import { useAuth } from '@/context/authContext';
import { Button, Spinner } from '@chakra-ui/react';

export default function ProfileLayout() {
  const { username } = useParams<string>();
  const { isAuthenticated, user } = useAuth();
  const userData = useQuery<User>({
    queryKey: ['profileUser', username],
    queryFn: () =>
      fetchData<{ userByName: User }>(fetchUserData, {
        name: username,
      }).then((data) => data.userByName),
    enabled: !!username,
  });
  return (
    <div
      id="profileWrapper"
      className="flex w-full flex-col items-center justify-center"
    >
      {userData.isLoading && (
        <div className="flex h-[80dvh] w-full flex-col items-center justify-center">
          <Spinner boxSize="10rem"></Spinner>
        </div>
      )}
      {!userData.isLoading && (
        <>
          <section className="mt-5 flex flex-col items-center gap-2">
            <div className="aspect-square w-36">
              <ProfileAvatar size="9rem" src={userData.data?.avatarUrl} />
            </div>
            <h1 className="text-4xl">{username}</h1>
            {userData.data &&
              isAuthenticated &&
              userData.data.id === user?.id && (
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
        </>
      )}
      <Outlet />
    </div>
  );
}
