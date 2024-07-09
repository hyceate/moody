import {
  Button,
  Divider,
  FormControl,
  FormLabel,
  Modal,
  ModalContent,
  ModalOverlay,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverTrigger,
  Spinner,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { Board, Pin, User } from '@/@types/interfaces';
import { AddIcon, ChevronDownIcon, LockIcon } from '@chakra-ui/icons';
import { client, fetchData } from '@/query/fetch';
import { fetchBoardsForForm, updatePinMutation } from '@/query/queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useState } from 'react';
import { CreateBoard } from './createBoard';
import { DeleteFromBoard } from './deleteFromBoard';

interface UpdatePin {
  user: string;
  id: string;
  title: string;
  description: string;
  link: string;
  currentBoard: string;
  newBoard: string;
}
interface UpdateStatus {
  updatePin: {
    success: boolean;
    message: string;
  };
}
export const EditPin = ({
  user,
  pin,
  board,
  onClose,
}: {
  user: User | null;
  pin: Pin | undefined;
  board?: Board | null;
  onClose?: () => void;
}) => {
  const userId = user?.id;
  const [hasFetched, setHasFetched] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);

  const {
    isOpen: isModalOpen,
    onClose: onModalClose,
    onOpen: onModalOpen,
  } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onClose: onDeleteModalClose,
    onOpen: onDeleteModalOpen,
  } = useDisclosure();
  const {
    isOpen: isPopOverOpen,
    onToggle: onPopOverToggle,
    onClose: onPopOverClose,
  } = useDisclosure();
  const toast = useToast();

  const { data, isSuccess, refetch } = useQuery({
    queryKey: ['boards', userId],
    queryFn: () =>
      fetchData<{ boardsByUser: Board[] }>(fetchBoardsForForm, {
        userId,
      }).then((data) => data.boardsByUser),
    enabled: false,
  });

  const queryClient = useQueryClient();
  const updatePinMutate = useMutation({
    mutationFn: async (input: UpdatePin) => {
      const response: UpdateStatus = await client.request(updatePinMutation, {
        input,
      });
      return response;
    },
    onSuccess: (data) => {
      const updateStatus = data.updatePin;
      queryClient.invalidateQueries({ queryKey: ['pinDetails'] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      if (updateStatus.success === true) {
        toast({
          status: 'success',
          title: 'Pin updated',
          isClosable: true,
          duration: 2000,
        });
      }
    },
  });

  useEffect(() => {
    if (isSuccess && data) {
      const latestBoardId = pin?.boards?.[0]?.board?.id;
      const latestBoard = data.find((board) => board.id === latestBoardId);
      setSelectedBoard(latestBoard || null);
    }
  }, [isSuccess, data, pin]);

  if (!pin || !user) {
    return null;
  }

  const handleBoardSelect = () => {
    onPopOverToggle();
    if (!hasFetched) {
      setHasFetched(true);
    }
    refetch();
  };

  const handleUpdatePin = async (e: FormEvent) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form as HTMLFormElement);
    const id = formData.get('id') as string;
    const user = formData.get('user') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const link = formData.get('link') as string;
    const currentBoard = formData.get('currentBoard') as string;
    const newBoard = formData.get('newBoard') as string;
    const input = {
      user,
      id,
      title,
      description,
      link,
      currentBoard,
      newBoard,
    };
    try {
      await updatePinMutate.mutateAsync(input);
      onClose?.();
    } catch (error) {
      return error;
    }
  };

  return (
    <>
      <form
        id="updatePinForm"
        className="flex w-full flex-col items-center justify-center gap-10 p-5"
        onSubmit={handleUpdatePin}
      >
        <h1 className="text-2xl font-bold">Edit this pin</h1>
        <input type="hidden" name="user" value={user?.id}></input>
        <input type="hidden" name="id" value={pin.id}></input>
        <input
          type="hidden"
          name="currentBoard"
          defaultValue={pin.boards[0]?.board?.id ?? ''}
        ></input>
        <input
          type="hidden"
          name="newBoard"
          defaultValue={selectedBoard?.id ?? ''}
        />

        <FormControl id="title">
          <FormLabel>Title</FormLabel>
          <input
            type="string"
            name="title"
            defaultValue={pin.title}
            className="w-full rounded-3xl p-4 outline outline-1 outline-slate-300"
          ></input>
        </FormControl>

        <FormControl id="description">
          <FormLabel>Description</FormLabel>
          <textarea
            name="description"
            defaultValue={pin.description}
            className="w-full resize-none rounded-3xl p-4 outline outline-1 outline-slate-300"
            rows={2}
            maxLength={350}
            onInput={(e) => {
              const textarea = e.currentTarget;
              textarea.style.height = 'auto';
              textarea.style.height = `${textarea.scrollHeight}px`;
            }}
          ></textarea>
        </FormControl>

        <FormControl id="link">
          <FormLabel>Link</FormLabel>
          <input
            type="string"
            name="link"
            defaultValue={pin.link}
            className="w-full rounded-3xl p-4 outline outline-1 outline-slate-300"
          ></input>
        </FormControl>

        {pin.boards && (
          <FormControl id="board">
            <FormLabel>Board</FormLabel>
            <Popover isLazy isOpen={isPopOverOpen} onClose={onPopOverClose}>
              <PopoverTrigger>
                <button
                  type="button"
                  onClick={handleBoardSelect}
                  className="flex w-full flex-row flex-wrap items-center justify-between rounded-lg px-5 outline outline-1 outline-slate-300"
                >
                  <h1 id="selectedBoard">
                    {selectedBoard ? selectedBoard.title : null}
                  </h1>
                  <span>
                    <ChevronDownIcon boxSize="1.5rem" />
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent padding="0" margin="0" display="flex">
                <PopoverBody padding="0" maxH="14rem" overflowY="scroll">
                  <div className="items center flex w-full flex-col justify-center gap-px p-2">
                    {!data && (
                      <div>
                        <Spinner size="xl" />
                      </div>
                    )}
                    {data && data?.length < 1 && <div>No boards</div>}
                    {data?.map(
                      (board: {
                        id: string;
                        title: string;
                        pins: Pin[];
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
                <PopoverFooter padding="0" height="100%" flexGrow="auto">
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
          </FormControl>
        )}
        <Button
          type="submit"
          bg="actions.pink.50"
          color="white"
          _hover={{ background: 'actions.pink.100' }}
        >
          Save
        </Button>
      </form>
      {board && (
        <>
          <Divider />
          <div className="flex items-center justify-center">
            <button
              className="my-8 flex items-center justify-center rounded-md font-bold hover:bg-slate-300"
              type="button"
              onClick={onDeleteModalOpen}
            >
              <span className="px-5 py-2">Delete Pin from board?</span>
            </button>
          </div>
        </>
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={onDeleteModalClose}
        size="xl"
        isCentered
      >
        <ModalOverlay />
        <ModalContent rounded="1rem" overflow="hidden">
          <div className="size-full border p-5">
            <DeleteFromBoard
              pin={pin}
              board={board!}
              onClose={onDeleteModalClose}
            />
          </div>
        </ModalContent>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={onModalClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent rounded="1rem" overflow="hidden">
          <div className="size-full border p-5">
            <CreateBoard onClose={onModalClose} />
          </div>
        </ModalContent>
      </Modal>
    </>
  );
};
