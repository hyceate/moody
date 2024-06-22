import { Avatar } from '@chakra-ui/react';

export const ProfileAvatar = ({
  size,
  src,
}: {
  size: string;
  src?: string;
}) => {
  return (
    <>
      <Avatar boxSize={size} src={`${src}`} />
    </>
  );
};
