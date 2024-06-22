import { Navigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, ButtonGroup, Masonry } from 'gestalt';
import { Link } from 'react-router-dom';
import { endpoint, fetchData } from '@/query/fetch';
import { fetchBoardsByUsernameTitle, fetchUserData } from '@/query/queries';
import { useEffect, useRef, useState } from 'react';
import { GridComponent } from '@/components/gridItem';
import 'components/css/gestalt.css';
import { ProfileAvatar } from '@/components/avatar';
import { useAuth } from '@/context/authContext';
import { User, Pin, Board } from '@/@types/interfaces';
import {
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Spinner,
  Switch,
  useDisclosure,
} from '@chakra-ui/react';

const useUserData = (username: string) => {
  return useQuery<User>({
    queryKey: ['user', username, endpoint],
    queryFn: () =>
      fetchData<{ userByName: User }>(endpoint, fetchUserData, {
        name: username,
      }).then((data) => data.userByName),
  });
};
const useBoardData = (username: string, url: string) => {
  return useQuery<Board[]>({
    queryKey: ['boards', username, url],
    queryFn: () =>
      fetchData<{ boardsByUsernameTitle: Board[] }>(
        endpoint,
        fetchBoardsByUsernameTitle,
        {
          username,
          url: url,
        },
      ).then((data) => data.boardsByUsernameTitle),
    enabled: !!username && !!url,
  });
};

//component start
export default function SingleBoard() {
  const drawerButtonRef = useRef<HTMLButtonElement>(null);
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();
  const { url, username } = useParams<{ url: string; username: string }>();
  const { isAuthenticated, user } = useAuth();
  const [pins, setPins] = useState<Pin[]>([]);
  const [showPins, setShowPins] = useState(false);
  const scrollContainerRef = useRef<HTMLElement | Window | null>(null);
  const { data: boardData, isLoading: isBoardLoading } = useBoardData(
    username ?? '',
    url ?? '',
  );
  const { data: boardUser, isLoading: isUserLoading } = useUserData(
    username ?? '',
  );
  useEffect(() => {
    if (boardData && boardData.length > 0 && !showPins) {
      setPins(boardData[0].pins);
      setTimeout(() => {
        setShowPins(true);
      }, 150);
    }
  }, [boardData, showPins]);

  if (isUserLoading) return null;
  if (boardUser && !boardUser.id) {
    return <Navigate to="/" replace />;
  }

  const board = boardData && boardData.length > 0 ? boardData[0] : undefined;
  const avatar = boardUser?.avatarUrl;
  return (
    <>
      <div className="mb-10 mt-5 flex w-full flex-col items-center justify-center gap-2">
        <section className="mb-2 flex w-full flex-col items-center justify-center">
          <h1 className="mt-2 text-3xl font-bold">{board?.title}</h1>
          <h2>{board?.pinCount} pins</h2>
        </section>
        <Link to={`/profile/${username}`} className="font-bold">
          <ProfileAvatar size="5rem" src={avatar} />
        </Link>
        <p className="mt-1">
          collection by{' '}
          <Link to={`/profile/${username}`} className="font-bold">
            {username}
          </Link>
        </p>
        <p className="empty:none max-w-[40rem]">{board?.description}</p>
        <div>
          {isAuthenticated && username === user?.username && (
            <Button ref={drawerButtonRef} onClick={onDrawerOpen}>
              Edit Board
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-center">
        {isBoardLoading && !showPins && <Spinner boxSize="10rem" />}
      </div>
      <Box id="masonry-container" width="100%" height="100%" paddingX={12}>
        {board && board?.pins.length > 0 && (
          <Masonry
            columnWidth={200}
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
        {!board?.pins.length && !isBoardLoading && (
          <div className="flex w-full items-center justify-center">
            No pins to share
          </div>
        )}
      </Box>
      <Drawer
        isOpen={isDrawerOpen}
        placement="right"
        onClose={onDrawerClose}
        finalFocusRef={drawerButtonRef}
        size="sm"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody>
            <section className="mt-8 flex size-full flex-col items-center justify-between gap-10 px-10 pb-20">
              <h1 className="text-2xl font-bold">
                Edit &ldquo;{board?.title}&rdquo;
              </h1>
              <form className="flex w-full flex-auto flex-col items-center justify-center gap-8">
                <input type="hidden" value={board?.id}></input>
                <FormControl>
                  <FormLabel htmlFor="title" fontSize="1.2rem">
                    Name
                  </FormLabel>
                  <input
                    name="title"
                    type="string"
                    className="w-full rounded-[24px] px-2 outline outline-1"
                    defaultValue={board?.title}
                  ></input>
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="description" fontSize="1.2rem">
                    Description
                  </FormLabel>
                  <textarea
                    name="description"
                    className="w-full resize-none rounded-[24px] px-2 py-1 outline outline-1"
                    rows={1}
                    maxLength={350}
                    defaultValue={board?.description}
                    onInput={(e) => {
                      const target = e.currentTarget;
                      target.style.height = 'auto';
                      target.style.height = `${target.scrollHeight}px`;
                    }}
                  ></textarea>
                </FormControl>
                <FormControl>
                  <div className="flex w-full flex-wrap items-center justify-end">
                    <FormLabel
                      htmlFor="private"
                      padding="0"
                      margin="0"
                      marginRight=".5rem"
                    >
                      Private
                    </FormLabel>
                    <Switch id="private" padding="0" margin="0" />
                  </div>
                </FormControl>
              </form>
              <DrawerFooter
                paddingX="0"
                alignContent="flex-end"
                display="flex"
                flexDir="column"
                gap="20px"
                width="100%"
              >
                <Button
                  type="submit"
                  bg="actions.pink.50"
                  color="white"
                  width="100%"
                  _hover={{ background: 'actions.pink.100' }}
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  Update
                </Button>
                <Divider></Divider>
                <Button onClick={onModalOpen}>Delete Board?</Button>
              </DrawerFooter>
            </section>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <Modal isOpen={isModalOpen} onClose={onModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <section className="items-wrap flex flex-col py-4">
              <h1 className="text-pretty text-xl">
                Are you sure you want to delete &ldquo;
                <span className="font-bold">{board?.title}</span>&rdquo;?
              </h1>
              <div className="flex gap-4 self-end">
                <Button
                  bg="actions.pink.50"
                  color="white"
                  _hover={{ background: 'actions.pink.100' }}
                >
                  Yes
                </Button>
                <Button>No</Button>
              </div>
            </section>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
