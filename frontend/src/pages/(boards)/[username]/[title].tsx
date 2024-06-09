import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, Masonry } from 'gestalt';
import { Link } from 'react-router-dom';
import { SmallProfileHead } from 'components/smallprofilehead';
import { fetchData } from 'query/fetch';
import { fetchBoardsByUsernameTitle } from 'query/queries';
import { useEffect, useRef, useState } from 'react';
import { GridComponent } from 'components/gridItem';
import { getImageDimensions } from 'actions/images';
import 'components/css/gestalt.css';
interface User {
  id: string;
  username: string;
}
interface Pin {
  id: string;
  title: string;
  description: string;
  link: string;
  imgPath: string;
  user: User;
}
interface Board {
  id: string;
  title: string;
  description: string;
  private: boolean;
  pins: Pin[];
  pinCount: number;
}

const endpoint = 'http://localhost:3000/api/graphql';
const useBoardData = (username: string, title: string) => {
  return useQuery<Board[]>({
    queryKey: ['boards', username, title],
    queryFn: () =>
      fetchData<{ boardsByUsernameTitle: Board[] }>(
        endpoint,
        fetchBoardsByUsernameTitle,
        {
          username,
          title,
        },
      ).then((data) => data.boardsByUsernameTitle), // Corrected property name
    enabled: !!username && !!title,
  });
};

//component start
export default function SingleBoard() {
  const { title, username } = useParams<{ title: string; username: string }>();
  const [pins, setPins] = useState<Pin[]>([]);
  const [showPins, setShowPins] = useState(false);
  const scrollContainerRef = useRef<HTMLElement | Window | null>(null);
  const { data: boardData, isLoading } = useBoardData(
    username ?? '',
    title ?? '',
  );
  const BASE_URL = window.location.origin;
  useEffect(() => {
    if (boardData && boardData.length > 0 && !showPins) {
      const fetchDimensions = async () => {
        try {
          const pinsWithDimensions = await Promise.all(
            boardData[0].pins.map(async (pin) => {
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
  }, [BASE_URL, boardData, showPins]);
  if (!username || !title) {
    return <div>Invalid parameters</div>;
  }
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!boardData) {
    return <div>Error</div>;
  }
  return (
    <>
      <div className="flex flex-col w-full justify-center items-center mb-10 mt-5">
        <section className="flex flex-col w-full justify-center items-center mb-2">
          <h1 className="mt-2 text-3xl font-bold">{title}</h1>
          <h2>{boardData[0].pinCount} pins</h2>
        </section>
        <SmallProfileHead username={username} />
        <p className="mt-1">
          collection by{' '}
          <Link to={`/profile/${username}`} className="font-bold">
            {username}
          </Link>
        </p>
      </div>
      <Box id="masonry-container" width="100%" height="100%" paddingX={10}>
        {boardData && boardData.length > 0 ? (
          <Masonry
            columnWidth={150}
            gutterWidth={20}
            items={pins}
            layout="basicCentered"
            minCols={1}
            renderItem={({ data }) => (
              <GridComponent data={data} showPins={showPins} />
            )}
            scrollContainer={() => scrollContainerRef.current || window}
          />
        ) : (
          <div className="flex w-full justify-center items-center">
            No pins available
          </div>
        )}
      </Box>
    </>
  );
}
