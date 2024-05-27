import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { Tab, Tabs, TabList, TabPanels, TabPanel } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { Masonry } from 'masonic';
import { Link } from 'react-router-dom';
import { ProfileHead } from '../../components/profilehead';
import { useAuth } from '../../context/authContext';
interface User {
  id: string;
  username: string;
}
interface Pin {
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
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabChange = (tabName: string) => {
    if (tabName === 'created') {
      window.location.hash = '#created'; // Set hash for created tab
    } else {
      window.location.hash = ''; // Clear hash for boards tab
    }
  };
  const endpoint = 'http://localhost:3000/api/graphql';
  const userData = useQuery<User>({
    queryKey: ['user', username],
    queryFn: async () => {
      try {
        const response: { userByName: User } = await request(
          endpoint,
          fetchUserData,
          { name: username },
        );
        // console.log(response.userByName);
        return response.userByName;
      } catch (error) {
        throw new Error(`Error fetching boards: ${error}`);
      }
    },
    enabled: !!username,
  });
  const boardData = useQuery<Board[]>({
    queryKey: ['boards', username],
    queryFn: async () => {
      try {
        const response: { boardsByUser: Board[] } = await request(
          endpoint,
          fetchUserBoards,
          { user_Id: userData.data?.id },
        );
        // console.log(response.boardsByUser);
        return response.boardsByUser;
      } catch (error) {
        throw new Error(`Error fetching boards: ${error}`);
      }
    },
    enabled: !!username && userData.isSuccess,
  });
  const pinsData = useQuery<Pin[]>({
    queryKey: ['pins', username],
    queryFn: async () => {
      try {
        const response: { pinsByUser: Pin[] } = await request(
          endpoint,
          fetchUserPins,
          { id: userData.data?.id },
        );
        // console.log(response.pinsByUser);
        return response.pinsByUser;
      } catch (error) {
        throw new Error(`Error fetching pins: ${error}`);
      }
    },
    enabled: !!username && userData.isSuccess,
  });
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
      <section className="flex flex-col items-center gap-2">
        <ProfileHead username={username} />
        <div>edit profile maybe</div>
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
                items={pinsData.data}
                columnGutter={12}
                rowGutter={15}
                columnWidth={160}
                maxColumnCount={5}
                overscanBy={2}
                render={({ data: pin }: { data: Pin }) => (
                  <div
                    key={pin.id}
                    className={`rounded-[1rem] w-full overflow-hidden fadeIn ${!pinsData.isLoading ? 'loaded' : ''}`}
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
                  if (!pinsData.isLoading && pinsData.data) {
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
