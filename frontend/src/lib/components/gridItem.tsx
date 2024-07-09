import { Box, Flex, Image as Img } from 'gestalt';
import { Link } from 'react-router-dom';
import { handleSaveScrollPos } from '@/actions/scroll';
import { Board, Pin as Pins } from '@/@types/interfaces';
import './css/gestalt.css';
import { ProfileAvatar } from './avatar';
import { useAuth } from '@/context/authContext';
import { CloseIcon, EditIcon } from '@chakra-ui/icons';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Modal,
  ModalContent,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { EditPin } from './editPin';
import { DeleteFromBoard } from './deleteFromBoard';

// *
export const GridComponentWithUser = ({
  data,
  showPins,
  showUser,
  board,
}: {
  data: Pins;
  showPins: boolean;
  showUser: boolean;
  board?: Board | null;
}) => {
  const { isAuthenticated, user } = useAuth();
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();
  const {
    isOpen: drawerIsOpen,
    onOpen: drawerOnOpen,
    onClose: drawerOnClose,
  } = useDisclosure();

  return (
    <div className={`fadeIn ${showPins ? 'loaded' : ''} will-change-transform`}>
      <Box rounding={8} marginBottom={3}>
        <Flex direction="column">
          <Flex.Item>
            <div id="pinImageContainer" className="group relative">
              {isAuthenticated && board && (
                <div className="absolute right-0 z-10 m-1 flex flex-row gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    className="flex aspect-square items-center rounded-full bg-slate-100 p-2 hover:bg-action hover:text-white active:bg-action active:text-white"
                    onClick={drawerOnOpen}
                  >
                    <EditIcon />
                  </button>
                  <button
                    type="button"
                    className="flex aspect-square items-center rounded-full bg-slate-100 p-2 hover:bg-action hover:text-white active:bg-action active:text-white"
                    onClick={onModalOpen}
                  >
                    <CloseIcon />
                  </button>
                </div>
              )}

              <Link to={`/pin/${data.id}`} onClick={handleSaveScrollPos}>
                {data && (
                  <Box rounding={5} overflow="hidden">
                    <Img
                      src={data.imgPath}
                      alt={data.title || data.description || 'Image'}
                      loading="auto"
                      naturalWidth={data.imgWidth}
                      naturalHeight={data.imgHeight}
                    />
                  </Box>
                )}
              </Link>
              <section className="flex flex-col gap-[2px] px-1 pt-2">
                {data.title && (
                  <>
                    <Link to={`/pin/${data.id}`}>
                      <h1 className="font-semibold hover:text-[#76abae] active:text-[#76abae]">
                        {data.title}
                      </h1>
                    </Link>
                  </>
                )}
                {showUser && (
                  <Link
                    to={`/profile/${data.user.username}`}
                    className="flex flex-row items-center gap-2 hover:underline"
                  >
                    <div className="aspect-square w-8">
                      <ProfileAvatar size="2rem" src={data.user.avatarUrl} />
                    </div>
                    <h2 className="text-[0.8rem]">{data.user.username}</h2>
                  </Link>
                )}
              </section>
            </div>
          </Flex.Item>
        </Flex>
      </Box>
      {board && (
        <>
          <Modal
            isOpen={isModalOpen}
            onClose={onModalClose}
            size="xl"
            isCentered
          >
            <ModalOverlay />
            <ModalContent rounded="1rem" overflow="hidden">
              <div className="size-full border p-5">
                <DeleteFromBoard
                  pin={data}
                  board={board}
                  onClose={onModalClose}
                />
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
                <EditPin
                  user={user}
                  pin={data}
                  board={data?.boards[0]?.board}
                  onClose={drawerOnClose}
                />
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </>
      )}
    </div>
  );
};
