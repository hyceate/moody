import { Board, Pin } from '@/@types/interfaces';
import { useAuth } from '@/context/authContext';
import { client } from '@/query/fetch';
import { deletePinFromBoard } from '@/query/queries';
import { useToast } from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface DeletePinFromBoardInput {
  pinId: string;
  boardId: string;
}
interface Response {
  deletePinFromBoard: {
    success: boolean;
    message: string;
  };
}
export const DeleteFromBoard = ({
  pin,
  board,
  onClose,
}: {
  pin: Pin;
  board: Board;
  onClose: () => void;
}) => {
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();

  const queryClient = useQueryClient();
  const deleteFromBoard = useMutation({
    mutationFn: async ({ pinId, boardId }: DeletePinFromBoardInput) => {
      const response: Response = await client.request(deletePinFromBoard, {
        pinId,
        boardId,
      });
      return response;
    },
    onSuccess: (data) => {
      const deletionReponse = data.deletePinFromBoard;
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      if (deletionReponse.success === true) {
        onClose();
        toast({ status: 'success', title: deletionReponse.message });
      } else {
        toast({ status: 'error', title: deletionReponse.message });
      }
    },
  });

  async function handleDelete() {
    const input = {
      pinId: pin.id,
      boardId: board.id,
    };
    if (isAuthenticated && user?.id === board.user?.id) {
      console.log(input);
      await deleteFromBoard.mutateAsync(input);
    }
  }

  return (
    <div className="flex flex-col p-2">
      <h1 className="text-xl font-bold">
        Are you sure you want to delete the pin from &ldquo;{board.title}
        &rdquo;?
      </h1>
      <div className="flex flex-row gap-2 self-end">
        <button
          type="button"
          className="rounded-md bg-action px-2 py-1 font-bold text-white hover:bg-rose-700"
          onClick={handleDelete}
        >
          Yes
        </button>
        <button
          type="button"
          className="rounded-md bg-slate-200 px-2 py-1 font-bold hover:bg-slate-300"
          onClick={onClose}
        >
          No
        </button>
      </div>
    </div>
  );
};
