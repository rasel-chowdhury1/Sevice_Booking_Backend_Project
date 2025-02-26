import mongoose, { Schema, Types, model } from 'mongoose';
import { IMessage } from './message.interface';

const messageSchema = new Schema<IMessage>(
  {
    text: {
      type: String,
      default: null,
    },
    imageUrl: [
      {
        key: {
          type: String,
          default: null,
        },
        url: { type: String, default: null },
      },
    ],
    seen: {
      type: Boolean,
      default: false,
    },
    sender: {
      type: Types.ObjectId,
      required: true,
      ref: 'User',
    },
    receiver: {
      type: Types.ObjectId,
      required: true,
      ref: 'User',
    },

    chat: {
      type: Types.ObjectId,
      required: true,
      ref: 'Chat',
    },
  },
  {
    timestamps: true,
  },
);

const Message = mongoose.model<IMessage>('Message', messageSchema);

export default Message;