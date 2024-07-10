import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { client, fetchData } from '@/query/fetch';
import {
  fetchBoardsForForm,
  fetchPinData,
  savePinToBoard,
} from '@/query/queries';
import { FormEvent, Suspense, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import '@/components/css/transitions.css';
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Spinner,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverFooter,
  PopoverBody,
  PopoverContent,
  Modal,
  ModalOverlay,
  ModalContent,
  FormControl,
} from '@chakra-ui/react';
import {
  ExternalLinkIcon,
  EditIcon,
  ChevronDownIcon,
  LockIcon,
  AddIcon,
} from '@chakra-ui/icons';
import { useAuth } from '@/context/authContext';
import { ProfileAvatar } from '@/components/avatar';
import { Board, Pin as PinDetails, Pin as Pins } from '@/@types/interfaces';
import { EditPin } from '@/components/editPin';
import { CreateBoard } from '@/components/createBoard';
import { AddComments } from '@/components/addComments';
import { Comments } from '@/components/comments';

interface DeleteResponse {
  deletePin: {
    success: boolean;
    message: string;
  };
}
interface SaveResponse {
  savePinToBoard: {
    success: boolean;
    message: string;
  };
}

const deletePin = `
  mutation deletePin($id: ID!){
    deletePin(id: $id){
    success
    message
    }
}`;

