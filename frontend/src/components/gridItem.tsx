import { Box, Flex, Image as Img } from 'gestalt';
import { Link } from 'react-router-dom';
import { handleSaveScrollPos } from '@/actions/scroll';
import { Pin as Pins } from '@/@types/interfaces';
import './css/gestalt.css';
import { ProfileAvatar } from './avatar';

export const GridComponent = ({
  data,
  showPins,
}: {
  data: Pins;
  showPins: boolean;
}) => {
  return (
    <div
      className={`fadeIn ${showPins ? 'loaded' : ''}  will-change-transform`}
    >
      <Box rounding={8} marginBottom={3}>
        <Flex direction="column">
          <Flex.Item>
            <div>
              <Link to={`/pin/${data.id}`} onClick={handleSaveScrollPos}>
                {data && (
                  <Box rounding={5} overflow="hidden">
                    <Img
                      src={data.imgPath}
                      alt={data.title || data.description || 'Image'}
                      naturalWidth={data.imgWidth}
                      naturalHeight={data.imgHeight}
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
    <div className={`fadeIn ${showPins ? 'loaded' : ''} will-change-transform`}>
      <Box rounding={8} marginBottom={3}>
        <Flex direction="column">
          <Flex.Item>
            <div>
              <Link to={`/pin/${data.id}`} onClick={handleSaveScrollPos}>
                {data && (
                  <Box rounding={5} overflow="hidden">
                    <Img
                      src={data.imgPath}
                      alt={data.title || data.description || 'Image'}
                      naturalWidth={data.imgWidth}
                      naturalHeight={data.imgHeight}
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
                  <ProfileAvatar size="2rem" src={data.user.avatarUrl} />
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
