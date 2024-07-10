import { Comment } from '@/@types/interfaces';
import { fetchData } from '@/query/fetch';
import { fetchComments } from '@/query/queries';
import { useQuery } from '@tanstack/react-query';
import { ProfileAvatar } from './avatar';
import { Link } from 'react-router-dom';

export const Comments = ({ pinId }: { pinId: string }) => {
  const getComments = useQuery<Comment[]>({
    queryKey: ['comments', pinId],
    queryFn: () =>
      fetchData<{ getAllComments: Comment[] }>(fetchComments, {
        pinId,
      })
        .then((data) => {
          if (data) {
            return data.getAllComments;
          }
          return [];
        })
        .catch(() => {
          return [];
        }),
  });

  if (getComments.isSuccess) {
    console.log(getComments.data);
  }
  const comments = getComments.data;
  console.log(comments);

  return (
    <div
      id="commentsContainer"
      className="mt-2 max-h-72 w-full overflow-y-auto"
    >
      {comments?.length === 0 && <div>No comments yet!</div>}
      {comments?.map((comment) => (
        <div key={comment.id} className="flex flex-col py-2">
          <div className="flex w-full flex-row items-center gap-2">
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
          </div>
        </div>
      ))}
    </div>
  );
};
