import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchData } from '@/query/fetch';
import { fetchPinData } from '@/query/queries';
import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
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
} from '@chakra-ui/react';
import { ExternalLinkIcon, EditIcon } from '@chakra-ui/icons';
import { useAuth } from '@/context/authContext';
import { GraphQLClient } from 'graphql-request';
import { ProfileAvatar } from '@/components/avatar';
import { Pin as PinDetails } from '@/@types/interfaces';
import { EditPin } from '@/components/editpin';

interface DeleteResponse {
  deletePin: {
    success: boolean;
    message: string;
    errorType: string;
  };
}
const deletePin = `
  mutation deletePin($id: ID!){
    deletePin(id: $id){
    success
    message
    }
}`;
const endpoint = 'http://localhost:3000/api/graphql';
const createGraphQLClient = () => {
  return new GraphQLClient(endpoint, {
    credentials: 'include',
  });
};

export default function Pin() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const {
    isOpen: drawerIsOpen,
    onOpen: drawerOnOpen,
    onClose: drawerOnClose,
  } = useDisclosure();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<PinDetails>({
    queryKey: ['pinDetails', id],
    queryFn: () =>
      fetchData<{ pin: PinDetails }>(fetchPinData, { id }).then(
        (data) => data.pin,
      ),
  });
  const deletePinMutation = useMutation({
    mutationFn: async (id: string) => {
      const client = createGraphQLClient();
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
  useEffect(() => {
    document.title = `${data?.title || `${user?.username}'s pin`}`;
    window.scrollTo(0, 0);
  });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const secondaryImgContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data?.imgPath && imageContainerRef.current) {
      const img = new Image();
      img.src = data.imgPath;
      img.onload = () => {
        const aspectRatio = data.imgWidth / data.imgHeight;
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
  }, [data]);

  useEffect(() => {
    if (!isLoading && data) {
      document.querySelectorAll('.fadeIn').forEach((element) => {
        element.classList.remove('loaded');
        setTimeout(() => {
          element.classList.add('loaded');
        }, 0);
      });
    }
  }, [isLoading, data]);

  if (isLoading)
    return (
      <div className="size-full flex-auto">
        <div className="flex size-full h-[80dvh] flex-auto flex-col items-center justify-center">
          <Spinner boxSize="15rem"></Spinner>
        </div>
      </div>
    );

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="relative flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-5">
      <section
        id="pin-container"
        className="fadeIn relative mb-5 mt-3 flex size-full max-w-[63.5rem] flex-row flex-wrap justify-center rounded-[2rem] bg-white max-[1055px]:max-w-[31.75rem]"
        style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 20px 0px' }}
      >
        {!isLoading && data && (
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
                    src={data?.imgPath}
                    className="w-full rounded-[inherit] object-contain"
                    loading="eager"
                    alt={data?.title || data?.description || 'Image'}
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
                    <div id="actions_menu" className="">
                      <Menu>
                        <MenuButton as={Button} padding="0" margin="0">
                          <div className="mb-3 p-0 text-3xl">...</div>
                        </MenuButton>
                        <MenuList>
                          {data &&
                            isAuthenticated &&
                            data.user.id === user?.id && (
                              <MenuItem as="button" onClick={drawerOnOpen}>
                                Edit Pin
                                <EditIcon ml="5px" />
                              </MenuItem>
                            )}
                          <MenuItem>
                            <a href={`${data.imgPath}`} download>
                              Download Image
                            </a>
                          </MenuItem>
                          {data &&
                            isAuthenticated &&
                            data.user.id === user?.id && (
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
                    </div>
                  </div>
                </div>

                <div
                  id="pin_contents"
                  className="flex h-full flex-col overflow-auto"
                >
                  <div className="mt-4 flex flex-auto flex-col gap-8 pr-8">
                    {data?.link && (
                      <div id="pinLink" className="">
                        <a
                          href={`${data.link}`}
                          className="flex min-w-0 underline underline-offset-4"
                        >
                          <ExternalLinkIcon boxSize={6} marginInline={1} />
                          <h1 className="flex-1 truncate">{data.link}</h1>
                        </a>
                      </div>
                    )}
                    <div id="pin_desc" className="pr-2 empty:hidden">
                      {data?.title && (
                        <div id="pinTitle" className="">
                          <h1 className="text-4xl font-bold">{data.title}</h1>
                        </div>
                      )}
                      {data?.description && (
                        <div id="pinDesc" className="">
                          <p className="text-balance text-lg">
                            {data.description}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-row flex-wrap items-center gap-5">
                      <Link
                        to={`/profile/${data.user.username}`}
                        className="flex flex-row flex-wrap items-center gap-5"
                      >
                        <ProfileAvatar size="4rem" src={data.user.avatarUrl} />
                        <h1 className="text-xl">{data.user.username}</h1>
                      </Link>
                    </div>
                    <div className="">
                      <h1 className="text-xl font-medium">Comments</h1>
                      {data.comments.length < 1 && (
                        <div className="my-5">No Comments yet!</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div
                id="comments_container"
                className="sticky bottom-0 z-[2] rounded-[0_0_2rem_0] border border-x-0 border-y-2 border-b-0 border-slate-300 bg-white p-5"
              >
                <form className="max-w-full px-1">
                  <label htmlFor="comment" className="text-xl font-medium">
                    What do you think?
                  </label>
                  <div className="mt-3 flex flex-row items-stretch rounded-[24px] p-2 outline outline-1 outline-slate-300 focus-within:outline-slate-500">
                    <textarea
                      id="comment"
                      name="comment"
                      className="h-auto w-full grow resize-none overflow-hidden whitespace-pre-wrap text-wrap break-words py-2 pr-2 outline-none"
                      rows={1}
                      minLength={3}
                      maxLength={250}
                      onInput={(e) => {
                        const textarea = e.currentTarget;
                        textarea.style.height = 'auto';
                        textarea.style.height = `${textarea.scrollHeight}px`;
                      }}
                      placeholder="Add a Comment"
                    ></textarea>
                    <div className="inset-y-0 right-0 flex items-center">
                      <button
                        type="submit"
                        className="mr-3 rounded-lg bg-rose-500 p-2 font-bold text-white "
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </section>
      <Drawer
        isOpen={drawerIsOpen}
        onClose={drawerOnClose}
        placement="right"
        size="sm"
      >
        <DrawerOverlay></DrawerOverlay>
        <DrawerContent>
          <DrawerBody>
            <EditPin user={user} pin={data} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
