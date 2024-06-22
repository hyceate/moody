import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchData, endpoint } from '@/query/fetch';
import {
  fetchPinsByUserBoards,
  fetchUserBoards,
  fetchUserData,
} from '@/query/queries';
import { Board, Pin, User } from '@/@types/interfaces';
import {
  Button,
  Modal,
  ModalContent,
  ModalOverlay,
  Spinner,
  useDisclosure,
} from '@chakra-ui/react';
import { CreateBoard } from '@/components/createBoard';
import { useAuth } from '@/context/authContext';
import { AddIcon, LockIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';

export const SavedBoards = ({ username }: { username: string | undefined }) => {
  const { isAuthenticated, user } = useAuth();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [showBoards, setShowBoards] = useState(false);
  const userData = useQuery<User>({
    queryKey: ['user', username, endpoint],
    queryFn: () =>
      fetchData<{ userByName: User }>(endpoint, fetchUserData, {
        name: username,
      }).then((data) => data.userByName),
    enabled: !!username,
  });
  const savedPinsData = useQuery<Pin[]>({
    queryKey: ['savedPins', username, endpoint, userData.data?.id],
    queryFn: () =>
      fetchData<{ pinsByUserBoards: Pin[] }>(endpoint, fetchPinsByUserBoards, {
        userId: userData.data?.id,
      })
        .then((data) => {
          if (data && data.pinsByUserBoards) {
            return data.pinsByUserBoards;
          }
          return [];
        })
        .catch((error) => {
          console.error('Error fetching pins:', error);
          return [];
        }),
    enabled: !!username && userData.isSuccess,
  });
  const boardData = useQuery<Board[]>({
    queryKey: ['boards', username, endpoint, userData.data?.id],
    queryFn: () =>
      fetchData<{ boardsByUser: Board[] }>(endpoint, fetchUserBoards, {
        user_Id: userData.data?.id,
      }).then((data) => data.boardsByUser),
    enabled: !!username && userData.isSuccess,
  });
  useEffect(() => {
    if (boardData.isSuccess) {
      setTimeout(() => {
        setShowBoards(true);
      }, 200);
    }
  }, [boardData]);

  if (boardData.isLoading) {
    return (
      <div className="flex justify-center">
        <Spinner size="xl"></Spinner>
      </div>
    );
  }
  return (
    <>
      {userData.data && isAuthenticated && userData.data.id === user?.id && (
        <div className="mb-4 flex w-full justify-end px-8">
          <Button padding="0" onClick={onOpen}>
            <AddIcon boxSize={6} />
          </Button>
        </div>
      )}
      <div className="justfiy-center flex flex-col items-stretch max-lg:px-4 lg:px-16">
        {savedPinsData.data &&
          savedPinsData.data.length < 1 &&
          boardData.data &&
          boardData.data.length < 1 && (
            <div className="flex flex-col items-center justify-center text-center">
              No boards to share <br />
              TT _ TT
            </div>
          )}
        <div
          className={` fadeIn ${showBoards ? 'loaded' : ''} flex flex-wrap items-stretch justify-center gap-2`}
        >
          {savedPinsData.data && savedPinsData.data?.length > 1 && (
            <Link to={`/profile/${username}/pins`}>
              <div className="board-grid-item h-full">
                <div className="boardImages h-[156px] w-[238px] ">
                  <div className="board-picture flex aspect-video size-full items-center justify-center gap-px overflow-hidden rounded-2xl">
                    <div className="board-large-img aspect-square w-[156px] overflow-hidden bg-slate-200">
                      {savedPinsData.data[0] && (
                        <img
                          key={savedPinsData.data[0].id}
                          src={savedPinsData.data[0].imgPath}
                          alt={
                            savedPinsData.data[0].title ||
                            savedPinsData.data[0].description
                          }
                          className="aspect-square h-auto w-full object-cover"
                        />
                      )}
                    </div>
                    <div
                      id="board-small-imgs"
                      className="flex flex-col flex-nowrap gap-px self-start overflow-hidden bg-slate-200"
                    >
                      {savedPinsData.data[1] ? (
                        <img
                          key={savedPinsData.data[1].id}
                          src={savedPinsData.data[1].imgPath}
                          alt={
                            savedPinsData.data[1].title ||
                            savedPinsData.data[1].description
                          }
                          className={`aspect-square w-full max-w-[4.85rem] object-cover`}
                        />
                      ) : (
                        <div className="aspect-square w-full max-w-[4.85rem] bg-slate-200"></div>
                      )}
                      {savedPinsData.data[2] ? (
                        <img
                          key={savedPinsData.data[2].id}
                          src={savedPinsData.data[2].imgPath}
                          alt={
                            savedPinsData.data[2].title ||
                            savedPinsData.data[2].description
                          }
                          className={`aspect-square w-full max-w-[4.85rem] object-cover`}
                        />
                      ) : (
                        <div className="aspect-square w-full max-w-[4.85rem] bg-slate-200"></div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <h2 className="font-semibold">All Saved Pins</h2>
                  <p>{savedPinsData.data.length} pins</p>
                </div>
              </div>
            </Link>
          )}
          {boardData.data?.map((board) => (
            <>
              {!board.isPrivate ||
              (isAuthenticated && board.user.id === user?.id) ? (
                <Link to={`/${username}/${board.url}`} key={board.id}>
                  <div className="board-grid-item relative h-full">
                    {board.isPrivate && (
                      <div
                        id="privateIndicator"
                        className="absolute right-0 m-2 flex aspect-square items-center justify-center rounded-full bg-slate-50 p-2"
                      >
                        <LockIcon />
                      </div>
                    )}
                    <div className="boardImages h-[156px] w-[238px] ">
                      <div className="board-picture flex aspect-video size-full items-center justify-center gap-px overflow-hidden rounded-2xl">
                        <div className="board-large-img aspect-square w-[156px] overflow-hidden bg-slate-200">
                          {board.pins[0] && (
                            <img
                              key={board.pins[0].id}
                              src={board.pins[0].imgPath}
                              alt={
                                board.pins[0].title || board.pins[0].description
                              }
                              className="aspect-square h-auto w-full object-cover"
                            />
                          )}
                        </div>
                        <div
                          id="board-small-imgs"
                          className="flex flex-col flex-nowrap items-stretch justify-between gap-px self-start overflow-hidden "
                        >
                          {board.pins[1] ? (
                            <img
                              key={board.pins[1].id}
                              src={board.pins[1].imgPath}
                              alt={
                                board.pins[1].title || board.pins[1].description
                              }
                              className={`aspect-square w-full max-w-[4.85rem] object-cover`}
                            />
                          ) : (
                            <div className="aspect-square w-[4.85rem] bg-slate-200"></div>
                          )}
                          {board.pins[2] ? (
                            <img
                              key={board.pins[2].id}
                              src={board.pins[2].imgPath}
                              alt={
                                board.pins[2].title || board.pins[2].description
                              }
                              className={`aspect-square max-w-[4.85rem] object-cover`}
                            />
                          ) : (
                            <div className="aspect-square w-[4.85rem] bg-slate-200"></div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <h2 className="font-semibold">{board.title}</h2>
                      <p>{board.pinCount} pins</p>
                    </div>
                  </div>
                </Link>
              ) : null}
            </>
          ))}
          <div className="mt-30 w-[238px] flex-[0_1_238px]"></div>
          <div className="mt-30 w-[238px] flex-[0_1_238px]"></div>
          <div className="mt-30 w-[238px] flex-[0_1_238px]"></div>
        </div>
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
          <ModalOverlay />

          <ModalContent rounded="1rem" overflow="hidden">
            <div className="size-full border p-5">
              <CreateBoard onClose={onClose} />
            </div>
          </ModalContent>
        </Modal>
      </div>
    </>
  );
};
