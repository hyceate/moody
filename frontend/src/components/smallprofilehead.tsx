import { Avatar } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
type ProfileProps = {
  username: string;
};
export const SmallProfileHead = ({ username }: ProfileProps) => {
  return (
    <>
      <Link to={`/profile/${username}`}>
        <div className="flex flex-row w-full justify-center items-center gap-2">
          <Avatar boxSize="3rem"></Avatar>
        </div>
      </Link>
    </>
  );
};
