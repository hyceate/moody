import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../../components/css/transitions.css';
import { Avatar } from '@chakra-ui/react';
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
  const fetchPinData = `
  query getPin($id: ID!) {
    pin(id: $id) {
      user {
        id
        username
      }
      id
      title
      description
      link
      imgPath
    }
  }
  `;
  const { data, isLoading, error } = useQuery<Pin>({
    queryKey: ['pinDeets', id],
    queryFn: async () => {
      try {
        const endpoint = 'http://localhost:3000/api/graphql';
        const response: { pin: Pin } = await request(endpoint, fetchPinData, {
          id,
        });
        console.log(response.pin);
        return response.pin;
      } catch (error) {
        throw new Error(`Error fetching boards: ${error}`);
      }
    },
  });
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
    <section
      id="pin-container"
      className="flex flex-row gap-10 justify-center bg-white drop-shadow-xl max-w-[60rem] w-full rounded-[1.5rem] overflow-hidden fadeIn"
    >
      {!isLoading && data ? (
        <>
          <div className="flex-auto w-full overflow-hidden max-w-[30rem] ">
            <img
              src={data?.imgPath}
              className=""
              loading="lazy"
              alt={data?.title || data?.description || 'Image'}
            />
          </div>
          <ul className="flex-auto flex flex-col gap-6 py-[2rem]">
            <li className="w-full py-2">Todo Navs</li>
            {data?.title && (
              <li id="pinTitle">
                <h1 className="text-6xl">{data.title}</h1>
              </li>
            )}
            <li className="flex flex-wrap flex-row items-center gap-5">
              <Link
                to={`/profile/${data.user.username}`}
                className="flex flex-wrap flex-row items-center gap-5"
              >
                <Avatar></Avatar>
                {data.user.username}
              </Link>
            </li>
            {data?.description && (
              <li id="pinDesc">
                <p className="text-2xl">{data.description}</p>
              </li>
            )}
          </ul>
        </>
      ) : null}
    </section>
  );
}
