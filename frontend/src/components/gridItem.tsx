import { Box, Flex, Image as Img } from 'gestalt';
import { Avatar } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { handleSaveScrollPos } from '@/actions/scroll';
import './css/gestalt.css';
import './css/transitions.css';
interface User {
  id: string;
  username: string;
}
interface Pins {
  dimensions: { width: number; height: number };
  slice: any;
  id: string;
  title: string;
  description: string;
  link: string;
  imgPath: string;
  user: User;
}
export const GridComponent = ({
  data,
  showPins,
}: {
  data: Pins;
  showPins: boolean;
}) => {
  return (
    <div className={`fadeIn ${showPins ? 'loaded' : ''}`}>
      <Box rounding={8} marginBottom={3}>
        <Flex direction="column">
          <Flex.Item dataTestId={data.id}>
            <div key={data.id}>
              <Link to={`/pin/${data.id}`} onClick={handleSaveScrollPos}>
                {data.dimensions && (
                  <Box rounding={5} overflow="hidden">
                    <Img
                      src={data.imgPath}
                      alt={data.title || data.description || 'Image'}
                      naturalWidth={data.dimensions?.width}
                      naturalHeight={data.dimensions?.height}
                    />
                  </Box>
                )}
              </Link>
            </div>
          </Flex.Item>
        </Flex>
      </Box>
    </div>
  );
};
export const GridComponentWithUser = ({
  data,
  showPins,
}: {
  data: Pins;
  showPins: boolean;
}) => {
  return (
    <div className={`fadeIn ${showPins ? 'loaded' : ''}`}>
      <Box rounding={8} marginBottom={3}>
        <Flex direction="column">
          <Flex.Item dataTestId={data.id}>
            <div key={data.id} className={`fadeIn ${showPins ? 'loaded' : ''}`}>
              <Link to={`/pin/${data.id}`} onClick={handleSaveScrollPos}>
                {data.dimensions && (
                  <Box rounding={5} overflow="hidden">
                    <Img
                      src={data.imgPath}
                      alt={data.title || data.description || 'Image'}
                      naturalWidth={data.dimensions?.width}
                      naturalHeight={data.dimensions?.height}
                    />
                  </Box>
                )}
              </Link>
              <section className="flex flex-col px-1 pt-2 gap-[2px]">
                {data.title ? (
                  <>
                    <Link to={`/pin/${data.id}`}>
                      <h1 className="font-semibold hover:text-[#76abae]">
                        {data.title}
                      </h1>
                    </Link>
                  </>
                ) : null}
                <Link
                  to={`/profile/${data.user.username}`}
                  className="flex flex-row items-center gap-2 hover:underline"
                >
                  <Avatar boxSize={7}></Avatar>
                  <h2 className="text-[0.8rem]">{data.user.username}</h2>
                </Link>
              </section>
            </div>
          </Flex.Item>
        </Flex>
      </Box>
    </div>
  );
};
