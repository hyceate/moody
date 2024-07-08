import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Masonry } from 'gestalt';
import { Link } from 'react-router-dom';
import { endpoint, fetchData } from '@/query/fetch';
import {
  deleteBoardSchema,
  fetchBoardsByUsernameTitle,
  updateBoardGql,
} from '@/query/queries';
import { useEffect, useRef, useState } from 'react';
import { GridComponentWithUser } from '@/components/gridItem';
import 'components/css/gestalt.css';
import { ProfileAvatar } from '@/components/avatar';
import { useAuth } from '@/context/authContext';
import { Pin, Board } from '@/@types/interfaces';
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
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Switch,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { GraphQLClient } from 'graphql-request';
import { EditIcon } from '@chakra-ui/icons';

interface UpdateBoardInput {
  user: string;
  id: string;
  title: string;
  description: string;
  isPrivate: boolean;
}
interface deleteResponse {
  deleteBoard: {
    success: boolean;
    message: string;
  };
}

const useBoardData = (username: string, url: string) => {
  return useQuery<Board[]>({
    queryKey: ['boards', username, url],
    queryFn: () =>
      fetchData<{ boardsByUsernameTitle: Board[] }>(
        fetchBoardsByUsernameTitle,
        {
          username,
          url: url,
        },
      ).then((data) => data.boardsByUsernameTitle),
    enabled: !!username && !!url,
  });
};

const createGraphQLClient = () => {
  return new GraphQLClient(endpoint, {
    credentials: 'include',
  });
};
const client = createGraphQLClient();

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
  const toast = useToast();
  const { url, username } = useParams<{ url: string; username: string }>();
  const { isAuthenticated, user } = useAuth();
  const [pins, setPins] = useState<Pin[]>([]);
  const [showPins, setShowPins] = useState(false);
  const scrollContainerRef = useRef<HTMLElement | Window | null>(null);
  const { data: boardData, isLoading: isBoardLoading } = useBoardData(
    username ?? '',
    url ?? '',
  );
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const DeleteBoard = useMutation({
    mutationFn: async (boardId: string) => {
      const response: deleteResponse = await client.request(deleteBoardSchema, {
        boardId,
      });
      return response;
    },
    onSuccess: (data) => {
      const deleted = data.deleteBoard;
      const status = deleted.success;
      if (status === true) {
        toast({
          status: 'success',
          title: 'Board deleted',
        });
        navigate(`/profile/${username}`);
      }
    },
  });
  const UpdateBoard = useMutation({
    mutationFn: async (input: UpdateBoardInput) => {
      const response = await client.request(updateBoardGql, { input: input });
      return response;
    },
    onSuccess: (data: any) => {
      const upDated = data.updateBoard;
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      if (upDated.success === true) {
        toast({
          status: 'success',
          title: 'Board Updated',
          isClosable: true,
          duration: 3000,
        });
      }
    },
  });
  useEffect(() => {
    if (boardData && boardData.length > 0 && !showPins) {
      setPins(boardData[0].pins);
      setTimeout(() => {
        setShowPins(true);
      }, 150);
    }
  }, [boardData, showPins]);
  if (boardData && !boardData[0]) {
    navigate(`/`);
    toast({
      status: 'error',
      title: 'Unable to find board',
      duration: 1000,
      isClosable: true,
    });
    return 404;
  }

  const board = boardData && boardData.length > 0 ? boardData[0] : undefined;
  const handleBoardDelete = async () => {
    if (board) await DeleteBoard.mutateAsync(board.id);
  };

  async function handleUpdateBoard() {
    const form = document.getElementById(
      'updateBoardForm',
    ) as HTMLFormElement | null;
    if (form) {
      const formData = new FormData(form);
      const privateSwitch = document.querySelector(
        'input[name="isPrivate"]',
      ) as HTMLInputElement;
      const privateValue = privateSwitch?.checked;
      const user = formData.get('boardUser') as string;
      const id = formData.get('boardId') as string;
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const input = {
        user,
        id,
        title,
        description,
        isPrivate: privateValue,
      };
      // console.log(input)
      if (input) await UpdateBoard.mutateAsync(input);
    } else {
      console.error('Form not found');
    }
  }

  let avatar;
  if (boardData && boardData[0].user) {
    avatar = boardData[0].user.avatarUrl;
  }
  return (
    <>
      <div className="mb-10 mt-5 flex w-full flex-col items-center justify-center gap-px">
        <section className="mb-2 flex w-full flex-col items-center justify-center">
          <div>
            <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold">
              {board?.title}
              {isAuthenticated && username === user?.username && (
                <Button
                  ref={drawerButtonRef}
                  onClick={onDrawerOpen}
                  padding="0"
                  margin="0"
                  rounded="100%"
                >
                  <EditIcon />
                </Button>
              )}
            </h1>
          </div>
          <h2>{board?.pinCount} pins</h2>
        </section>

        <div className="aspect-square w-20">
          <Link to={`/profile/${username}`} className="font-bold">
            <ProfileAvatar size="5rem" src={avatar} />
          </Link>
        </div>

        <p className="mt-1">
          collection by{' '}
          <Link to={`/profile/${username}`} className="font-bold">
            {username}
          </Link>
        </p>
        <p className="empty:none max-w-[40rem]">{board?.description}</p>
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
              <GridComponentWithUser
                data={data}
                showPins={showPins}
                showUser={true}
                boardId={board.id}
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
              <form
                className="flex w-full flex-auto flex-col items-center justify-center gap-8"
                id="updateBoardForm"
              >
                <input
                  name="boardUser"
                  type="hidden"
                  value={board?.user?.id}
                ></input>
                <input name="boardId" type="hidden" value={board?.id}></input>
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
                <FormControl id="isPrivate">
                  <div className="flex w-full flex-wrap items-center justify-end">
                    <FormLabel
                      htmlFor="isPrivate"
                      padding="0"
                      margin="0"
                      marginRight=".5rem"
                    >
                      Private
                    </FormLabel>
                    <Switch
                      id="isPrivate"
                      name="isPrivate"
                      padding="0"
                      margin="0"
                      defaultChecked={board?.isPrivate}
                    />
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
                  type="button"
                  bg="actions.pink.50"
                  color="white"
                  width="100%"
                  _hover={{ background: 'actions.pink.100' }}
                  onClick={handleUpdateBoard}
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
            <section className="items-wrap flex flex-col">
              <ModalHeader>
                <h1 className="text-pretty text-xl">
                  Are you sure you want to delete &ldquo;
                  <span className="font-bold">{board?.title}</span>&rdquo;?
                </h1>
              </ModalHeader>
              <ModalFooter>
                <div className="flex gap-4 self-end">
                  <Button
                    bg="actions.pink.50"
                    color="white"
                    _hover={{ background: 'actions.pink.100' }}
                    onClick={handleBoardDelete}
                  >
                    Yes
                  </Button>
                  <Button onClick={onModalClose}>No</Button>
                </div>
              </ModalFooter>
            </section>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
