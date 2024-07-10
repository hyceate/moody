import { useAuth } from '@/context/authContext';
import { ProfileAvatar } from './avatar';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormEvent } from 'react';
import { Pin } from '@/@types/interfaces';
import { client } from '@/query/fetch';
import { addCommentGql } from '@/query/queries';
import { Button, useToast } from '@chakra-ui/react';

type CommentInput = {
  user: string;
  pinId: string;
  comment: string;
};
interface AppendResponse {
  addComment: {
    success: boolean;
    message: string;
  };
}

export const AddComments = ({ pin }: { pin: Pin }) => {
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();

  const queryClient = useQueryClient();
  const addComment = useMutation({
    mutationFn: async (input: CommentInput) => {
      const response: AppendResponse = await client.request(addCommentGql, {
        input,
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      console.log(data);
    },
  });

  async function handleAddComment(e: FormEvent) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form as HTMLFormElement);
    const pinId = pin.id;
    const commentText = formData.get('comment') as string;

    if (!user) {
      toast({
        status: 'error',
        title: 'User is not authenticated',
      });
      return;
    }

    const input = {
      pinId,
      user: user.id,
      comment: commentText,
    };

    if (!input.comment) {
      toast({
        status: 'error',
        title: 'comment cannot be empty',
      });
      return;
    }
    await addComment.mutateAsync(input);
  }

  if (!isAuthenticated) return null;

  return (
    <>
      {isAuthenticated && user && (
        <div
          id="add_comments"
          className="sticky bottom-0 z-[2] rounded-[0_0_2rem_0] border border-x-0 border-y-2 border-b-0 border-slate-300 bg-white p-5"
        >
          <form
            id="commentForm"
            className="max-w-full px-1"
            onSubmit={handleAddComment}
          >
            <label htmlFor="comment" className="text-xl font-medium">
              What do you think?
            </label>
            <div className="mt-2 flex flex-row items-center justify-between gap-4">
              <div className="aspect-square w-16">
                <ProfileAvatar size="4rem" src={user.avatarUrl} />
              </div>
              <div className="flex w-full flex-row items-stretch rounded-[24px] p-2 outline outline-1 outline-slate-300 focus-within:outline-slate-500">
                <textarea
                  id="comment"
                  name="comment"
                  className="h-auto w-full grow resize-none overflow-hidden whitespace-pre-wrap text-wrap break-words py-2 pr-2 outline-none"
                  rows={1}
                  minLength={3}
                  maxLength={250}
                  onInput={(e) => {
                    const textarea = e.currentTarget;
                    textarea.style.height = 'auto';
                    textarea.style.height = `${textarea.scrollHeight}px`;
                  }}
                  placeholder="Add a Comment"
                ></textarea>
                <div className="inset-y-0 right-0 flex items-center">
                  <Button
                    isLoading={addComment.isPending}
                    type="submit"
                    bg="actions.pink.50"
                    color="white"
                    _hover={{ background: 'actions.pink.100' }}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
