import { Navigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, Masonry } from 'gestalt';
import { Link } from 'react-router-dom';
import { fetchData } from 'query/fetch';
import { fetchBoardsByUsernameTitle } from 'query/queries';
import { useEffect, useRef, useState } from 'react';
import { GridComponent } from 'components/gridItem';
import 'components/css/gestalt.css';
import { ProfileAvatar } from '@/components/avatar';
import { useAuth } from '@/context/authContext';
import { Pin, Board } from '@/@types/interfaces';

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
      ).then((data) => data.boardsByUsernameTitle),
    enabled: !!username && !!title,
  });
};

//component start
export default function SingleBoard() {
  const { title, username } = useParams<{ title: string; username: string }>();
  const { user } = useAuth();
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
      setPins(boardData[0].pins);
      setShowPins(true);
    }
  }, [BASE_URL, boardData, showPins]);
  if (!username || !title) {
    return <Navigate to="/" replace />;
  }
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!boardData) {
    return <div>Error</div>;
  }
  const avatar = user?.avatarUrl;
  return (
    <>
      <div className="flex flex-col w-full justify-center items-center mb-10 mt-5">
        <section className="flex flex-col w-full justify-center items-center mb-2">
          <h1 className="mt-2 text-3xl font-bold">{title}</h1>
          <h2>{boardData[0].pinCount} pins</h2>
        </section>
        <ProfileAvatar size="5rem" src={avatar} />
        <p className="mt-1">
          collection by{' '}
          <Link to={`/profile/${username}`} className="font-bold">
            {username}
          </Link>
        </p>
      </div>
      <Box id="masonry-container" width="100%" height="100%" paddingX={0}>
        {boardData && boardData.length > 0 ? (
          <Masonry
            columnWidth={300}
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
          <div className="flex w-full justify-center items-center">
            No pins available
          </div>
        )}
      </Box>
    </>
  );
}
