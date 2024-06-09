import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../../query/fetch';
import { fetchPinData } from '../../query/queries';
import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../../components/css/transitions.css';
import { Avatar } from '@chakra-ui/react';
import { Button, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { useAuth } from '../../context/authContext';

interface User {
  id: string;
  username: string;
}
interface Pin {
  id: string;
  title: string;
  description: string;
  link: string;
  imgPath: string;
  user: User;
}
export default function Pin() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const endpoint = 'http://localhost:3000/api/graphql';
  const { data, isLoading, error } = useQuery<Pin>({
    queryKey: ['pinDeets', id, endpoint, fetchPinData],
    queryFn: () =>
      fetchData<{ pin: Pin }>(endpoint, fetchPinData, { id }).then(
        (data) => data.pin,
      ),
  });

  const imageContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (data?.imgPath && imageContainerRef.current) {
      const img = new Image();
      img.src = data.imgPath;
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const container = imageContainerRef.current;

        if (container) {
          // Add null check for container
          container.classList.remove(
            'portrait-image',
            'landscape-image',
            'square-image',
          );

          if (aspectRatio < 1) {
            // Portrait
            container.style.padding = '0';
            container.style.borderRadius = '16px';
            container.classList.add('portrait-image');
          } else if (aspectRatio > 1) {
            // Landscape
            container.style.padding = '20px';
            container.style.borderRadius = '16px';
            container.classList.add('landscape-image');
            const image = container.querySelector('img');
            if (image) {
              image.style.borderRadius = container.style.borderRadius;
            }
          } else {
            // Square
            container.style.padding = '15px';
            container.style.borderRadius = '16px';
            container.classList.add('square-image');
            const image = container.querySelector('img');
            if (image) {
              image.style.borderRadius = container.style.borderRadius;
            }
          }
          container.style.paddingBottom = `${(1 / aspectRatio) * 100}%`;
        }
      };
    }
  }, [data]);

  useEffect(() => {
    if (!isLoading && data) {
      document.querySelectorAll('.fadeIn').forEach((element) => {
        element.classList.remove('loaded'); // Remove the class first to reset the state
        setTimeout(() => {
          element.classList.add('loaded'); // Add the class back to trigger the animation
        }, 0);
      });
    }
  }, [isLoading, data]);
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex flex-1 flex-col w-full justify-center items-center px-5 max-w-[72rem]">
      <section
        id="pin-container"
        className="flex flex-wrap flex-row justify-center bg-white drop-shadow-xl max-[1024px]:max-w-[508px] w-full max-w-[63.5rem] rounded-[2rem] overflow-hidden fadeIn mt-5 gap-0"
        style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 20px 0px' }}
      >
        {!isLoading && data ? (
          <>
            <div
              id="closeup"
              className="flex flex-auto w-full max-w-[508px] justify-center items-center relative rounded-[32px_0_0_32px]"
            >
              <div
                id="image-container"
                className="h-auto w-full rounded-[1rem]"
                ref={imageContainerRef}
                style={{ paddingBottom: '150%' }}
              >
                <div id="closeup-image" className="w-full h-auto relative">
                  <img
                    src={data?.imgPath}
                    className="absolute  w-full h-auto top-0 left-0"
                    loading="lazy"
                    alt={data?.title || data?.description || 'Image'}
                  />
                </div>
              </div>
            </div>
            <div
              id="pin_details"
              className="flex flex-1 w-full max-h-[740px] px-5 max-w-[508px]"
            >
              <ul className="flex flex-col pt-5 max-h-[740px] overflow-scroll">
                <li className="w-full pt-3 text-xl">
                  <Menu>
                    <MenuButton as={Button} padding="0" margin="0">
                      <div className="text-3xl p-0 mb-3">...</div>
                    </MenuButton>
                    <MenuList>
                      {isAuthenticated && <MenuItem>Edit Pin</MenuItem>}
                      <MenuItem>
                        <a href={`${data.imgPath}`} download>
                          Download Image
                        </a>
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </li>

                <li id="pinLink" className="my-5">
                  {data?.link && (
                    <a
                      href={`${data.link}`}
                      className="flex underline underline-offset-4 min-w-0"
                    >
                      <ExternalLinkIcon boxSize={6} marginInline={1} />
                      <h1 className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                        {data.link}
                      </h1>
                    </a>
                  )}
                </li>

                <li id="pinTitle" className="mb-5">
                  {data?.title && (
                    <h1 className="text-4xl font-bold">{data.title}</h1>
                  )}
                </li>

                <li id="pinDesc" className="">
                  {data?.description && (
                    <p className="text-2xl pr-2 text-balance">
                      {data.description}
                    </p>
                  )}
                </li>

                <li className="flex flex-wrap flex-row items-center gap-5 py-5">
                  <Link
                    to={`/profile/${data.user.username}`}
                    className="flex flex-wrap flex-row items-center gap-5"
                  >
                    <Avatar></Avatar>
                    {data.user.username}
                  </Link>
                </li>
              </ul>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
