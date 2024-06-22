import { Pin, User } from '@/@types/interfaces';
import { endpoint, fetchData } from '@/query/fetch';
import { fetchUserData, fetchUserPins } from '@/query/queries';
import { useQuery } from '@tanstack/react-query';
import { Masonry } from 'gestalt';
import { GridComponent } from './gridItem';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Spinner } from '@chakra-ui/react';

export const CreatedPins = ({ username }: { username: string | undefined }) => {
  const [pins, setPins] = useState<Pin[]>([]);
  const [showPins, setShowPins] = useState(false);
  const scrollContainerRef = useRef<HTMLElement | Window | null>(null);

  const userData = useQuery<User>({
    queryKey: ['user', username],
    queryFn: () =>
      fetchData<{ userByName: User }>(endpoint, fetchUserData, {
        name: username,
      }).then((data) => data.userByName),
    enabled: !!username,
  });
  const pinsData = useQuery<Pin[]>({
    queryKey: ['pins', username, userData.data?.id],
    queryFn: () =>
      fetchData<{ pinsByUser: Pin[] }>(endpoint, fetchUserPins, {
        id: userData.data?.id,
      }).then((data) => data.pinsByUser),
    enabled: !!username && userData.isSuccess,
  });
  useLayoutEffect(() => {
    if (pinsData.data) {
      setPins(pinsData.data);
    }
  }, [pinsData]);
  useEffect(() => {
    if (pins) {
      setTimeout(() => {
        setShowPins(true);
      }, 100);
    }
  }, [pins, pinsData.data]);
  if (pinsData.isLoading)
    return (
      <div className="flex items-center justify-center">
        <Spinner size="xl"></Spinner>
      </div>
    );
  return (
    <div className="mt-6">
      {pinsData.data && pinsData.data.length > 0 ? (
        <Masonry
          columnWidth={200}
          gutterWidth={20}
          items={pins}
          layout="flexible"
          minCols={1}
          renderItem={({ data }) => (
            <GridComponent data={data} showPins={showPins} />
          )}
          scrollContainer={() => scrollContainerRef.current || window}
        />
      ) : (
        <div className="flex w-full items-center justify-center">
          No Pins to display
        </div>
      )}
    </div>
  );
};
