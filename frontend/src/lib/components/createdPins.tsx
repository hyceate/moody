import { Pin, User } from '@/@types/interfaces';
import { fetchData } from '@/query/fetch';
import { fetchUserData, fetchUserPins } from '@/query/queries';
import { useQuery } from '@tanstack/react-query';
import { Masonry } from 'gestalt';
import { GridComponentWithUser } from './gridItem';
import { useEffect, useRef, useState } from 'react';
import { Spinner } from '@chakra-ui/react';
import { restoreScroll } from '@/actions/scroll';

export const CreatedPins = ({ username }: { username: string | undefined }) => {
  const [pins, setPins] = useState<Pin[]>([]);
  const [showPins, setShowPins] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const userData = useQuery<User>({
    queryKey: ['user', username],
    queryFn: () =>
      fetchData<{ userByName: User }>(fetchUserData, {
        name: username,
      }).then((data) => data.userByName),
    enabled: !!username,
  });

  const pinsData = useQuery<Pin[]>({
    queryKey: ['userPins', username, userData.data?.id],
    queryFn: () =>
      fetchData<{ pinsByUser: Pin[] }>(fetchUserPins, {
        userid: userData.data?.id,
      }).then((data) => data.pinsByUser),
    enabled: !!username && userData.isSuccess,
  });

  useEffect(() => {
    if (pinsData.data) {
      setPins(pinsData.data);
    }

  }, [pinsData]);
  useEffect(() => {
    if (pins) {
      setTimeout(() => {
        setShowPins(true);
        restoreScroll();
      }, 100);
    }

  }, [pins]);

  if (pinsData.isLoading)
    return (
      <div className="flex items-center justify-center">
        <Spinner size="xl"></Spinner>
      </div>
    );
  return (
    <div className={`fadeIn ${showPins ? 'loaded' : ''} mt-6 size-full`} ref={(el) => {
      scrollContainerRef.current = el;
    }}>
      {pinsData.data && pinsData.data.length === 0 && (
        <div className="flex w-full items-center justify-center">
          No Pins to display
        </div>
      )}
      {pinsData.data && pinsData.data.length > 0 && scrollContainerRef.current && (
        <Masonry
          columnWidth={200}
          gutterWidth={20}
          items={pins}
          layout="flexible"
          align="center"
          minCols={2}
          virtualBufferFactor={0.3}
            virtualize={true}
          renderItem={({ data }) => (
            <GridComponentWithUser data={data} showPins={showPins} showUser={false} />
          )}
          scrollContainer={() => {
            if (scrollContainerRef.current instanceof HTMLDivElement) {
              return scrollContainerRef.current;
            }
            return document.body;
          }}
        />
      )}
    </div>
  );
};
