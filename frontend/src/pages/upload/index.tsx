import { FormEvent, KeyboardEvent, useEffect, useState } from 'react';
import {
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  Textarea,
  Button,
  Spinner,
} from '@chakra-ui/react';
import {
  ArrowUpIcon,
  SmallCloseIcon,
  ChevronDownIcon,
  CloseIcon,
} from '@chakra-ui/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import request from 'graphql-request';
import { fetchData } from '../../query/fetch';
import './upload.css';
import { useAuth } from '../../context/authContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { createPinMutationSchema, fetchBoardsForForm } from 'query/queries';
import { ProfileAvatar } from '@/components/avatar';

interface PinDetails {
  createPin: {
    pin: {
      id: string;
      board: string;
      title: string | null;
      imgPath: string;
      imgWidth: number;
      imgHeight: number;
      link: string | null;
      tags: [string];
      private: boolean;
    };
  };
}
// component start
export default function Upload() {
  const { isAuthenticated, user } = useAuth();
  const userId = user?.id;
  const username = user?.username;
  const avatar = user?.avatarUrl;
  const [pinDetails, setPinDetails] = useState({
    user: userId,
    board: '',
    title: '',
    description: '',
    link: '',
    img_blob: '',
    imgWidth: 0,
    imgHeight: 0,
    private: 'false',
  });

  const [input, setInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [showLabel, setShowLabel] = useState(true);
  const [showImagePin, setImagePin] = useState(false);
  const [isKeyReleased, setIsKeyReleased] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const [hasFetched, setHasFetched] = useState(false);
  interface Board {
    id: string;
    title: string;
  }
  const endpoint = 'http://localhost:3000/api/graphql';
  const { data, refetch } = useQuery({
    queryKey: ['boards', fetchBoardsForForm, userId, endpoint],
    queryFn: () =>
      fetchData<{ boardsByUser: Board[] }>(endpoint, fetchBoardsForForm, {
        userId,
      }).then((data) => data.boardsByUser),
    enabled: false,
  });
  const uploadImage = async (file: any, userId: any) => {
    try {
      const formData = new FormData();
      formData.append('imgFile', file);
      formData.append('user', userId);
      const response = await axios.post(
        'http://localhost:3000/api/auth/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
          timeout: 3000,
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error uploading image:',
        // @ts-expect-error error type
        error.response ? error.response.data : error.message,
      );
      throw error;
    }
  };
  const navigate = useNavigate();
  const createPinMutation = useMutation({
    mutationFn: async (input) => {
      const endpoint = 'http://localhost:3000/api/graphql';
      const response: PinDetails = await request(
        endpoint,
        createPinMutationSchema,
        {
          input,
        },
      );
      return response;
    },
    onSuccess: (data) => {
      console.log('Mutation successful:', data.createPin.pin);
      setTimeout(() => {
        navigate(`/pin/${data.createPin.pin.id}`);
      }, 3000);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  });
  const upload_img = (event: any, pinDetails: any, setPinDetails: any) => {
    if (event.target.files && event.target.files[0]) {
      if (/image\/*/.test(event.target.files[0].type)) {
        const reader = new FileReader();
        reader.onload = function () {
          setPinDetails({
            ...pinDetails,
            img_blob: reader.result as string,
          });
          setShowLabel(false);
          setImagePin(true);
        };
        setImageFile(event.target.files[0]);
        reader.readAsDataURL(event?.target.files[0]);
      }
    }
  };
  const onKeyUp = () => {
    setIsKeyReleased(true);
  };
  const updateTags = (prevState: string[] | null, newTag: string) => {
    return prevState ? [...prevState, newTag] : [newTag];
  };
  const onKeyDown = (e: KeyboardEvent) => {
    const { key } = e;
    const trimmedInput = input.trim();
    if (key === ',' && trimmedInput.length && !tags.includes(trimmedInput)) {
      e.preventDefault();
      setTags(updateTags(tags, trimmedInput));
      setInput('');
    }
    if (key === 'Backspace' && !input.length && tags.length && isKeyReleased) {
      e.preventDefault();
      const tagsCopy = [...tags];
      const poppedTag = tagsCopy.pop();
      setTags(tagsCopy);
      if (poppedTag) {
        setInput(poppedTag);
      }
    }
    setIsKeyReleased(false);
  };
  const deleteTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
    // @ts-expect-error filter tag
    setPinDetails({ ...pinDetails, tags: newTags });
  };
  const onChange = (e: FormEvent) => {
    const { value }: any = e.target;
    setInput(value);
    // @ts-expect-error filter tag
    setPinDetails({ ...pinDetails, tags: [...tags, value] });
  };
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const { filePath, imgWidth, imgHeight } = await uploadImage(
      imageFile,
      pinDetails.user,
    );
    const imgPath = filePath;
    try {
      const input = {
        user: pinDetails.user,
        title: pinDetails.title,
        description: pinDetails.description,
        link: pinDetails.link,
        board: pinDetails.board,
        tags,
        imgPath,
        imgWidth,
        imgHeight,
      };
      // @ts-expect-error input
      await createPinMutation.mutateAsync(input);
    } catch (error) {
      console.error('Error creating pin:', error);
    }
  };
  const handleSelectClick = () => {
    if (!hasFetched) {
      setHasFetched(true);
    }
  };
  useEffect(() => {
    if (hasFetched) {
      refetch();
    }
    document.title = 'Upload a Pin to moody.';
  }, [hasFetched, refetch]);

  if (!isAuthenticated)
    return (
      <>
        <div className="flex flex-col justify-center items-center min-h-full w-full">
          <div className="flex-auto h-full p-12 max-w-[50rem]">
            <p className="text-3xl text-center">
              You&rsquo;re not logged in! You must have an account to upload a
              pin to moody.
            </p>
          </div>
        </div>
        <Navigate to="#login" replace />
      </>
    );
  return (
    <div className="flex flex-col mt-2 mb-2 drop-shadow-xl max-[1024px]:max-w-[508px] w-full max-w-[63.5rem]">
      <form
        id="upload_pin"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <FormControl
          id="upload_form"
          className="flex flex-col flex-auto max-w-[72rem] justify-center gap-10 p-10 rounded-xl border-2"
        >
          <header className="flex flex-row w-full justify-end">
            <div className="flex w-full max-w-[20rem] gap-1">
              <Select
                id="select-board"
                required
                name="board"
                onChange={(e) =>
                  setPinDetails({
                    ...pinDetails,
                    board: e.target.value,
                  })
                }
                onClick={handleSelectClick}
                icon={<ChevronDownIcon />}
              >
                <option value="" className="p-5 m-6">
                  Choose a board
                </option>
                {!data && (
                  <option>
                    <Spinner size="xl" />
                  </option>
                )}
                {data?.map((board: { id: string; title: string }) => (
                  <option key={board.id} value={board.id}>
                    {board.title}
                  </option>
                ))}
              </Select>
              <Button
                type="submit"
                bg="actions.pink.50"
                color="white"
                _hover={{
                  background: 'actions.pink.100',
                }}
                isLoading={createPinMutation.isSuccess}
              >
                Save Pin
              </Button>
            </div>
          </header>
          <section
            id="form_body"
            className="flex flex-row flex-wrap h-full justify-center gap-10"
          >
            {/* image */}
            <aside className="flex flex-col flex-auto justify-center min-w-[271px] max-w-[23rem] relative">
              {showLabel && !showImagePin ? (
                <div className="flex flex-1 relative">
                  <FormLabel
                    display="flex"
                    margin={0}
                    className="flex-auto flex-col justify-center items-center p-5 rounded-xl h-full min-h-[500px] w-full max-w-[508px] cursor-pointer bg-slate-100 border-slate-400 border-2 border-dashed"
                  >
                    <div className="flex flex-auto flex-col justify-center items-center text-lg uppercase font-semibold">
                      <ArrowUpIcon
                        boxSize={8}
                        rounded="100%"
                        color="#fff"
                        margin={5}
                        fontWeight={900}
                        className="bg-slate-500"
                      />
                      Click to Upload
                    </div>
                    <section className="text-center text-pretty">
                      .jpg, png, .webp less than 20mb
                    </section>
                  </FormLabel>
                </div>
              ) : (
                <>
                  <section className="image_pin max-w-[31.75rem] h-auto flex flex-col flex-auto relative">
                    <img
                      src={pinDetails.img_blob}
                      alt="pin_image"
                      className="object-contain rounded-xl max-h-[44.75rem]"
                    />
                    <button
                      className="absolute top-0 right-0 m-2 w-[2.5rem] aspect-square cursor-pointer rounded-full bg-gray-200 hover:bg-slate-400 hover:text-white hover:outline hover:outline-black flex justify-center items-center"
                      onClick={() => {
                        setImagePin(false);
                        setShowLabel(true);
                        setImageFile(null);
                      }}
                    >
                      <CloseIcon boxSize="1rem" />
                    </button>
                  </section>
                </>
              )}

              <Input
                type="file"
                name="upload_img"
                value=""
                size="md"
                className="hidden"
                variant="unstyled"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(event) =>
                  upload_img(event, pinDetails, setPinDetails)
                }
              />
            </aside>
            {/* pin details */}
            <div className="m-2 w-full max-w-[31.75rem]">
              <ul
                id="form_pin_details"
                className="flex flex-col flex-auto w-full"
              >
                <li>
                  <FormLabel htmlFor="title">Title</FormLabel>
                  <Input
                    variant="outline"
                    type="string"
                    name="title"
                    id="title"
                    height="50px"
                    placeholder="Add your title"
                    _placeholder={{ fontSize: '20px' }}
                    onChange={(e) =>
                      setPinDetails({
                        ...pinDetails,
                        title: e.target.value,
                      })
                    }
                  ></Input>
                </li>

                <li>
                  <FormLabel htmlFor="description">Description</FormLabel>
                  <Textarea
                    variant="outline"
                    name="description"
                    id="description"
                    height="50px"
                    placeholder="Add a Description"
                    _placeholder={{ fontSize: '20px' }}
                    maxLength={500}
                    onChange={(e) =>
                      setPinDetails({
                        ...pinDetails,
                        description: e.target.value,
                      })
                    }
                  ></Textarea>
                </li>
                <li className="userSection">
                  <div className="py-2 flex items-center gap-2">
                    <ProfileAvatar size="4rem" src={avatar} />
                    <h4 className="">{username}</h4>
                  </div>
                </li>
                <li>
                  <FormLabel htmlFor="link">Link</FormLabel>
                  <Input
                    variant="outline"
                    type="textarea"
                    name="link"
                    id="link"
                    height="50px"
                    placeholder="Add a Link"
                    _placeholder={{ fontSize: '20px' }}
                    onChange={(e) =>
                      setPinDetails({
                        ...pinDetails,
                        link: e.target.value,
                      })
                    }
                  ></Input>
                </li>
                <li className="tag-container flex flex-col w-full">
                  <h1 className="text-[1.55rem] text-slate-400">Add Tags</h1>
                  <FormHelperText marginTop="-2px" marginBottom="2px">
                    Press comma to confirm. Tags are not displayed publicly.
                  </FormHelperText>
                  <FormLabel
                    htmlFor="tag-input"
                    display="flex"
                    borderRadius="5px"
                    border="solid"
                    borderWidth={1}
                    borderColor="gray.200"
                    marginTop="5px"
                    paddingInline={3}
                    paddingBlock={2}
                    width="100%"
                  >
                    <ul className="tag_list flex flex-wrap items-center gap-1 w-full min-w-[50%] overflow-scroll">
                      {tags.map((tag, index) => (
                        <li
                          key={index}
                          className="tag bg-slate-600 p-1 rounded-xl text-white flex flex-row items-center"
                        >
                          <div className="px-1 leading-7">{tag}</div>
                          <button
                            onClick={() => deleteTag(index)}
                            className="px-1 font-semibold text-xl"
                          >
                            <SmallCloseIcon />
                          </button>
                        </li>
                      ))}
                      <li>
                        <Input
                          variant="unstyled"
                          type="text"
                          id="tag-input"
                          height="35px"
                          value={input}
                          onKeyUp={onKeyUp}
                          onKeyDown={onKeyDown}
                          onChange={onChange}
                          placeholder="Enter tag"
                          width="100%"
                          minWidth="50%"
                          maxWidth="100%"
                          paddingBlock={2}
                        ></Input>
                      </li>
                    </ul>
                  </FormLabel>
                </li>
              </ul>
            </div>
          </section>
        </FormControl>
      </form>
    </div>
  );
}
