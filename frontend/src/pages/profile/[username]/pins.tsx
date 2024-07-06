import { Pin, User } from '@/@types/interfaces';
import { GridComponentWithUser } from '@/components/gridItem';
import { fetchData } from '@/query/fetch';
import { fetchPinsByUserBoards, fetchUserData } from '@/query/queries';
import { Spinner } from '@chakra-ui/react';
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
    queryKey: ['user', username],
    queryFn: () =>
      fetchData<{ userByName: User }>(fetchUserData, {
        name: username,
      }).then((data) => data.userByName),
    enabled: !!username,
  });
  const savedPinsData = useQuery<Pin[]>({
    queryKey: ['savedPins', username, userData.data?.id],
    queryFn: () =>
      fetchData<{ pinsByUserBoards: Pin[] }>(fetchPinsByUserBoards, {
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
      {!showPins && (
        <div>
          <Spinner boxSize="15rem"></Spinner>
        </div>
      )}
      {savedPinsData.data && savedPinsData.data.length > 0 && (
        <Masonry
          columnWidth={200}
          gutterWidth={20}
          items={pins}
          layout="flexible"
          minCols={1}
          renderItem={({ data }) => (
            <GridComponentWithUser
              data={data}
              showPins={showPins}
              showUser={true}
            />
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
}
