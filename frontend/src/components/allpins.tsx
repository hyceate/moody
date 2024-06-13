import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { fetchPinsSchema } from 'query/queries';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Box, Masonry } from 'gestalt';
import { GridComponentWithUser } from 'components/gridItem';
import { getImageDimensions } from 'actions/images';
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
        return response.pins;
      } catch (error) {
        console.error('Error fetching pins:', error);
        throw new Error(`Error fetching pins: ${error}`);
      }
    },
  });

  useEffect(() => {
    restoreScroll();
  }, []);
  const BASE_URL = window.location.origin;
  useLayoutEffect(() => {
    if (data && initialLoad.current) {
      setPins(data);
      const fetchDimensions = async () => {
        try {
          const pinsWithDimensions = await Promise.all(
            data.map(async (pin) => {
              const fullImageUrl = `${BASE_URL}${pin.imgPath}`;
              const dimensions = await getImageDimensions(fullImageUrl);
              return {
                ...pin,
                dimensions: dimensions as { width: number; height: number },
              };
            }),
          );
          setPins(pinsWithDimensions);
        } catch (error) {
          console.error('Error fetching image dimensions:', error);
        }
      };
      fetchDimensions();
      setTimeout(() => {
        setShowPins(true);
      }, 100);
    }
  }, [BASE_URL, data, isLoading]);

  if (error) return <div>Error: {error.message}</div>;
  if (!showPins && isLoading)
    return (
      <div
        id="index-pins"
        className="flex w-full h-full justify-center items-center"
      >
        <div className="flex-1 flex h-[80dvh] justify-center items-center">
          <Spinner boxSize={200}></Spinner>
        </div>
      </div>
    );
  return (
    <div
      id="index-pins"
      className="h-full w-full px-[5rem] max-lg:px-0 pt-[2rem] pb-10"
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
