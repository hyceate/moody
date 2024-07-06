import { useAuth } from '@/context/authContext';
import { ProfileAvatar } from './avatar';

export const AddComments = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return null;
  return (
    <>
      {isAuthenticated && user && (
        <div
          id="add_comments"
          className="sticky bottom-0 z-[2] rounded-[0_0_2rem_0] border border-x-0 border-y-2 border-b-0 border-slate-300 bg-white p-5"
        >
          <form className="max-w-full px-1">
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
                  <button
                    type="submit"
                    className="mr-3 rounded-lg bg-rose-500 p-2 font-bold text-white "
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
