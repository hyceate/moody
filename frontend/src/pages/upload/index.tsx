import { FormEvent, KeyboardEvent, useEffect, useState } from 'react';
import {
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Textarea,
  Button,
  Spinner,
  useToast,
  PopoverTrigger,
  Popover,
  PopoverContent,
  PopoverBody,
  PopoverFooter,
  Modal,
  ModalContent,
  ModalOverlay,
  useDisclosure,
  CloseButton,
} from '@chakra-ui/react';
import {
  ArrowUpIcon,
  SmallCloseIcon,
  ChevronDownIcon,
  CloseIcon,
  CheckCircleIcon,
  AddIcon,
  LockIcon,
} from '@chakra-ui/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import request from 'graphql-request';
import { fetchData, endpoint } from '@/query/fetch';
import './upload.css';
import { useAuth } from '@/context/authContext';
import { useNavigate } from 'react-router-dom';
import { createPinMutationSchema, fetchBoardsForForm } from '@/query/queries';
import { ProfileAvatar } from '@/components/avatar';
import { Board, Pin } from '@/@types/interfaces';
import { CreateBoard } from '@/components/createBoard';

interface PinDetails {
  createPin: {
    message: string;
    success: boolean;
    pin: Pin;
  };
}
// component start
export default function Upload() {
  const toast = useToast();
  const navigate = useNavigate();
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
    img_blob: undefined as string | undefined,
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
  const {
    isOpen: isModalOpen,
    onClose: onModalClose,
    onOpen: onModalOpen,
  } = useDisclosure();
  const {
    isOpen: isPopOverOpen,
    onToggle: onPopOverToggle,
    onClose: onPopOverClose,
  } = useDisclosure();

  const { data, refetch } = useQuery({
    queryKey: ['boards', userId],
    queryFn: () =>
      fetchData<{ boardsByUser: Board[] }>(fetchBoardsForForm, {
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

  const createPinMutation = useMutation({
    mutationFn: async (input) => {
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
      const createdPin = data.createPin;
      // console.log('Mutation successful:', createdPin);
      const status = createdPin.success ? 'success' : 'error';
      if (status === `success`) {
        toast({
          render: () => (
            <section className="bg-alert_success flex w-full flex-row flex-wrap items-center justify-start gap-4 rounded-md px-4 py-2 text-white relative">
              
              <div className="flex shrink-0 flex-row flex-wrap items-start self-start">
                <span className="">
                  <CheckCircleIcon color="white" boxSize="1.2rem" />
                </span>
              </div>
              <div>
                <h1 className="text-lg font-bold">{createdPin.message}</h1>
                <p className="text-lg">
                  Go to the{' '}
                  <button
                    onClick={() => navigate(`/pin/${createdPin.pin.id}`)}
                    className="bg-action ml-1 rounded-md px-2 text-lg font-bold text-white"
                  >
                    new pin
                  </button>
                </p>
              </div>
              <button type="button" className="absolute top-0 right-0 p-1" onClick={()=>{toast.closeAll()}}>
                <CloseButton />
              </button>
            </section>
          ),
          isClosable: true,
          duration: 3000,
        });
      } else {
        toast({
          status: `${status}`,
          title: `${createdPin.message}`,
          isClosable: true,
          duration: 3000,
        });
      }
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
    event.stopPropagation();
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
    onPopOverToggle();
    if (!hasFetched) {
      setHasFetched(true);
    }
    refetch();
  };
  useEffect(() => {
    if (hasFetched) {
      refetch();
    }
  }, [hasFetched, refetch]);
  document.title = 'Upload a Pin';
  if (!isAuthenticated)
    return (
      <>
        <div className="flex min-h-full w-full flex-col items-center justify-center">
          <div className="h-full max-w-[50rem] flex-auto p-12">
            <p className="text-center text-3xl">
              You&rsquo;re not logged in! You must have an account to upload a
              pin to moody.
            </p>
          </div>
        </div>
      </>
    );
  return (
    <div className="my-2 flex w-full max-w-[63.5rem] flex-col drop-shadow-xl max-[1024px]:max-w-[508px]">
      <form
        id="upload_pin"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="mt-2 flex h-auto flex-col rounded-2xl px-8 py-10 outline outline-2 outline-slate-300"
      >
        <header className="flex w-full flex-row justify-end">
          <div className="mt-[.3rem] flex w-full max-w-80 gap-1">
            <Popover isLazy isOpen={isPopOverOpen} onClose={onPopOverClose}>
              <PopoverTrigger>
                <button
                  type="button"
                  onClick={handleSelectClick}
                  className="flex w-full flex-row flex-wrap items-center justify-between rounded-lg px-5 outline outline-1 outline-slate-300"
                >
                  <h1>
                    {pinDetails.board
                      ? data?.find((board) => board.id === pinDetails.board)
                          ?.title
                      : 'Choose a board'}
                  </h1>
                  <span>
                    <ChevronDownIcon boxSize="1.5rem" />
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent>
                <PopoverBody padding="0" maxH="14rem" overflowY="scroll">
                  <div className="p-2">
                    {!data && (
                      <div>
                        <Spinner size="xl" />
                      </div>
                    )}
                    {data && data?.length < 1 && <div>No boards</div>}
                    {data?.map(
                      (board: {
                        id: string;
                        title: string;
                        pins: Pin[];
                        isPrivate: boolean;
                      }) => (
                        <button
                          type="button"
                          className="flex w-full px-2"
                          key={board.id}
                          onClick={(e) => {
                            e.preventDefault();
                            setPinDetails({
                              ...pinDetails,
                              board: board.id,
                            });
                            refetch();
                            onPopOverToggle();
                          }}
                        >
                          <div className="flex w-full flex-row flex-wrap items-center gap-4">
                            <div className="aspect-square w-12 overflow-hidden rounded-md">
                              {board.pins.length > 0 && (
                                <img src={board.pins[0].imgPath} />
                              )}
                            </div>
                            <span className="flex w-full flex-1 items-start font-bold">
                              {board.title}
                            </span>
                            {board.isPrivate && (
                              <span className="">
                                <LockIcon />
                              </span>
                            )}
                          </div>
                        </button>
                      ),
                    )}
                  </div>
                </PopoverBody>
                <PopoverFooter padding="0" height="100%" flexGrow="auto">
                  <div className="flex w-full justify-end">
                    <Button
                      type="button"
                      paddingX="20px"
                      paddingY="10px"
                      width="100%"
                      onClick={onModalOpen}
                      display="flex"
                      height="100%"
                      justifyContent="start"
                      gap="20px"
                      bg="transparent"
                    >
                      <span className="bg-action rounded-full p-2 text-white">
                        <AddIcon boxSize={6} />
                      </span>
                      <h1>Create a board</h1>
                    </Button>
                  </div>
                </PopoverFooter>
              </PopoverContent>
            </Popover>
            <div>
              <Button
                type="submit"
                bg="actions.pink.50"
                minW="6rem"
                color="white"
                _hover={{
                  background: 'actions.pink.100',
                }}
                isLoading={createPinMutation.isPending}
              >
                Save Pin
              </Button>
            </div>
          </div>
        </header>

        <section
          id="form_body"
          className="flex h-full flex-row flex-wrap justify-center gap-10"
        >
          {/* image */}
          <aside className="relative flex min-w-[271px] max-w-[23rem] flex-auto flex-col justify-center">
            <FormControl>
              {showLabel && !showImagePin ? (
                <div className="relative flex flex-1">
                  <FormLabel
                    display="flex"
                    margin={0}
                    className="size-full max-h-[35rem] min-h-[500px] max-w-[508px] flex-auto cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-400 bg-slate-100 p-5"
                  >
                    <div className="flex flex-auto flex-col items-center justify-center text-lg font-semibold uppercase">
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
                    <section className="text-pretty text-center">
                      best .jpg, png, .webp less than 5mb
                    </section>
                  </FormLabel>
                </div>
              ) : (
                <>
                  <section
                    id="image_pin"
                    className=" relative flex h-auto max-w-[31.75rem] flex-auto flex-col"
                  >
                    <img
                      src={pinDetails.img_blob}
                      alt="pin_image"
                      className="max-h-[44.75rem] rounded-xl object-contain"
                    />
                    <button
                      className="absolute right-0 top-0 m-2 flex aspect-square w-10 cursor-pointer items-center justify-center rounded-full bg-gray-200 hover:bg-slate-400 hover:text-white hover:outline hover:outline-black"
                      onClick={() => {
                        setImagePin(false);
                        setShowLabel(true);
                        setImageFile(null);
                        setPinDetails({
                          ...pinDetails,
                          img_blob: undefined,
                        });
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
                accept="image/*"
                onInput={(event) => {
                  upload_img(event, pinDetails, setPinDetails);
                }}
              />
            </FormControl>
          </aside>
          {/* pin details */}
          <div className="m-2 w-full max-w-[31.75rem]">
            <ul
              id="form_pin_details"
              className="flex w-full flex-auto flex-col"
            >
              <li>
                <FormControl>
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
                </FormControl>
              </li>

              <li>
                <FormControl>
                  <FormLabel htmlFor="description">Description</FormLabel>
                  <Textarea
                    variant="outline"
                    name="description"
                    id="description"
                    height="50px"
                    placeholder="Add a Description"
                    _placeholder={{ fontSize: '20px' }}
                    maxLength={350}
                    resize="none"
                    onChange={(e) => {
                      const textarea = e.currentTarget;
                      textarea.style.height = 'auto';
                      textarea.style.height = `${textarea.scrollHeight}px`;
                      setPinDetails({
                        ...pinDetails,
                        description: e.target.value,
                      });
                    }}
                  ></Textarea>
                </FormControl>
              </li>
              <li id="userSection" className="">
                <div className="flex items-center gap-2 py-2">
                  <ProfileAvatar size="4rem" src={avatar} />
                  <h4 className="">{username}</h4>
                </div>
              </li>
              <li>
                <FormControl>
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
                </FormControl>
              </li>
              <li id="tag-container" className="flex w-full flex-col">
                <FormControl>
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
                    <ul
                      id="tag_list"
                      className=" flex w-full min-w-[50%] flex-wrap items-center gap-1 overflow-scroll"
                    >
                      {tags.map((tag, index) => (
                        <li
                          key={index}
                          className="tag flex w-auto max-w-60 flex-row flex-wrap items-center overflow-hidden text-wrap break-words rounded-xl bg-slate-600 p-1 text-white"
                        >
                          <div className="max-w-[50rem] text-wrap px-1 leading-7">
                            {tag}
                          </div>
                          <button
                            onClick={() => deleteTag(index)}
                            className="mb-1 px-1 text-xl font-semibold"
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
                </FormControl>
              </li>
            </ul>
          </div>
        </section>
      </form>
      <Modal isOpen={isModalOpen} onClose={onModalClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent rounded="1rem" overflow="hidden">
          <div className="size-full border p-5">
            <CreateBoard onClose={onModalClose} />
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
