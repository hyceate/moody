import React from 'react';
import { useAuth } from '@/context/authContext';
import {
  Button,
  FormControl,
  FormLabel,
  Switch,
  useToast,
} from '@chakra-ui/react';
import { client } from '@/query/fetch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBoardGql } from '@/query/queries';
import { Board } from '@/@types/interfaces';

interface CreateBoardInput {
  title: string;
  description?: string;
  isPrivate: boolean;
  user: string;
}
interface CreateBoardResponse {
  createBoard: {
    success: boolean;
    message: string;
    board: Board;
  };
}

export const CreateBoard = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuth();
  const toast = useToast();
  const id = user ? user.id : undefined;
  const queryClient = useQueryClient();
  const createBoard = useMutation({
    mutationFn: async (input: CreateBoardInput) => {
      const response: CreateBoardResponse = await client.request(
        createBoardGql,
        { input },
      );
      return response;
    },
    onSuccess: (data) => {
      const createBoard = data.createBoard;
      const status = createBoard.success ? 'success' : 'error';
      if (status === 'success') {
        queryClient.invalidateQueries({ queryKey: ['boards', id] });
        toast({
          status: `${status}`,
          title: `${createBoard.message}`,
          isClosable: true,
          duration: 1000,
        });
        onClose();
      } else {
        toast({
          status: `${status}`,
          title: `${createBoard.message}`,
          isClosable: true,
          duration: 1000,
        });
      }
    },
  });
  const createSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = formData.get('user') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const privateSwitch = document.getElementById(
      'isPrivate',
    ) as HTMLInputElement;
    const privateValue = privateSwitch.checked;
    if (!id) {
      console.error('Missing User');
      return;
    }
    const input: CreateBoardInput = {
      title,
      description,
      isPrivate: privateValue,
      user: id,
    };
    if (input) await createBoard.mutateAsync(input);
  };

  return (
    <section className="flex flex-col items-center justify-center">
      <h1 className="mb-10 text-3xl">Create a moodboard</h1>
      <form
        className="flex w-full flex-col items-center justify-center gap-5"
        onSubmit={createSubmit}
      >
        <input name="user" type="hidden" value={id}></input>
        <FormControl id="new_board" display="flex" flexDir="column" gap="1rem">
          <div className="flex flex-col justify-center px-24">
            <FormLabel htmlFor="title">
              <h2 className="text-xl">Name</h2>
            </FormLabel>
            <input
              name="title"
              type="string"
              className="rounded-[24px] p-3 outline outline-1"
              placeholder="Title of Board"
            ></input>
          </div>

          <div className="flex flex-col justify-center px-24">
            <FormLabel htmlFor="description">
              <h2 className="text-xl">Description</h2>
            </FormLabel>
            <textarea
              name="description"
              className="resize-none overflow-y-hidden rounded-[24px] p-3 outline outline-1"
              placeholder="Description"
              rows={2}
              maxLength={350}
              onInput={(e) => {
                const textarea = e.currentTarget;
                textarea.style.height = 'auto';
                textarea.style.height = `${textarea.scrollHeight}px`;
              }}
            ></textarea>
          </div>

          <div className="mt-5 flex flex-row items-center justify-end self-end">
            <FormLabel
              htmlFor="isPrivate"
              padding="0"
              margin="0"
              marginRight=".5rem"
              fontSize="1.2rem"
            >
              Private
            </FormLabel>
            <Switch
              id="isPrivate"
              name="isPrivate"
              defaultChecked={false}
            ></Switch>
          </div>
        </FormControl>
        <Button
          type="submit"
          bg="actions.pink.50"
          color="white"
          _hover={{
            background: 'actions.pink.100',
          }}
          alignSelf="end"
        >
          Create Board
        </Button>
      </form>
    </section>
  );
};
