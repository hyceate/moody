import { Pin, User } from '@/@types/interfaces';
import { GridComponentWithUser } from '@/components/gridItem';
import { endpoint, fetchData } from '@/query/fetch';
import { fetchPinsByUserBoards, fetchUserData } from '@/query/queries';
import { useQuery } from '@tanstack/react-query';
import { Masonry } from 'gestalt';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function AllSavedPins() {
  const { username } = useParams();
  const [showPins, setShowPins] = useState<boolean>(false);
  const [pins, setPins] = useState<Pin[]>([]);
  const scrollContainerRef = useRef<HTMLElement | Window | null>(null);
  const userData = useQuery<User>({
    queryKey: ['user', username, endpoint],
    queryFn: () =>
      fetchData<{ userByName: User }>(endpoint, fetchUserData, {
        name: username,
      }).then((data) => data.userByName),
    enabled: !!username,
  });
  const savedPinsData = useQuery<Pin[]>({
    queryKey: ['savedPins', username, endpoint, userData.data?.id],
    queryFn: () =>
      fetchData<{ pinsByUserBoards: Pin[] }>(endpoint, fetchPinsByUserBoards, {
        userId: userData.data?.id,
      })
        .then((data) => {
          if (data && data.pinsByUserBoards) {
            return data.pinsByUserBoards;
          }
          return [];
        })
        .catch((error) => {
          console.error('Error fetching pins:', error);
          return [];
        }),
    enabled: !!username && userData.isSuccess,
  });
  useLayoutEffect(() => {
    document.title = `${username}'s Saved Pins`;
    if (savedPinsData && savedPinsData.data) {
      setPins(savedPinsData.data);
    }
  }, [username, savedPinsData]);
  useEffect(() => {
    setTimeout(() => {
      setShowPins(true);
    }, 100);
  }, [showPins]);
  return (
    <div className="mt-5 flex size-full flex-col items-center justify-center gap-5">
      <section className="">
        <h1 className="text-xl font-medium">All Saved Pins</h1>
      </section>
      {savedPinsData.data && savedPinsData.data.length > 0 ? (
        <Masonry
          columnWidth={200}
          gutterWidth={20}
          items={pins}
          layout="flexible"
          minCols={1}
          renderItem={({ data }) => (
            <GridComponentWithUser data={data} showPins={showPins} />
          )}
          scrollContainer={() => scrollContainerRef.current || window}
        />
      ) : (
        <div className="flex w-full items-center justify-center">
          <h1>No Pins available</h1>
        </div>
      )}
    </div>
  );
}
