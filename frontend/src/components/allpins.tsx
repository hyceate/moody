import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Skeleton } from '@chakra-ui/react';
import { Masonry, Flex, Box, Image as Img } from 'gestalt';
import { getImageDimensions } from '../actions/images';
import './css/masonry.css';
import './css/transitions.css';
interface User {
  id: string;
  username: string;
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

const fetchPinsSchema = `
  query GetPins {
    pins {
      id
      title
      description
      imgPath
      user {
        username
        id
      }
    }
  }
`;

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

  const BASE_URL = window.location.origin;
  useEffect(() => {
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
          setShowPins(true);
        } catch (error) {
          console.error('Error fetching image dimensions:', error);
        }
      };
      fetchDimensions();
    }
    if (!isLoading && data) {
      document.querySelectorAll('.fadeIn').forEach((element) => {
        element.classList.remove('loaded');
        setTimeout(() => {
          element.classList.add('loaded');
        }, 0);
      });
    }
  }, [BASE_URL, data, isLoading]);

  if (isLoading)
    return (
      <div
        id="index-pins"
        className="w-full h-full flex justify-center items-center"
      >
        <Skeleton height="700px" />
        <Skeleton height="300px" />
        <Skeleton height="400px" />
        <Skeleton height="700px" />
        <Skeleton height="300px" />
        <Skeleton height="400px" />
        <Skeleton height="700px" />
        <Skeleton height="300px" />
        <Skeleton height="400px" />
        Loading...
      </div>
    );
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div
      id="index-pins"
      className="h-full w-full px-[9rem] max-lg:px-0 py-[2rem]"
      ref={(el) => {
        scrollContainerRef.current = el;
      }}
      tabIndex={0}
    >
      {data && data.length > 0 && scrollContainerRef.current && (
        <Masonry
          columnWidth={220}
          gutterWidth={20}
          items={pins}
          layout="flexible"
          minCols={1}
          renderItem={({ data }) => (
            <GridComponent data={data} showPins={showPins} />
          )}
          scrollContainer={() => scrollContainerRef.current || window}
        />
      )}
      {data && data.length === 0 && <div>No pins available</div>}
    </div>
  );
};

export default AllPins;

function GridComponent({ data, showPins }: { data: Pins; showPins: boolean }) {
  return (
    <Box rounding={8} marginBottom={3}>
      <Flex direction="column">
        <Flex.Item dataTestId={data.id}>
          <div key={data.id} className={`fadeIn ${showPins ? 'loaded' : ''}`}>
            <Link to={`/pin/${data.id}`}>
              {data.dimensions && (
                <Box rounding={5} overflow="hidden">
                  <Img
                    src={data.imgPath}
                    alt={data.title || data.description || 'Image'}
                    naturalWidth={data.dimensions?.width}
                    naturalHeight={data.dimensions?.height}
                  />
                </Box>
              )}
            </Link>
            <section className="flex flex-col px-1 pt-2 gap-[2px]">
              {data.title ? (
                <>
                  <Link to={`/pin/${data.id}`}>
                    <h1 className="font-semibold hover:text-[#76abae]">
                      {data.title}
                    </h1>
                  </Link>
                </>
              ) : null}
              <Link
                to={`/profile/${data.user.username}`}
                className="flex flex-row items-center gap-2 hover:underline"
              >
                <Avatar boxSize={7}></Avatar>
                <h2 className="text-[0.8rem]">{data.user.username}</h2>
              </Link>
            </section>
          </div>
        </Flex.Item>
      </Flex>
    </Box>
  );
}
