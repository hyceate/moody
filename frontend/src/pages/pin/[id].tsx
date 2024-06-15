import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchData } from '../../query/fetch';
import { fetchPinData } from '../../query/queries';
import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../../components/css/transitions.css';
import { Button, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { ExternalLinkIcon, EditIcon } from '@chakra-ui/icons';
import { useAuth } from '../../context/authContext';
import { GraphQLClient } from 'graphql-request';
import { ProfileAvatar } from '@/components/avatar';
import { Pin as PinDeets } from '@/@types/interfaces';

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
  const { data, isLoading, error } = useQuery<PinDeets>({
    queryKey: ['pinDeets', id, endpoint, fetchPinData],
    queryFn: () =>
      fetchData<{ pin: PinDeets }>(endpoint, fetchPinData, { id }).then(
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
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex flex-1 flex-col w-full justify-center items-center px-5 max-w-[72rem] relative">
      <section
        id="pin-container"
        className="flex flex-row flex-wrap justify-center bg-white max-[1055px]:max-w-[31.75rem] w-full max-w-[63.5rem] h-full rounded-[2rem] fadeIn mt-3 mb-5 relative"
        style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 20px 0px' }}
      >
        {!isLoading && data && (
          <>
            <div
              id="closeup"
              className="flex flex-col flex-auto w-full max-w-[31.75rem] h-full  justify-center items-center relative rounded-[32px_32px_0_0] min-[1055px]:rounded-[32px_0_0_32px] overflow-hidden"
            >
              <div
                id="image-container"
                className="flex flex-col flex-auto h-full w-full relative "
                ref={imageContainerRef}
              >
                <div
                  className="flex flex-col w-full relative"
                  ref={secondaryImgContainer}
                >
                  <img
                    src={data?.imgPath}
                    className="w-full object-contain rounded-[inherit]"
                    loading="eager"
                    alt={data?.title || data?.description || 'Image'}
                  />
                </div>
              </div>
            </div>

            <div
              id="pin_details_container"
              className="flex flex-col w-full max-w-[508px]"
            >
              <div className="flex flex-col flex-auto min-h-0 min-w-0 pl-[2rem]">
                <div
                  id="actions"
                  className="sticky top-[64px] z-[2] bg-white w-full"
                >
                  <div className="min-h-[5.75rem] pt-[2rem]">
                    <div id="actions_menu" className="">
                      <Menu>
                        <MenuButton as={Button} padding="0" margin="0">
                          <div className="text-3xl p-0 mb-3">...</div>
                        </MenuButton>
                        <MenuList>
                          {data &&
                            isAuthenticated &&
                            data.user.id === user?.id && (
                              <MenuItem>
                                <span>Edit Pin</span>
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
                  className="flex flex-col h-full overflow-auto"
                >
                  <div className="flex flex-col flex-auto gap-8 pr-[2rem] mt-4">
                    {data?.link && (
                      <div id="pinLink" className="">
                        <a
                          href={`${data.link}`}
                          className="flex underline underline-offset-4 min-w-0"
                        >
                          <ExternalLinkIcon boxSize={6} marginInline={1} />
                          <h1 className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                            {data.link}
                          </h1>
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
                          <p className="text-lg text-balance">
                            {data.description}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap flex-row items-center gap-5">
                      <Link
                        to={`/profile/${data.user.username}`}
                        className="flex flex-wrap flex-row items-center gap-5"
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
                className="z-[2] sticky bottom-0 bg-white py-5 px-5 border border-x-0 border-y-1 border-b-0 border-slate-300"
              >
                <form className="max-w-full px-1">
                  <label htmlFor="comment" className="text-xl font-medium">
                    What do you think?
                  </label>
                  <div className="flex flex-row items-stretch outline outline-1 outline-slate-300 p-2 rounded-[24px] focus-within:outline-slate-500 mt-3">
                    <div className="py-2 px-2 h-auto text-wrap break-words whitespace-pre-wrap -z-10 w-full select-none overflow-hidden"></div>
                    <textarea
                      id="comment"
                      name="comment"
                      className="-ml-[80%] flex-grow py-2 pr-2 h-auto resize-none w-full text-wrap break-words whitespace-pre-wrap outline-none overflow-hidden"
                      rows={1}
                      minLength={3}
                      maxLength={250}
                      onInput={(event) => {
                        const textarea = event.target as HTMLTextAreaElement;
                        const divElement =
                          textarea.previousElementSibling as HTMLDivElement;
                        if (divElement) {
                          divElement.innerText = textarea.value + '\n';
                        }
                      }}
                      placeholder="Add a Comment"
                    ></textarea>
                    <div className="right-0 top-0 bottom-0 flex items-center">
                      <button
                        type="submit"
                        className="bg-rose-500 text-white font-bold rounded-lg p-2 mr-3 "
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
    </div>
  );
}
