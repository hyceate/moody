import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { Masonry } from 'masonic';
import { Link } from 'react-router-dom';
import { SmallProfileHead } from '../../../components/smallprofilehead';
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
const fetchBoardsByUsernameTitle = `
  query boards($username: String!, $title: String!){
    boardsByUsernameTitle(username: $username, title: $title){
      title
      private
      pins {
        id
        title
        description
        imgPath
      }
      pinCount
    }
  }
`;

const endpoint = 'http://localhost:3000/api/graphql';
const useBoardData = (username: string, title: string) => {
  return useQuery<Board[]>({
    queryKey: ['boards', username, title],
    queryFn: async () => {
      try {
        const response: { boardsByUsernameTitle: Board[] } = await request(
          endpoint,
          fetchBoardsByUsernameTitle,
          { username, title },
        );
        return response.boardsByUsernameTitle;
      } catch (error) {
        throw new Error(`Error fetching boards: ${error}`);
      }
    },
    enabled: !!username && !!title,
  });
};

//component start
export default function SingleBoard() {
  const { title, username } = useParams<{ title: string; username: string }>();
  const { data: boardData, isLoading } = useBoardData(
    username ?? '',
    title ?? '',
  );
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
      <div className="flex flex-col w-full justify-center items-center mb-20">
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
      <div className="flex flex-wrap w-full px-[9rem]">
        {boardData && boardData.length > 0 ? (
          <Masonry
            items={boardData[0].pins}
            columnGutter={12}
            rowGutter={15}
            columnWidth={160}
            maxColumnCount={5}
            overscanBy={2}
            render={({ data: pin }: { data: Pin }) => (
              <div
                key={pin.id}
                className={`rounded-[1rem] w-full overflow-hidden fadeIn ${!isLoading ? 'loaded' : ''}`}
              >
                <Link to={`/pin/${pin.id}`}>
                  <img
                    key={pin.id}
                    src={pin.imgPath}
                    alt={pin.title || pin.description || 'Image'}
                    className="rounded-[1rem] border-2 border-solid border-slate-50"
                  />
                </Link>
                <section className="flex flex-col px-1 pt-2 gap-[2px]">
                  {pin.title && (
                    <Link to={`/pin/${pin.id}`}>
                      <h1 className="font-semibold hover:text-[#76abae]">
                        {pin.title}
                      </h1>
                    </Link>
                  )}
                </section>
              </div>
            )}
            onRender={() => {
              if (!isLoading && boardData) {
                document.querySelectorAll('.fadeIn').forEach((element) => {
                  element.classList.remove('loaded'); // Remove the class first to reset the state
                  setTimeout(() => {
                    element.classList.add('loaded'); // Add the class back to trigger the animation
                  }, 0);
                });
              }
            }}
          />
        ) : (
          <div className="flex w-full justify-center items-center">
            No pins available
          </div>
        )}
      </div>
    </>
  );
}