export default function Pin() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const [hasFetched, setHasFetched] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const navigate = useNavigate();
  const {
    isOpen: isModalOpen,
    onClose: onModalClose,
    onOpen: onModalOpen,
  } = useDisclosure();
  const {
    isOpen: isPopOverOpen,
    onToggle: onPopOverToggle,
    onClose: onPopOverClose,
  } = useDisclosure();
  const {
    isOpen: drawerIsOpen,
    onOpen: drawerOnOpen,
    onClose: drawerOnClose,
  } = useDisclosure();
  const toast = useToast();
  const queryClient = useQueryClient();

  const {
    data: boardData,
    isSuccess: boardIsSuccess,
    isPending: boardIsPending,
    refetch,
  } = useQuery({
    queryKey: ['boards', user?.id],
    queryFn: () =>
      fetchData<{ boardsByUser: Board[] }>(fetchBoardsForForm, {
        userId: user?.id,
      }).then((data) => data.boardsByUser),
    enabled: false,
  });

  const {
    data: pinData,
    isLoading: pinIsLoading,
    isError: pinIsError,
  } = useQuery<PinDetails>({
    queryKey: ['pinDetails', id],
    queryFn: () =>
      fetchData<{ pin: PinDetails }>(fetchPinData, { id }).then(
        (data) => data.pin,
      ),
  });

  const savePin = useMutation({
    mutationFn: async ({
      pinId,
      boardId,
    }: {
      pinId: string;
      boardId: string | undefined;
    }) => {
      const response: SaveResponse = await client.request(savePinToBoard, {
        pinId,
        boardId,
      });
      return response;
    },
    onSuccess: (data) => {
      const saveResponse = data.savePinToBoard;
      switch (saveResponse.success) {
        case true:
          toast({
            status: 'success',
            title: saveResponse.message,
          });
          break;
        default:
          toast({
            status: 'error',
            title: saveResponse.message,
          });
          break;
      }
    },
  });
  const handleSavePin = async (e: FormEvent) => {
    e.preventDefault();
    const pinId = id as string;
    const boardId = selectedBoard?.id;
    const input = {
      pinId,
      boardId,
    };
    if (input) await savePin.mutateAsync(input);
  };

  const deletePinMutation = useMutation({
    mutationFn: async (id: string) => {
      const response: DeleteResponse = await client.request(deletePin, {
        id: id,
      });
      return response;
    },
    onSuccess: (data) => {
      const deletedPin = data;
      queryClient.invalidateQueries({ queryKey: ['pins', 'savedPins'] });
      toast({
        status: `success`,
        title: `${deletedPin.deletePin.message}`,
      });
    },
  });
  const handleDelete = async () => {
    if (id) {
      await deletePinMutation.mutateAsync(id);
    }
  };

  const handleBoardSelect = () => {
    onPopOverToggle();
    if (!hasFetched) {
      setHasFetched(true);
      refetch();
    }
  };

  useEffect(() => {
    document.title = `${pinData?.title || `${user?.username}'s pin`}`;
    window.scrollTo(0, 0);
  });

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const secondaryImgContainer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (pinData?.imgPath && imageContainerRef.current) {
      const img = new Image();
      img.src = pinData.imgPath;
      img.onload = () => {
        const aspectRatio = pinData.imgWidth / pinData.imgHeight;
        const container = imageContainerRef.current;
        const secondaryContainer = secondaryImgContainer.current;
        if (container && secondaryContainer) {
          container.classList.remove(
            'portrait-image',
            'landscape-image',
            'square-image',
          );
          container.style.padding = '0';
          if (aspectRatio > 0.7 && aspectRatio < 1) {
            // Portrait
            container.style.padding = '0';
            container.style.borderRadius = '0px';
            container.classList.add('portrait-image');
          } else if (aspectRatio < 0.7) {
            // narrower portrait
            container.style.padding = '1rem';
            container.style.borderRadius = '16px';
            secondaryContainer.style.borderRadius =
              container.style.borderRadius;
            container.classList.add('narrow-portrait-image');
            secondaryContainer.classList.add('self-center');
          } else if (aspectRatio > 1) {
            // Landscape
            container.style.padding = '1rem';
            container.style.borderRadius = '16px';
            secondaryContainer.style.borderRadius =
              container.style.borderRadius;
            container.classList.add('narrow-image');
          } else if (aspectRatio === 1) {
            // Square
            container.style.padding = '15px';
            container.style.paddingRight = '0px';
            container.style.borderRadius = '16px';
            secondaryContainer.style.borderRadius =
              container.style.borderRadius;
            container.classList.add('square-image');
          }
        }
      };
    }
  }, [pinData]);

  useEffect(() => {
    if (boardIsSuccess && boardData) {
      if (pinData?.boards && pinData.boards.length > 0) {
        const latestBoardId = pinData.boards[0].board?.id;
        const latestBoard = boardData.find(
          (board) => board.id === latestBoardId,
        );
        setSelectedBoard(latestBoard || null);
      } else {
        setSelectedBoard(null);
      }
    }
  }, [boardIsSuccess, boardData, pinData?.boards]);

  useEffect(() => {
    if (!pinIsLoading && pinData) {
      document.querySelectorAll('.fadeIn').forEach((element) => {
        element.classList.remove('loaded');
        setTimeout(() => {
          element.classList.add('loaded');
        }, 0);
      });
    }
  }, [pinIsLoading, pinData]);

  if (pinIsLoading)
    return (
      <div className="size-full flex-auto">
        <div className="flex size-full h-[80dvh] flex-auto flex-col items-center justify-center">
          <Spinner boxSize="15rem"></Spinner>
        </div>
      </div>
    );

  if (pinIsError) {
    navigate('/');
    toast({ status: 'error', title: 'unable to find pin' });
  }

  return (
    <div className="relative flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-5">
      <section
        id="pin-container"
        className="fadeIn relative mb-5 mt-3 flex size-full max-w-[63.5rem] flex-row flex-wrap justify-center rounded-[2rem] bg-white max-[1055px]:max-w-[31.75rem]"
        style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 20px 0px' }}
      >
        {!pinIsLoading && pinData && (
          <>
            <div
              id="closeup"
              className="relative flex size-full max-w-[31.75rem] flex-auto flex-col items-center justify-center overflow-hidden rounded-[32px_32px_0_0] min-[1055px]:rounded-[32px_0_0_32px]"
            >
              <div
                id="image-container"
                className="relative flex size-full flex-auto flex-col "
                ref={imageContainerRef}
              >
                <div
                  className="relative flex w-full flex-col"
                  ref={secondaryImgContainer}
                >
                  <img
                    src={pinData?.imgPath}
                    className="w-full rounded-[inherit] object-contain"
                    loading="eager"
                    alt={pinData?.title || pinData?.description || 'Image'}
                  />
                </div>
              </div>
            </div>

            <div
              id="pin_details_container"
              className="flex w-full max-w-[508px] flex-col"
            >
              <div className="flex min-h-0 min-w-0 flex-auto flex-col pl-8">
                <div
                  id="actions"
                  className="sticky top-[64px] z-[2] w-full rounded-[0_2rem_0_0] bg-white"
                >
                  <div className="min-h-[5.75rem] pt-8">
                    <div
                      id="actions_menu"
                      className="flex flex-row justify-between pr-10"
                    >
                      <Menu>
                        <MenuButton as={Button} padding="0" margin="0">
                          <div className="mb-3 p-0 text-3xl">...</div>
                        </MenuButton>
                        <MenuList>
                          {pinData &&
                            isAuthenticated &&
                            pinData.user.id === user?.id && (
                              <MenuItem as="button" onClick={drawerOnOpen}>
                                Edit Pin
                                <EditIcon ml="5px" />
                              </MenuItem>
                            )}
                          <MenuItem>
                            <a href={`${pinData.imgPath}`} download>
                              Download Image
                            </a>
                          </MenuItem>
                          {pinData &&
                            isAuthenticated &&
                            pinData.user.id === user?.id && (
                              <MenuItem
                                as={Button}
                                justifyContent="start"
                                bg="actions.pink.50"
                                color="white"
                                _hover={{
                                  background: 'actions.pink.100',
                                }}
                                onClick={() => handleDelete()}
                              >
                                Delete Pin
                              </MenuItem>
                            )}
                        </MenuList>
                      </Menu>
                      {isAuthenticated && (
                        <form>
                          <FormControl
                            id="boards"
                            className="flex flex-row gap-1"
                          >
                            <Popover
                              isLazy
                              isOpen={isPopOverOpen}
                              onClose={onPopOverClose}
                            >
                              <PopoverTrigger>
                                <button
                                  type="button"
                                  className="flex w-full min-w-36 flex-row flex-wrap items-center justify-between rounded-lg px-5 outline outline-1 outline-slate-300"
                                  onClick={handleBoardSelect}
                                >
                                  <h1 id="selectedBoard">
                                    {selectedBoard ? selectedBoard.title : null}
                                  </h1>
                                  <span>
                                    <ChevronDownIcon boxSize="1.5rem" />
                                  </span>
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                padding="0"
                                margin="0"
                                display="flex"
                              >
                                <PopoverBody
                                  padding="0"
                                  maxH="14rem"
                                  overflowY="scroll"
                                >
                                  <div className="items center flex w-full flex-col justify-center gap-px p-2">
                                    {!boardData && (
                                      <div>
                                        <Spinner size="xl" />
                                      </div>
                                    )}
                                    {boardData && boardData?.length < 1 && (
                                      <div>No boards</div>
                                    )}

                                    {boardData?.map(
                                      (board: {
                                        id: string;
                                        title: string;
                                        pins: Pins[];
                                        isPrivate: boolean;
                                      }) => (
                                        <button
                                          type="button"
                                          className="flex w-full"
                                          key={board.id}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            setSelectedBoard(board);
                                            onPopOverToggle();
                                          }}
                                        >
                                          <div className="flex w-full flex-row flex-wrap items-center gap-4 rounded-md p-2 hover:bg-slate-200">
                                            <div className="aspect-square w-12 overflow-hidden rounded-md">
                                              {board.pins.length > 0 && (
                                                <img
                                                  src={board.pins[0].imgPath}
                                                  alt={`Board ${board.title}`}
                                                />
                                              )}
                                            </div>
                                            <span className="flex w-full flex-1 items-start font-bold">
                                              {board.title}
                                            </span>
                                            {board.isPrivate && (
                                              <span className="">
                                                <LockIcon />
                                              </span>
                                            )}
                                          </div>
                                        </button>
                                      ),
                                    )}
                                  </div>
                                </PopoverBody>
                                <PopoverFooter
                                  padding="0"
                                  height="100%"
                                  flexGrow="auto"
                                >
                                  <div className="flex w-full justify-end">
                                    <Button
                                      type="button"
                                      paddingX="20px"
                                      paddingY="10px"
                                      width="100%"
                                      onClick={onModalOpen}
                                      display="flex"
                                      height="100%"
                                      justifyContent="start"
                                      gap="20px"
                                      bg="transparent"
                                    >
                                      <span className="rounded-full bg-action p-2 text-white">
                                        <AddIcon boxSize={6} />
                                      </span>
                                      <h1>Create a board</h1>
                                    </Button>
                                  </div>
                                </PopoverFooter>
                              </PopoverContent>
                            </Popover>
                            <button
                              type="button"
                              className="text-nowrap rounded-md bg-rose-500 p-2 font-bold text-white hover:bg-rose-600 disabled:bg-rose-200 disabled:text-black"
                              onClick={handleSavePin}
                              disabled={boardIsPending}
                            >
                              Save
                            </button>
                          </FormControl>
                        </form>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  id="pin_contents"
                  className="flex h-full max-h-[30.25rem] flex-col overflow-y-auto"
                >
                  <div className="mt-4 flex flex-auto flex-col gap-8 pr-8">
                    {pinData?.link && (
                      <div id="pinLink" className="">
                        <a
                          href={`${pinData.link}`}
                          className="flex min-w-0 underline underline-offset-4"
                        >
                          <ExternalLinkIcon boxSize={6} marginInline={1} />
                          <h1 className="flex-1 truncate">{pinData.link}</h1>
                        </a>
                      </div>
                    )}
                    <div id="pin_desc" className="pr-2 empty:hidden">
                      {pinData?.title && (
                        <div id="pinTitle" className="">
                          <h1 className="text-4xl font-bold">
                            {pinData.title}
                          </h1>
                        </div>
                      )}
                      {pinData?.description && (
                        <div id="pinDesc" className="">
                          <p className="text-balance text-lg">
                            {pinData.description}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-row flex-wrap items-center gap-5">
                      <Link
                        to={`/profile/${pinData.user.username}`}
                        className="flex flex-row flex-wrap items-center gap-5"
                      >
                        <ProfileAvatar
                          size="4rem"
                          src={pinData.user.avatarUrl}
                        />
                        <h1 className="text-xl">{pinData.user.username}</h1>
                      </Link>
                    </div>
                    <div id="commentsContainer" className="">
                      <h1 className="text-xl font-medium">Comments</h1>
                      <Suspense fallback={<Spinner />}>
                        <Comments pin={pinData} />
                      </Suspense>
                    </div>
                  </div>
                </div>
              </div>

              <AddComments pin={pinData} />
            </div>
          </>
        )}
      </section>

      <Modal isOpen={isModalOpen} onClose={onModalClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent rounded="1rem" overflow="hidden">
          <div className="size-full border p-5">
            <CreateBoard onClose={onModalClose} />
          </div>
        </ModalContent>
      </Modal>
      <Drawer
        isOpen={drawerIsOpen}
        onClose={drawerOnClose}
        placement="right"
        size="sm"
      >
        <DrawerOverlay></DrawerOverlay>
        <DrawerContent>
          <DrawerBody>
            <EditPin user={user} pin={pinData} onClose={drawerOnClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
