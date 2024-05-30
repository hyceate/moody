import { Avatar } from '@chakra-ui/react';
type ProfileProps = {
  username: string;
};
export const ProfileHead = ({ username }: ProfileProps) => {
  return (
    <>
      <div className="flex flex-col w-full justify-center items-center gap-2">
        <Avatar boxSize="6rem"></Avatar>
        <h1 className="text-3xl">{username}</h1>
      </div>
    </>
  );
};
