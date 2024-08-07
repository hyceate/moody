import { Pin } from '../models/db/pin.model';
import { Board } from '../models/db/board.model';
import { Comment } from '../models/db/comment.model';
import fs from 'fs';
import path from 'path';

export const deletePinById = async (pinId: string) => {
  try {
    const pin = await Pin.findById(pinId);
    if (!pin) {
      throw new Error('Pin not found');
    }
    await Board.updateMany({ pins: pinId }, { $pull: { pins: pinId } });
    const commentsToDelete = await Comment.find({ pin: pinId });
    await Promise.all(
      commentsToDelete.map(async (comment) => {
        await Comment.findByIdAndDelete(comment._id);
      }),
    );
    await Pin.findByIdAndDelete(pinId);

    const imagePath = path.join(
      __dirname,
      `../../../frontend/public/${pin.imgPath}`,
    );

    try {
      fs.unlinkSync(imagePath);
    } catch (err) {
      console.error(`Error deleting image ${imagePath}:`, err);
    }

    return {
      success: true,
      message: 'Pin deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message,
    };
  }
};
