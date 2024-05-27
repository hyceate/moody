import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Skeleton } from '@chakra-ui/react';
import { Masonry } from 'masonic';
interface User {
  id: string;
  username: string;
}
interface Pins {
  id: string;
  title: string;
  description: string;
  imgPath: string;
  user: User;
}
interface PinsResponse {
  pins: Pins[];
}
const AllPins = () => {
  const fetchPinsSchema = `
  query GetPins {
    pins {
      id
      title
      description
      imgPath
      user{
        username
        id
      }
    }
  }
  `;
  const { data, isLoading, error } = useQuery({
    queryKey: ['allpins'],
    queryFn: async () => {
      try {
        const endpoint = 'http://localhost:3000/api/graphql';
        const response: PinsResponse = await request(endpoint, fetchPinsSchema);
        return response.pins;
      } catch (error) {
        throw new Error(`Error fetching pins: ${error}`);
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
  }, [data, isLoading]);

  if (isLoading)
    return (
      <div
        id="index-pins"
        className="w-full h-full flex justify-center items-center"
      >
        <Skeleton height="700px" />
        <Skeleton height="300px" />
        <Skeleton height="400px" />
        <Skeleton height="700px" />
        <Skeleton height="300px" />
        <Skeleton height="400px" />
        <Skeleton height="700px" />
        <Skeleton height="300px" />
        <Skeleton height="400px" />
        Loading...
      </div>
    );
  if (error) return <div>Error: {error.message}</div>;

  return (
    <section
      id="index-pins"
      className="w-full px-[9rem] max-lg:px-0 flex flex-row flex-wrap "
    >
      {data && data.length > 0 ? (
        <Masonry
          items={data}
          columnGutter={12}
          rowGutter={15}
          columnWidth={160}
          maxColumnCount={5}
          overscanBy={2}
          render={({ data: pin }: { data: Pins }) => (
            <div
              key={pin.id}
              className="rounded-[1rem] w-full overflow-hidden fadeIn ${isLoaded ? 'loaded' : ''}"
            >
              <Link to={`/pin/${pin.id}`}>
                <img
                  src={pin.imgPath}
                  alt={pin.title || pin.description || 'Image'}
                  className="rounded-[1rem] border-2 border-solid border-slate-50"
                />
              </Link>
              <section className="flex flex-col px-1 pt-2 gap-[2px]">
                {pin.title ? (
                  <>
                    <Link to={`/pin/${pin.id}`}>
                      <h1 className="font-semibold hover:text-[#76abae]">
                        {pin.title}
                      </h1>
                    </Link>
                  </>
                ) : null}
                <Link
                  to={`/profile/${pin.user.username}`}
                  className="flex flex-row items-center gap-2 hover:underline"
                >
                  <Avatar boxSize={7}></Avatar>
                  <h2 className="text-[0.8rem]">{pin.user.username}</h2>
                </Link>
              </section>
            </div>
          )}
          onRender={() => {
            if (!isLoading && data) {
              document.querySelectorAll('.fadeIn').forEach((element) => {
                element.classList.remove('loaded');
                setTimeout(() => {
                  element.classList.add('loaded');
                }, 0);
              });
            }
          }}
        />
      ) : (
        <div>No pins available</div>
      )}
    </section>
  );
};
export default AllPins;
