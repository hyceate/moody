import { Comment, Pin } from '@/@types/interfaces';
import { client, fetchData } from '@/query/fetch';
import { fetchComments, removeCommentGql } from '@/query/queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ProfileAvatar } from './avatar';
import { Link } from 'react-router-dom';
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useToast,
} from '@chakra-ui/react';
import { useAuth } from '@/context/authContext';
import { useState } from 'react';

interface RemoveComment {
  pinId: string;
  commentId: string;
}
interface RemoveResponse {
  deleteComment: {
    success: boolean;
    message: string;
  };
}
export const Comments = ({ pin }: { pin: Pin }) => {
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const getComments = useQuery<Comment[]>({
    queryKey: ['comments', pin.id],
    queryFn: () =>
      fetchData<{ getAllComments: Comment[] }>(fetchComments, {
        pinId: pin.id,
      })
        .then((data) => {
          if (data) {
            return data.getAllComments;
          }
          return [];
        })
        .catch((error) => {
          console.log(error);
          return [];
        }),
  });
  const comments = getComments.data;

  const formatDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp, 10));

    const month = date.toLocaleString('default', { month: 'long' });
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
  };

  const removeComment = useMutation({
    mutationFn: async (input: RemoveComment) => {
      const response: RemoveResponse = await client.request(removeCommentGql, {
        input,
      });
      return response;
    },
    onSuccess: (data) => {
      const removeResponse = data.deleteComment;
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast({
        status: 'success',
        title: removeResponse.message,
        duration: 1000,
      });
    },
  });
  const handleRemoveComment = async (commentId: string) => {
    if (!commentId) return;
    const input = { pinId: pin.id, commentId };
    await removeComment.mutateAsync(input);
  };

  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [updatedCommentText, setUpdatedCommentText] = useState<string>('');
  const handleEditComment = (commentId: string, currentText: string) => {
    setEditingComment(commentId);
    setUpdatedCommentText(currentText);
  };
  const handleUpdateComment = async (commentId: string) => {
    if (!updatedCommentText || !commentId) return;

    const input = {
      commentId,
      updatedComment: updatedCommentText,
    };

    // await updateComment.mutateAsync(input);
  };
  const handleCancelEdit = () => {
    setEditingComment(null);
    setUpdatedCommentText('');
  };

  return (
    <div id="commentsContainer" className="mt-2 w-full overflow-y-auto">
      {comments?.length === 0 && <div>No comments yet!</div>}
      {comments?.map((comment) => (
        <div key={comment.id} className="flex flex-col py-2">
          <div className="flex w-full flex-row items-center gap-2">
            {editingComment === comment.id ? (
              <textarea
                value={updatedCommentText}
                onChange={(e) => setUpdatedCommentText(e.target.value)}
                className="w-full resize-none rounded-md border border-gray-300 p-2 focus:outline-none"
              />
            ) : (
              <>
                <Link
                  to={`/profile/${comment.user.username}`}
                  className="self-start"
                >
                  <div className="aspect-square w-12">
                    <ProfileAvatar
                      size="3rem"
                      src={comment.user.avatarUrl}
                    ></ProfileAvatar>
                  </div>
                </Link>

                <p className="w-full max-w-sm text-wrap">
                  <span className="mr-2 font-bold">
                    <Link
                      to={`/profile/${comment.user.username}`}
                      className="self-start underline-offset-2 hover:underline"
                    >
                      {comment.user.username}
                    </Link>
                  </span>
                  {comment.comment}
                </p>
              </>
            )}
          </div>
          <div className="flex flex-row items-center gap-2">
            <span className="text-sm">{formatDate(comment.createdAt)}</span>
            {isAuthenticated && user && (
              <Menu>
                {(user.id === comment.user.id || user.id === pin.user.id) && (
                  <>
                    {editingComment === comment.id ? (
                      <>
                        <button onClick={() => handleUpdateComment(comment.id)}>
                          Save Changes
                        </button>
                        <button onClick={handleCancelEdit}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <MenuButton
                          _hover={{ background: 'gray.200' }}
                          rounded="100%"
                        >
                          <button className="flex aspect-square flex-col items-center justify-center rounded-full px-2 pb-3 text-xl font-bold">
                            ...
                          </button>
                        </MenuButton>
                        <MenuList zIndex="90">
                          <MenuItem
                            onClick={() =>
                              handleEditComment(comment.id, comment.comment)
                            }
                          >
                            Edit Comment
                          </MenuItem>

                          <MenuItem
                            onClick={() => handleRemoveComment(comment.id)}
                          >
                            Delete Comment
                          </MenuItem>
                        </MenuList>
                      </>
                    )}
                  </>
                )}
              </Menu>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
