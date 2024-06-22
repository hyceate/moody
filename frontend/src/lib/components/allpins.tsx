import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { fetchPinsSchema } from '@/query/queries';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Box, Masonry } from 'gestalt';
import { GridComponentWithUser } from '@/components/gridItem';
import { restoreScroll } from '@/actions/scroll';
import './css/gestalt.css';
import { Spinner } from '@chakra-ui/react';
interface User {
  id: string;
  username: string;
  avatarUrl: string;
}
interface Pins {
  id: string;
  title: string;
  description: string;
  imgPath: string;
  user: User;
  dimensions?: { width: number; height: number };
}
interface PinsResponse {
  pins: Pins[];
}

const AllPins = () => {
  const [pins, setPins] = useState<Pins[]>([]);
  const scrollContainerRef = useRef<HTMLElement | Window | null>(null);
  const initialLoad = useRef(true);
  const [showPins, setShowPins] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['allpins'],
    queryFn: async () => {
      try {
        const endpoint = 'http://localhost:3000/api/graphql';
        const response: PinsResponse = await request(endpoint, fetchPinsSchema);
        console.log(response.pins);
        return response.pins;
      } catch (error) {
        console.error('Error fetching pins:', error);
        throw new Error(`Error fetching pins: ${error}`);
      }
    },
  });

  useLayoutEffect(() => {
    document.title = "moody's home";
    if (data && initialLoad.current) {
      setPins(data);
    }
  }, [data, isLoading]);
  useEffect(() => {
    if (pins)
      setTimeout(() => {
        setShowPins(true);
      }, 150);

    if (showPins) {
      restoreScroll();
    }
  }, [pins, showPins]);

  if (error) return <div>Error: {error.message}</div>;
  if (!showPins && isLoading)
    return (
      <div
        id="index-pins"
        className="flex size-full items-center justify-center"
      >
        <div className="flex h-[80dvh] flex-1 items-center justify-center">
          <Spinner boxSize={200}></Spinner>
        </div>
      </div>
    );

  return (
    <div
      id="index-pins"
      className="size-full px-20 pb-10 pt-8 max-lg:px-0"
      ref={(el) => {
        scrollContainerRef.current = el;
      }}
      tabIndex={0}
    >
      <Box>
        {data && data.length > 0 && scrollContainerRef.current && (
          <Masonry
            columnWidth={230}
            gutterWidth={20}
            items={pins}
            layout="flexible"
            minCols={2}
            renderItem={({ data }) => (
              <GridComponentWithUser data={data} showPins={showPins} />
            )}
            scrollContainer={() => scrollContainerRef.current || window}
          />
        )}
      </Box>
      {data && data.length === 0 && <div>No pins available</div>}
    </div>
  );
};

export default AllPins;
