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

interface User {
  id: string;
  username: string;
  avatarUrl: string;
}
interface Pin {
  id: string;
  title: string;
  description: string;
  link: string;
  imgPath: string;
  user: User;
  comments: [string];
}
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
  const { data, isLoading, error } = useQuery<Pin>({
    queryKey: ['pinDeets', id, endpoint, fetchPinData],
    queryFn: () =>
      fetchData<{ pin: Pin }>(endpoint, fetchPinData, { id }).then(
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
  const imageContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (data?.imgPath && imageContainerRef.current) {
      const img = new Image();
      img.src = data.imgPath;
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const container = imageContainerRef.current;
        if (container) {
          container.classList.remove(
            'portrait-image',
            'landscape-image',
            'square-image',
          );
          if (aspectRatio < 0.8) {
            // Portrait
            container.style.padding = '0';
            container.style.borderRadius = '16px';
            container.classList.add('portrait-image');
            container.style.paddingBottom = `0`;
          } else if (aspectRatio > 1) {
            // Landscape
            container.style.padding = '20px';
            container.style.borderRadius = '16px';
            container.classList.add('landscape-image');
            const image = container.querySelector('img');
            if (image) {
              image.style.borderRadius = container.style.borderRadius;
            }
            container.style.paddingBottom = `${(1 / aspectRatio) * 100}%`;
          } else {
            // Square
            container.style.padding = '15px';
            container.style.borderRadius = '16px';
            container.classList.add('square-image');
            const image = container.querySelector('img');
            if (image) {
              image.style.borderRadius = container.style.borderRadius;
            }
            container.style.paddingBottom = `${(1 / aspectRatio) * 100}%`;
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
    <div className="flex flex-1 flex-col w-full justify-center items-center px-5 max-w-[72rem]">
      <section
        id="pin-container"
        className="flex flex-wrap flex-row justify-center bg-white drop-shadow-xl max-[1024px]:max-w-[508px] w-full max-w-[63.5rem] rounded-[2rem] overflow-hidden fadeIn mt-3 gap-0"
        style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 20px 0px' }}
      >
        {!isLoading && data && (
          <>
            <div
              id="closeup"
              className="flex flex-auto w-full max-w-[508px] max-h-[716px] justify-center items-center relative rounded-[32px_0_0_32px]"
            >
              <div
                id="image-container"
                className="self-start h-full w-full rounded-[1rem]"
              >
                <div
                  id="closeup-image"
                  className="w-full max-w-[508px] relative"
                  ref={imageContainerRef}
                >
                  <img
                    src={data?.imgPath}
                    className="w-full max-h-[44.8rem] object-contain"
                    loading="eager"
                    alt={data?.title || data?.description || 'Image'}
                  />
                </div>
              </div>
            </div>

            <div
              id="pin_details"
              className="flex flex-col flex-auto w-full max-w-[508px]"
              style={{ maxHeight: 'calc(-96px + 100dvh)' }}
            >
              <ul className="flex flex-col overflow-scroll gap-8 w-full h-full px-5">
                <li className="flex flex-row justify-between items-center w-full text-xl sticky top-0 bg-white pt-[3rem] z-10">
                  <div className="pb-2 bg-white">
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
                </li>
                <li className="flex flex-col flex-auto gap-8 h-full -mt-2">
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
                </li>
              </ul>
              <div className="z-10 sticky bottom-0 bg-white py-5 px-5 border border-x-0 border-y-1 border-bottom-0 border-slate-300">
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
