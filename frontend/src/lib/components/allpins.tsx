import { GraphQLClient } from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { fetchPinsSchema } from '@/query/queries';
import { useEffect, useRef, useState } from 'react';
import { Box, Masonry } from 'gestalt';
import { GridComponentWithUser } from '@/components/gridItem';
import { restoreScroll } from '@/actions/scroll';
import './css/gestalt.css';
import { Spinner } from '@chakra-ui/react';
import { Pin as Pins } from '@/@types/interfaces';
import { endpoint } from '@/query/fetch';

interface PinsResponse {
  pins: Pins[];
}
const createGraphQLClient = () => {
  return new GraphQLClient(endpoint, {
    credentials: 'include',
  });
};

const AllPins = () => {
  const [pins, setPins] = useState<Pins[]>([]);
  const scrollContainerRef = useRef<HTMLElement | Window | null>(null);
  const [showPins, setShowPins] = useState(false);

  const client = createGraphQLClient();
  const abortController = new AbortController();

  const { data, isLoading, error } = useQuery({
    queryKey: ['indexPins'],
    queryFn: async () => {
      try {
        const response: PinsResponse = await client.request(fetchPinsSchema, {
          signal: abortController.signal,
        });
        setTimeout(() => {
          abortController.abort();
        }, 2000);
        // console.log(response.pins);
        return response.pins;
      } catch (error) {
        console.error('Error fetching pins:', error);
        throw new Error(`Error fetching pins: ${error}`);
      }
    },
  });

  useEffect(() => {
    document.title = "moody's home";
    if (data) {
      setPins(data);
    }
  }, [data]);
  useEffect(() => {
    if (pins)
      setTimeout(() => {
        setShowPins(true);
        restoreScroll();
      }, 100);
  }, [pins]);

  if (error) return <div>Error: {error.message}</div>;
  if (isLoading)
    return (
      <div
        id="index-pins"
        className="flex size-full items-center justify-center"
      >
        <div className="flex h-[80dvh] flex-1 items-center justify-center">
          <Spinner boxSize={150}></Spinner>
        </div>
      </div>
    );

  return (
    <div
      id="index-pins"
      className={`fadeIn ${showPins ? 'loaded' : ''} size-full px-20 pb-10 pt-8 max-lg:px-0`}
      ref={(el) => {
        scrollContainerRef.current = el;
      }}
    >
      <Box>
        {data && data.length > 0 && (
          <Masonry
            columnWidth={236}
            gutterWidth={16}
            items={pins}
            layout="flexible"
            virtualBufferFactor={0.3}
            virtualize={true}
            minCols={2}
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
      </Box>
      {data && data.length === 0 && <div>No pins available</div>}
    </div>
  );
};

export default AllPins;
