import { FormEvent, KeyboardEvent, useEffect, useState } from 'react';
import {
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Avatar,
  Select,
  Textarea,
  Button,
} from '@chakra-ui/react';
import { ArrowUpIcon, SmallCloseIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';
import axios from 'axios';
import { useStore } from '@nanostores/react';
import { $user } from '../../context/userStore';
import './upload.css';
// component start
export default function Upload() {
  const user = useStore($user);
  const userId = user.id && typeof user.id === 'string' ? user.id : '';
  const [pinDetails, setPinDetails] = useState({
    user: userId,
    board: '',
    title: '',
    description: '',
    link: '',
    img_blob: '',
  });

  const [input, setInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [showLabel, setShowLabel] = useState(true);
  const [showImagePin, setImagePin] = useState(false);
  const [isKeyReleased, setIsKeyReleased] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const createPinMutationSchema = `
    mutation CreatePin($input: CreatePinInput!) {
      createPin(input: $input) {
        success
        message
        pin {
          id
          title
          description
          imgPath
          tags
          link
        }
      }
    }
  `;
  const fetchBoardsForForm = `
  query GetBoardsByUser($userId: ID!) {
    boardsByUser(userId: $userId) {
      id
      title
    }
  }
`;
  const [hasFetched, setHasFetched] = useState(false);
  interface Board {
    id: string;
    title: string;
  }
  interface ResponseData {
    boardsByUser: Board[];
  }
  const { data, refetch } = useQuery({
    queryKey: ['boards', fetchBoardsForForm, userId],
    queryFn: async () => {
      try {
        const endpoint = 'http://localhost:3000/api/graphql';
        const response: ResponseData = await request(
          endpoint,
          fetchBoardsForForm,
          {
            userId,
          },
        );
        return response.boardsByUser;
      } catch (error) {
        throw new Error(`Error fetching boards: ${error}`);
      }
    },
    enabled: false, // Do not fetch on mount
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
          // timeout: 5000,
        },
      );

      return response.data.filePath;
    } catch (error) {
      console.error(
        'Error uploading image:',
        // @ts-expect-error error type
        error.response ? error.response.data : error.message,
      );
      throw error; // Re-throw the error for higher-level handling
    }
  };
  const createPinMutation = useMutation({
    mutationFn: async (input) => {
      const endpoint = 'http://localhost:3000/api/graphql';
      const response = await request(endpoint, createPinMutationSchema, {
        input,
      });
      return response;
    },
    onSuccess: (data) => {
      console.log('Mutation successful:', data);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      // Handle the error (e.g., display an error message)
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
    const trimmedInput = input.trim(); // remove whitespace
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
    const imgPath = await uploadImage(imageFile, pinDetails.user);
    try {
      const input = {
        user: pinDetails.user,
        title: pinDetails.title,
        description: pinDetails.description,
        link: pinDetails.link,
        board: pinDetails.board,
        tags,
        imgPath,
      };
      // console.log(input);
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
  console.log(pinDetails);
  return (
    <>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <FormControl
          id="upload_form"
          className="flex flex-col max-w-[72rem] justify-center gap-10 p-10 rounded-xl border-2"
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
                {data?.map((board: { id: string; title: string }) => (
                  <option key={board.id} value={board.id}>
                    {board.title}
                  </option>
                ))}
              </Select>
              <Button
                type="submit"
                className="inline-flex whitespace-nowrap p-2 rounded-xl bg-action text-white font-semibold w-auto items-center"
              >
                Save Pin
              </Button>
            </div>
          </header>
          <section
            id="form_body"
            className="flex flex-row max-w-[72rem] justify-center gap-10 "
          >
            {/* image */}
            <aside className="flex flex-1 justify-center min-w-[271px] h-full max-h-[600px] relative">
              {showLabel && !showImagePin ? (
                <div className="flex flex-1 relative">
                  <FormLabel
                    htmlFor="upload_img"
                    display="flex"
                    margin={0}
                    className="flex-auto flex-col justify-center items-center p-5 rounded-xl  h-full min-h-[400px] cursor-pointer bg-slate-100 border-slate-400 border-2 border-dashed"
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
                <section className="image_pin max-w-[21rem] flex rounded-xl overflow-hidden">
                  <img
                    src={pinDetails.img_blob}
                    alt="pin_image"
                    className="object-contain"
                  />
                </section>
              )}

              <Input
                type="file"
                name="upload_img"
                id="upload_img"
                value=""
                size="md"
                className="hidden"
                variant="unstyled"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={
                  (event) => upload_img(event, pinDetails, setPinDetails) // Pass arguments
                }
              />
            </aside>
            {/* pin details */}
            <div className="m-2 max-w-[20rem]">
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
                <li className="userSection">
                  <div className="py-2 flex items-center gap-2">
                    <Avatar />
                    <h4 className="">&lt; Username will go here &gt;</h4>
                  </div>
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
    </>
  );
}
