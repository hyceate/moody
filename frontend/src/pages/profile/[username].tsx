import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Tab,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Button,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { Masonry, Flex, Box, Image as Img } from 'gestalt';
import { Link } from 'react-router-dom';
import { ProfileHead } from '../../components/profilehead';
import { useAuth } from '../../context/authContext';
import { fetchData } from '../../query/fetch';
import { getImageDimensions } from '../../actions/images';

interface User {
  id: string;
  username: string;
}
interface Pin {
  dimensions: { width: number; height: number };
  slice: any;
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
const fetchUserData = `
  query getUserbyName($name: String!) {
    userByName(username: $name) {
      id
      username
    }
  }`;
const fetchUserBoards = `
  query GetBoardsByUser($user_Id: ID!) {
    boardsByUser(userId: $user_Id) {
      id
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
  }`;
const fetchUserPins = `
  query getPinsByUser($id: ID!) {
    pinsByUser(id: $id) {
      id
      title
      description
      link
      imgPath
    }
  }`;

// component start
export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [pins, setPins] = useState<Pin[]>([]);
  const [showPins, setShowPins] = useState(false);
  const scrollContainerRef = useRef<HTMLElement | Window | null>(null);
  const initialLoad = useRef(true);

  const handleTabChange = (tabName: string) => {
    if (tabName === 'created') {
      window.location.hash = '#created'; // Set hash for created tab
    } else {
      window.location.hash = '#'; // Clear hash for boards tab
    }
  };
  const endpoint = 'http://localhost:3000/api/graphql';
  const userData = useQuery<User>({
    queryKey: ['user', username, endpoint],
    queryFn: () =>
      fetchData<{ userByName: User }>(endpoint, fetchUserData, {
        name: username,
      }).then((data) => data.userByName),
    enabled: !!username,
  });

  const boardData = useQuery<Board[]>({
    queryKey: ['boards', username, endpoint, userData.data?.id],
    queryFn: () =>
      fetchData<{ boardsByUser: Board[] }>(endpoint, fetchUserBoards, {
        user_Id: userData.data?.id,
      }).then((data) => data.boardsByUser),
    enabled: !!username && userData.isSuccess,
  });
  const pinsData = useQuery<Pin[]>({
    queryKey: ['pins', username, endpoint, userData.data?.id],
    queryFn: () =>
      fetchData<{ pinsByUser: Pin[] }>(endpoint, fetchUserPins, {
        id: userData.data?.id,
      }).then((data) => data.pinsByUser),
    enabled: !!username && userData.isSuccess,
  });
  const BASE_URL = window.location.origin;
  useEffect(() => {
    if (pinsData.data && initialLoad.current) {
      setPins(pinsData.data);
      const fetchDimensions = async () => {
        try {
          const pinsWithDimensions = await Promise.all(
            pinsData.data.map(async (pin) => {
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
  }, [BASE_URL, pinsData.data]);
  useEffect(() => {
    document.title = `${username}'s Profile`;
  }, [username]);
  useEffect(() => {
    if (!location.hash) {
      handleTabChange('boards');
    }
  }, [location.hash]);
  if (!username) {
    return <div>Invalid parameters</div>;
  }
  return (
    <div
      id="profile"
      className="flex flex-col gap-10 w-full max-w-[72rem] items-center"
    >
      <section className="flex flex-col items-center gap-2 mt-5">
        <ProfileHead username={username} />
        {isAuthenticated && (
          <Button>
            <Link to="/settings">Edit Profile</Link>
          </Button>
        )}
      </section>
      <Tabs
        isLazy
        display="flex"
        flexDir="column"
        width="100%"
        justifyContent="center"
        alignContent="center"
        defaultIndex={location.hash === '#created' ? 0 : 1}
        onChange={(index) =>
          handleTabChange(index === 0 ? 'created' : 'boards')
        }
      >
        <TabList
          display="flex"
          alignItems="center"
          justifyContent="center"
          border="none"
        >
          <Tab fontWeight="bold">Created</Tab>
          <Tab fontWeight="bold">Boards</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {pinsData.data && pinsData.data.length > 0 ? (
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
            ) : (
              <div className="flex w-full justify-center items-center">
                No pins available
              </div>
            )}
          </TabPanel>
          <TabPanel>
            {isAuthenticated && (
              <>
                <div className="flex justify-end w-full">
                  <button className="">
                    <AddIcon />
                  </button>
                </div>
              </>
            )}

            <section className="flex flex-wrap flex-row justify-center items-center gap-2">
              {boardData.data?.map((board) => (
                <Link to={`/${username}/${board.title}`} key={board.id}>
                  <div className="board-grid-item h-full">
                    <div className="boardImages w-[238px] h-[156px] ">
                      <div className="board-picture items-center justify-center flex rounded-[1rem] w-full h-full overflow-hidden aspect-video gap-[1px]">
                        <div className="board-large-img w-[156px] overflow-hidden  aspect-square">
                          {board.pins[0] && (
                            <img
                              key={board.pins[0].id}
                              src={board.pins[0].imgPath}
                              alt={
                                board.pins[0].title || board.pins[0].description
                              }
                              className="w-full h-auto aspect-square object-cover"
                            />
                          )}
                        </div>
                        <div className="board-small-img flex flex-col flex-nowrap overflow-hidden gap-[1px]">
                          {board.pins.slice(1, 3).map((pin) => (
                            <img
                              key={pin.id}
                              src={pin.imgPath}
                              alt={
                                board.pins[0].title || board.pins[0].description
                              }
                              className={`max-w-[4.85rem] w-full object-cover aspect-square`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <h2 className="font-semibold">{board.title}</h2>
                      <p>{board.pinCount} pins</p>
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}

function GridComponent({ data, showPins }: { data: Pin; showPins: boolean }) {
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
          </div>
        </Flex.Item>
      </Flex>
    </Box>
  );
}
