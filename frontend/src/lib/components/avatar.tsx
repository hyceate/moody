import { Avatar } from '@chakra-ui/react';

export const ProfileAvatar = ({
  size,
  src,
}: {
  size: string;
  src?: string;
}) => {
  const handleImageLoaded = (
    event: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    event.currentTarget.style.visibility = 'visible';
  };
  return (
    <div className={`w-[${size}] aspect-square h-auto`}>
      {src && (
        <Avatar
          boxSize={size}
          src={src}
          style={{ visibility: 'hidden' }}
          onLoad={handleImageLoaded}
        />
      )}
      {!src && <Avatar boxSize={size} />}
    </div>
  );
};
